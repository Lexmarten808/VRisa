from rest_framework import serializers
from .models import Institution


class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['institution_id', 'i_name', 'logo', 'color_set', 'street', 'neighborhood', 'validated']