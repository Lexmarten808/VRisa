from django.db import models
from django.utils.translation import gettext_lazy as _


class Sensor(models.Model):
    sensor_id = models.BigAutoField(primary_key=True)
    s_type = models.CharField(_('Tipo'), max_length=50)
    installment_date = models.DateTimeField(_('Fecha de instalación'), blank=True, null=True)
    s_state = models.CharField(_('Estado'), max_length=20)
    station = models.ForeignKey('stations.Station', on_delete=models.RESTRICT, db_column='station_id', verbose_name=_('Estación'))
    last_calibration_date = models.DateTimeField(_('Última calibración'), blank=True, null=True)

    class Meta:
        db_table = 'sensor'
        verbose_name = _('Sensor')
        verbose_name_plural = _('Sensores')

    def __str__(self):
        return f"{self.sensor_id} ({self.s_type})"