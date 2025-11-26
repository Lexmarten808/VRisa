from rest_framework import serializers
from .models import User, Email, PhoneNumber

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'u_name', 'last_name', 'u_password', 'u_type', 'validated', 'creation_date']
        extra_kwargs = {
            'u_password': {'write_only': True}
        }
