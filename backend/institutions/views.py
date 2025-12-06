from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.db import transaction, IntegrityError
from .models import Institution
from .serializers import InstitutionSerializer
from stations.models import Station
from stations.serializers import StationSerializer
from users.models import User, Email
from users.views import approve_user


class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        admin_id = self.request.query_params.get('admin_id')
        if admin_id:
            qs = qs.filter(admin_id=admin_id)
        return qs

    @action(detail=True, methods=['get'])
    def stations(self, request, pk=None):
        try:
            inst = self.get_queryset().filter(pk=pk).first()
            if not inst:
                return Response({'error': 'Institución no encontrada'}, status=404)
            qs = Station.objects.filter(institution=inst).select_related('institution').order_by('-station_id')
            data = StationSerializer(qs, many=True).data
            return Response(data)
        except Exception as ex:
            return Response({'error': 'No se pudo listar estaciones', 'detail': str(ex)}, status=500)


# Atomic creation of institution + user (institution account)
@api_view(['POST'])
def register_institution_with_user(request):
    i_name = (request.data.get('i_name') or '').strip()
    street = request.data.get('street')
    neighborhood = request.data.get('neighborhood')
    color_set = request.data.get('color_set')
    logo = request.data.get('logo')  # optional: store filename only
    email = (request.data.get('email') or '').strip()
    password = (request.data.get('password') or '').strip()

    if not i_name or not email or not password:
        return Response({'error': 'Faltan campos obligatorios (i_name, email, password)'}, status=400)

    # Prevent duplicate email
    if Email.objects.filter(email__iexact=email).exists():
        return Response({'error': 'El correo ya existe'}, status=400)

    try:
        with transaction.atomic():
            user = User.objects.create(
                u_name=i_name,
                last_name='Institución',
                u_password=password,
                u_type='institucion',
                validated=False,
            )
            Email.objects.create(u_id=user, email=email)

            inst = Institution.objects.create(
                i_name=i_name,
                street=street or None,
                neighborhood=neighborhood or None,
                color_set=color_set or None,
                logo=(logo or None),
                validated=False,
                admin_id=user
            )

        return Response({
            'message': 'Institución y usuario creados',
            'institution_id': inst.institution_id,
            'admin_user_id': user.id
        }, status=status.HTTP_201_CREATED)
    except IntegrityError as ie:
        return Response({'error': 'Conflicto de datos', 'detail': str(ie)}, status=400)
    except Exception as ex:
        return Response({'error': 'Error del servidor', 'detail': str(ex)}, status=500)


@api_view(['POST'])
def approve_institution(request, institution_id: int):
    try:
        inst = Institution.objects.filter(institution_id=institution_id).select_related('admin_id').first()
        if not inst:
            return Response({'error': 'Institución no encontrada'}, status=404)
        if inst.validated:
            return Response({'message': 'Ya estaba validada'})
        inst.validated = True
        inst.save(update_fields=['validated'])
        # Validate the admin user representing the institution
        admin_user = inst.admin_id
        if admin_user and not admin_user.validated:
            admin_user.validated = True
            admin_user.save(update_fields=['validated'])
        return Response({'message': 'Institución y usuario validados', 'institution_id': inst.institution_id, 'admin_user_id': admin_user.id if admin_user else None})
    except Exception as ex:
        return Response({'error': 'Error validando institución', 'detail': str(ex)}, status=500)