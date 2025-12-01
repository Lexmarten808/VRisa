from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.db import IntegrityError, transaction
import logging
from .models import User, Email, PhoneNumber
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

        return Response({
            "message": "Usuario creado correctamente",
            "user_id": user.id
        }, status=status.HTTP_201_CREATED)
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
