from rest_framework import serializers
from .models import Station, StationRequest, StationCredential


class InstitutionNestedSerializer(serializers.Serializer):
    institution_id = serializers.IntegerField()
    i_name = serializers.CharField()


class UserNestedSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    u_name = serializers.CharField()
    last_name = serializers.CharField(allow_blank=True, required=False)


class StationSerializer(serializers.ModelSerializer):
    institution = InstitutionNestedSerializer(read_only=True)
    # Optional nested fields for connection requests; may be absent on DDL-only DBs
    requested_institution = InstitutionNestedSerializer(read_only=True)
    request_submitted_by = UserNestedSerializer(read_only=True)
    class Meta:
        model = Station
        fields = [
            'station_id', 's_name', 'lat', 'lon', 'calibration_certificate', 'maintenance_date',
            'admin_id', 's_state', 'institution',
            'requested_institution', 'request_submitted_by'
        ]


class StationRequestSerializer(serializers.ModelSerializer):
    # Asegurar que DRF trate lat/lon como texto aunque haya migraciones pendientes
    lat = serializers.CharField()
    lon = serializers.CharField()
    class Meta:
        model = StationRequest
        fields = [
            'request_id', 'institution', 'submitted_by', 's_name', 'lat', 'lon', 'sensor_type',
            'variables', 'responsible', 'calibration_doc', 'maintenance_doc', 'status',
            'submitted_at', 'decision_at', 'decision_by', 'notes'
        ]
        read_only_fields = ['request_id', 'status', 'submitted_at', 'decision_at', 'decision_by']


class StationCredentialSerializer(serializers.ModelSerializer):
    class Meta:
        model = StationCredential
        fields = ['station', 'api_key', 'secret', 'created_at']
        read_only_fields = ['created_at']