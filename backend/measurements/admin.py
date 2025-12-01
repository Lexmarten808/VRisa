from django.contrib import admin
from .models import Measurement


@admin.register(Measurement)
class MeasurementAdmin(admin.ModelAdmin):
    list_display = ('m_id', 'm_date', 'm_value', 'sensor', 'variable')
    search_fields = ('m_value',)
    list_filter = ('m_date', 'sensor', 'variable')