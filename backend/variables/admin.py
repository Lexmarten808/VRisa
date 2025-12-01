from django.contrib import admin
from .models import Variable


@admin.register(Variable)
class VariableAdmin(admin.ModelAdmin):
    list_display = ('v_id', 'v_name', 'v_unit', 'v_type')
    search_fields = ('v_name', 'v_type')