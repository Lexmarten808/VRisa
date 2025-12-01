from django.contrib import admin
from .models import Institution


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('institution_id', 'i_name', 'logo', 'color_set', 'street', 'neighborhood', 'validated')
    search_fields = ('i_name', 'street', 'neighborhood')