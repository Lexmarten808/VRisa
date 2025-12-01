from rest_framework import serializers
from .models import Sensor


class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = ['sensor_id', 's_type', 'installment_date', 's_state', 'station', 'last_calibration_date']