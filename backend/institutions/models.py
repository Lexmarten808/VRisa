from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import User


class Institution(models.Model):
    institution_id = models.BigAutoField(primary_key=True)
    i_name = models.CharField(_('Nombre'), max_length=100)
    logo = models.CharField(_('Logo'), max_length=100, blank=True, null=True)
    color_set = models.CharField(_('Conjunto de colores'), max_length=50, blank=True, null=True)
    street = models.CharField(_('Calle'), max_length=100, blank=True, null=True)
    neighborhood = models.CharField(_('Barrio'), max_length=100, blank=True, null=True)
    validated = models.BooleanField(_('Validada'), default=False)
    admin_id = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column='admin_id', related_name='institutions_administered')

    class Meta:
        db_table = 'institution'
        verbose_name = _('Institución')
        verbose_name_plural = _('Instituciones')

    def __str__(self):
        return self.i_name or _('Institución')
