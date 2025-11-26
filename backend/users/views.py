from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import User, Email, PhoneNumber
from .serializers import UserSerializer


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

    if not u_name or not last_name or not u_password:
        return Response({"error": "Missing required fields"}, status=400)

    if Email.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    if PhoneNumber.objects.filter(p_number=phone).exists():
        return Response({"error": "Phone number already exists"}, status=400)

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
        "message": "User created successfully",
        "user_id": user.id
    }, status=status.HTTP_201_CREATED)


# ======================
#  LOGIN
# ======================
@api_view(['POST'])
def login_user(request):
    identifier = request.data.get('identifier')
    password = request.data.get('password')

    email_obj = Email.objects.filter(email=identifier).first()
    phone_obj = PhoneNumber.objects.filter(p_number=identifier).first()

    user = None
    if email_obj:
        user = email_obj.u_id
    elif phone_obj:
        user = phone_obj.u_id

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
