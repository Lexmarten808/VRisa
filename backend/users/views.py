from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.db import IntegrityError, transaction
import logging
from .models import User, Email, PhoneNumber
from stations.models import Station
from .serializers import UserSerializer

logger = logging.getLogger(__name__)


# ======================
#  REGISTER
# ======================
@api_view(['POST'])
def register_user(request):
    u_name = request.data.get("u_name")
    last_name = request.data.get("last_name")
    u_password = request.data.get("u_password")
    u_type = request.data.get("u_type", "regular")
    email = request.data.get("email")
    phone = request.data.get("phone")
    try:
        if not u_name or not last_name or not u_password:
            return Response({"error": "Faltan campos obligatorios"}, status=400)

        if email and Email.objects.filter(email=email).exists():
            return Response({"error": "El correo ya existe"}, status=400)

        if phone and PhoneNumber.objects.filter(p_number=phone).exists():
            return Response({"error": "El teléfono ya existe"}, status=400)

        with transaction.atomic():
            user = User.objects.create(
                u_name=u_name,
                last_name=last_name,
                u_password=u_password,
                u_type=u_type
            )

            if email:
                Email.objects.create(u_id=user, email=email)

            if phone:
                PhoneNumber.objects.create(u_id=user, p_number=phone)

            # If a station_id was provided and the user should be its admin, assign it.
            station_id = request.data.get('station_id')
            station_assignment = {"assigned": False, "station_id": None, "reason": None}
            if station_id and u_type == 'admin':
                try:
                    # Use update() to avoid selecting columns that may not exist in the DB schema.
                    station_assignment['station_id'] = station_id
                    updated = Station.objects.filter(station_id=station_id, admin_id__isnull=True).update(admin_id=user)
                    if updated:
                        station_assignment['assigned'] = True
                    else:
                        # determine reason without selecting all station columns
                        exists = Station.objects.filter(station_id=station_id).exists()
                        station_assignment['reason'] = 'station not found' if not exists else 'station already has admin'
                except Exception:
                    logger.exception('Failed to assign station admin for station_id=%s', station_id)
                    station_assignment['reason'] = 'assignment error'

        resp_body = {
            "message": "Usuario creado correctamente",
            "user_id": user.id
        }
        # include station assignment info when applicable
        if 'station_assignment' in locals():
            resp_body['station_assignment'] = station_assignment

        return Response(resp_body, status=status.HTTP_201_CREATED)
    except IntegrityError as ie:
        logger.exception("Integrity error on register_user")
        return Response({"error": "Conflicto de datos (duplicado o inválido)", "detail": str(ie)}, status=400)
    except Exception as ex:
        logger.exception("Unexpected error on register_user")
        return Response({"error": "Error del servidor", "detail": str(ex)}, status=500)


# ======================
#  LOGIN
# ======================
@api_view(['POST'])
def login_user(request):
    identifier = (request.data.get('identifier') or '').strip()
    password = (request.data.get('password') or '').strip()

    if not identifier or not password:
        return Response({"error": "Missing credentials"}, status=400)

    # Case-insensitive match for email, exact for phone
    email_obj = None
    phone_obj = None

    if '@' in identifier:
        email_obj = Email.objects.filter(email__iexact=identifier).first()
    else:
        phone_obj = PhoneNumber.objects.filter(p_number=identifier).first()

    user = None
    if email_obj:
        user = email_obj.u_id
    elif phone_obj:
        user = phone_obj.u_id

    if not user:
        # try secondary lookup: in case user typed phone with spaces or email with caps
        if '@' in identifier:
            email_obj = Email.objects.filter(email__iexact=identifier.lower()).first()
            user = email_obj.u_id if email_obj else None
        else:
            normalized_phone = identifier.replace(' ', '')
            phone_obj = PhoneNumber.objects.filter(p_number=normalized_phone).first()
            user = phone_obj.u_id if phone_obj else None
        if not user:
            return Response({"error": "User not found"}, status=404)

    # Block login for unvalidated users
    if not user.validated:
        return Response({"error": "El usuario no ha sido validado por el administrador"}, status=403)

    if user.u_password != password:
        return Response({"error": "Invalid password"}, status=400)

    return Response({
        "message": "Login successful",
        "user_id": user.id,
        "name": user.u_name,
        "last_name": user.last_name,
        "u_type": user.u_type
    })


# Simple health endpoint to verify API is reachable
@api_view(['GET'])
def health(request):
    return Response({"status": "ok"})


# ======================
#  ADMIN: PENDING USERS
# ======================
@api_view(['GET'])
def pending_users(request):
    try:
        users = User.objects.filter(validated=False).order_by('-creation_date')
        data = []
        for u in users:
            email = Email.objects.filter(u_id=u).first()
            data.append({
                'id': u.id,
                'u_name': u.u_name,
                'last_name': u.last_name,
                'u_type': u.u_type,
                'email': email.email if email else None,
                'validated': u.validated,
                'creation_date': u.creation_date
            })
        return Response({'results': data})
    except Exception as ex:
        logger.exception('Error fetching pending users')
        return Response({'error': 'Error fetching pending users', 'detail': str(ex)}, status=500)


@api_view(['POST'])
def approve_user(request, user_id: int):
    try:
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({'error': 'User not found'}, status=404)
        if user.validated:
            return Response({'message': 'User already validated'})
        user.validated = True
        user.save(update_fields=['validated'])
        return Response({'message': 'User approved', 'user_id': user.id})
    except Exception as ex:
        logger.exception('Error approving user')
        return Response({'error': 'Error approving user', 'detail': str(ex)}, status=500)


@api_view(['POST'])
def reject_user(request, user_id: int):
    try:
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({'error': 'User not found'}, status=404)
        # Cascade delete will remove related emails/phones
        user.delete()
        return Response({'message': 'User rejected and removed', 'user_id': user_id})
    except Exception as ex:
        logger.exception('Error rejecting user')
        return Response({'error': 'Error rejecting user', 'detail': str(ex)}, status=500)


# ======================
#  USER STATUS BY EMAIL
# ======================
@api_view(['GET'])
def user_status(request):
    try:
        email = (request.query_params.get('email') or '').strip()
        if not email:
            return Response({'error': 'Missing email'}, status=400)
        email_obj = Email.objects.filter(email__iexact=email).first()
        if not email_obj:
            return Response({'exists': False, 'validated': False})
        user = email_obj.u_id
        return Response({
            'exists': True,
            'validated': user.validated,
            'user_id': user.id,
            'u_type': user.u_type,
            'u_name': user.u_name,
            'last_name': user.last_name,
            'email': email_obj.email
        })
    except Exception as ex:
        logger.exception('Error fetching user status')
        return Response({'error': 'Error fetching status', 'detail': str(ex)}, status=500)


@api_view(['GET'])
def user_detail(request, user_id: int):
    try:
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({'error': 'User not found'}, status=404)
        email = Email.objects.filter(u_id=user).first()
        return Response({
            'user_id': user.id,
            'u_name': user.u_name,
            'last_name': user.last_name,
            'u_type': user.u_type,
            'email': email.email if email else None,
        })
    except Exception as ex:
        logger.exception('Error fetching user detail')
        return Response({'error': 'Error fetching user', 'detail': str(ex)}, status=500)
