from django.contrib import admin
from .models import Sensor


@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ('sensor_id', 's_type', 'installment_date', 's_state', 'station', 'last_calibration_date')
    search_fields = ('s_type',)
    list_filter = ('s_state', 'station')