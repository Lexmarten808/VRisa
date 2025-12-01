from django.contrib import admin
from .models import Station


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ('station_id', 's_name', 'lat', 'lon', 's_state', 'institution')
    search_fields = ('s_name',)
    list_filter = ('s_state', 'institution')