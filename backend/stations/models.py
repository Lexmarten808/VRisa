from django.db import models
from django.utils.translation import gettext_lazy as _


class Station(models.Model):
    station_id = models.BigAutoField(primary_key=True)
    s_name = models.CharField(_('Nombre'), max_length=100)
    lat = models.DecimalField(_('Latitud'), max_digits=9, decimal_places=6)
    lon = models.DecimalField(_('Longitud'), max_digits=9, decimal_places=6)
    calibration_certificate = models.CharField(_('Certificado de calibración'), max_length=100, blank=True, null=True)
    maintenance_date = models.DateTimeField(_('Fecha de mantenimiento'), blank=True, null=True)
    admin_id = models.ForeignKey('users.User', on_delete=models.RESTRICT, db_column='admin_id', verbose_name=_('Administrador'), null=True, blank=True)
    s_state = models.CharField(_('Estado'), max_length=20)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.SET_NULL, db_column='institution_id', null=True, blank=True, verbose_name=_('Institución'))

    class Meta:
        db_table = 'station'
        verbose_name = _('Estación')
        verbose_name_plural = _('Estaciones')

    def __str__(self):
        return f"{self.station_id} - {self.s_name}"
