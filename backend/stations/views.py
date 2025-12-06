from django.db.utils import ProgrammingError
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response
from institutions.models import Institution
from .models import Station
from .serializers import StationSerializer


class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer

    def get_queryset(self):
        qs = super().get_queryset().select_related('institution')
        # Select only known columns to avoid referencing request-related columns
        qs = qs.only('station_id', 's_name', 'lat', 'lon', 'calibration_certificate', 'maintenance_date', 'admin_id', 's_state', 'institution')
        institution_admin = self.request.query_params.get('institution_admin')
        admin_id = self.request.query_params.get('admin_id')
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