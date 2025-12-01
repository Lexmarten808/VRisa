from django.db import models
from django.utils.translation import gettext_lazy as _


class Variable(models.Model):
    v_id = models.BigAutoField(primary_key=True)
    v_name = models.CharField(_('Nombre'), max_length=100)
    v_unit = models.CharField(_('Unidad'), max_length=20)
    v_type = models.CharField(_('Tipo'), max_length=50)

    class Meta:
        db_table = 'variable'
        verbose_name = _('Variable')
        verbose_name_plural = _('Variables')

    def __str__(self):
        return f"{self.v_name} ({self.v_unit})"