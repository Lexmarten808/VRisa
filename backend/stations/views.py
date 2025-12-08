from django.db.utils import ProgrammingError
import logging
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response
from institutions.models import Institution
from users.models import User
from .models import Station
from .serializers import StationSerializer

logger = logging.getLogger(__name__)


class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer

    def create(self, request, *args, **kwargs):
        """Create station using a minimal, schema-safe INSERT.
        This bypasses ModelSerializer default create so we don't attempt
        to write columns that don't exist in the database (e.g., request-related fields).
        Inserts only into the subset of columns that are actually present.
        """
        from django.db import connection, transaction

        payload = request.data or {}
        # columns that are present in the current DB schema (observed)
        allowed_columns = [
            's_name', 'lat', 'lon', 'calibration_certificate',
            'maintenance_date', 'admin_id', 's_state', 'institution_id'
        ]

        cols = []
        vals = []
        for c in allowed_columns:
            if c in payload and payload.get(c) is not None:
                cols.append(c)
                vals.append(payload.get(c))

        if not cols:
            return Response({'error': 'No valid station fields provided'}, status=status.HTTP_400_BAD_REQUEST)

        col_list = ', '.join(f'"{c}"' for c in cols)
        placeholders = ', '.join(['%s'] * len(vals))
        returning = ', '.join(['station_id', 's_name', 'lat', 'lon', 'calibration_certificate', 'maintenance_date', 'admin_id', 's_state', 'institution_id'])
        sql = f'INSERT INTO "station" ({col_list}) VALUES ({placeholders}) RETURNING {returning};'

        try:
            with transaction.atomic():
                with connection.cursor() as cur:
                    cur.execute(sql, vals)
                    row = cur.fetchone()
        except Exception as exc:
            logger.exception('Failed to create station via raw INSERT')
            return Response({'error': 'DB error creating station', 'detail': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if not row:
            return Response({'error': 'Unknown error creating station'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        keys = ['station_id', 's_name', 'lat', 'lon', 'calibration_certificate', 'maintenance_date', 'admin_id', 's_state', 'institution_id']
        result = dict(zip(keys, row))
        # convert bytes to str where applicable
        for k, v in result.items():
            if isinstance(v, bytes):
                try:
                    result[k] = v.decode()
                except Exception:
                    pass

        return Response(result, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        qs = super().get_queryset().select_related('institution')
        # Select only known columns to avoid referencing request-related columns
        qs = qs.only('station_id', 's_name', 'lat', 'lon', 'calibration_certificate', 'maintenance_date', 'admin_id', 's_state', 'institution')
        institution_admin = self.request.query_params.get('institution_admin')
        admin_id = self.request.query_params.get('admin_id')
        # Try to detect current user id from common locations (query param or header)
        current_user_id = None
        if not admin_id:
            current_user_id = self.request.query_params.get('current_user_id') or self.request.query_params.get('user_id')
            if not current_user_id:
                # header 'X-User-Id' if frontend sets it
                current_user_id = self.request.META.get('HTTP_X_USER_ID')
        # Note: request-related filters removed to be compatible with DDL/DML-only setups
        # Apply filters but guard against missing DB columns (e.g., schema not migrated)
        try:
            if institution_admin:
                qs = qs.filter(institution__admin_id=institution_admin)
        except ProgrammingError:
            # Column may be missing in DB (legacy schema); skip the filter to avoid 500
            pass
        try:
            if admin_id:
                qs = qs.filter(admin_id=admin_id)
            else:
                # if frontend provided a current user id and that user is a station admin, restrict to their stations
                if current_user_id:
                    try:
                        u = User.objects.filter(id=current_user_id).only('id', 'u_type').first()
                        if u and (u.u_type == 'admin' or u.u_type == 'station_admin'):
                            qs = qs.filter(admin_id=u.id)
                    except Exception:
                        # ignore user lookup issues and do not apply the filter
                        pass
                else:
                    # If request.user is set and is our User model, and is of type admin, apply filter
                    try:
                        ru = getattr(self.request, 'user', None)
                        if ru and hasattr(ru, 'id') and hasattr(ru, 'u_type') and (ru.u_type == 'admin' or ru.u_type == 'station_admin'):
                            qs = qs.filter(admin_id=ru.id)
                    except Exception:
                        pass
        except ProgrammingError:
            pass
        # no request-related filters
        return qs.order_by('-station_id')


    def list(self, request, *args, **kwargs):
        """Override list to guard against schema mismatches that cause ProgrammingError during serialization.
        If serialization fails because a column is missing (e.g., `requested_institution_id`),
        return a minimal, safe representation instead of raising 500.
        """
        try:
            return super().list(request, *args, **kwargs)
        except ProgrammingError as ex:
            # Fallback: return minimal station data using values() to avoid model relation access
            qs = self.get_queryset().values('station_id', 's_name', 'lat', 'lon', 'admin_id', 's_state', 'institution_id')
            return Response({'message': 'Partial response due to missing DB columns', 'results': list(qs)})

    @action(detail=True, methods=['post'])
    def approve_connection(self, request, pk=None):
        """Approve a station connection by setting its `institution` FK to the provided institution_id.
        Request payload: { "institution_id": <id>, "admin_id": <id (optional)> }
        This endpoint performs minimal checks and will set `s_state` to 'approved'.
        """
        qs = Station.objects.filter(pk=pk)
        if not qs.exists():
            return Response({'error': 'Estación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        institution_id = request.data.get('institution_id')
        if not institution_id:
            return Response({'error': 'Falta institution_id en la petición'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            inst = Institution.objects.get(pk=institution_id)
        except Institution.DoesNotExist:
            return Response({'error': 'Institución no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        # Optional admin check: if admin_id provided, ensure it matches institution.admin_id
        admin_id = request.data.get('admin_id')
        try:
            if admin_id and inst.admin_id and str(inst.admin_id.id) != str(admin_id):
                return Response({'error': 'Solo el administrador de la institución puede aprobar'}, status=status.HTTP_403_FORBIDDEN)
        except Exception:
            # ignore unexpected comparison errors and proceed conservatively
            pass
        # Perform update without loading model fields that may be missing in DB
        qs.update(institution_id=inst.institution_id, s_state='approved')
        return Response({'message': 'Estación aprobada', 'station_id': int(pk), 'institution_id': int(inst.institution_id)})

    @action(detail=True, methods=['get'])
    def address(self, request, pk=None):
        """Return a friendly address for the station.
        Strategy:
        - Try to read station lat/lon and institution_id using values() to avoid selecting non-existent columns.
        - If the station has an institution, return the institution street/neighborhood/i_name if available.
        - Otherwise, return a lat/lon string as fallback.
        """
        try:
            st = Station.objects.filter(pk=pk).values('station_id', 's_name', 'lat', 'lon', 'institution_id').first()
        except ProgrammingError:
            return Response({'error': 'No se pudo leer la información de la estación'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        if not st:
            return Response({'error': 'Estación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        inst_id = st.get('institution_id')
        if inst_id:
            try:
                inst = Institution.objects.filter(pk=inst_id).values('i_name', 'street', 'neighborhood').first()
                if inst:
                    parts = []
                    if inst.get('street'):
                        parts.append(inst.get('street'))
                    if inst.get('neighborhood'):
                        parts.append(inst.get('neighborhood'))
                    if inst.get('i_name'):
                        parts.append(inst.get('i_name'))
                    address = ', '.join(parts) if parts else inst.get('i_name')
                    return Response({'address': address, 'source': 'institution'})
            except Exception:
                # ignore and fall back to lat/lon
                pass
        # Fallback: use lat/lon if present
        lat = st.get('lat')
        lon = st.get('lon')
        if lat and lon:
            return Response({'address': f'Lat: {lat}, Lon: {lon}', 'source': 'latlon'})
        return Response({'address': 'Ubicación no disponible', 'source': 'none'})

    @action(detail=True, methods=['post'])
    def set_state(self, request, pk=None):
        """Set the station's s_state to one of: active, inactive, maintenance.
        Payload: { "s_state": "active" }
        Uses QuerySet.update() to avoid selecting missing columns in legacy schemas.
        """
        allowed = {
            'active': 'active',
            'activo': 'active',
            'inactive': 'inactive',
            'inactivo': 'inactive',
            'maintenance': 'maintenance',
            'mantenimiento': 'maintenance'
        }
        s_state_raw = (request.data.get('s_state') or '').strip().lower()
        if not s_state_raw:
            return Response({'error': 'Missing s_state'}, status=status.HTTP_400_BAD_REQUEST)
        new_state = allowed.get(s_state_raw)
        if not new_state:
            return Response({'error': 'Invalid s_state'}, status=status.HTTP_400_BAD_REQUEST)

        qs = Station.objects.filter(pk=pk)
        if not qs.exists():
            return Response({'error': 'Estación no encontrada'}, status=status.HTTP_404_NOT_FOUND)

        try:
            qs.update(s_state=new_state)
            return Response({'message': 'Estado actualizado', 'station_id': int(pk), 's_state': new_state})
        except Exception as ex:
            # Be defensive against schema issues
            logger.exception('Failed to update station state')
            return Response({'error': 'No se pudo actualizar el estado', 'detail': str(ex)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)