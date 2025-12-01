from rest_framework import serializers
from .models import Station


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = ['station_id', 's_name', 'lat', 'lon', 'calibration_certificate', 'maintenance_date', 'admin_id', 's_state', 'institution']