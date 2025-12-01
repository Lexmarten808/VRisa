from django.db import models
from django.utils.translation import gettext_lazy as _


class Measurement(models.Model):
    m_id = models.BigAutoField(primary_key=True)
    m_date = models.DateTimeField(_('Fecha de medición'))
    m_value = models.DecimalField(_('Valor'), max_digits=10, decimal_places=4)
    sensor = models.ForeignKey('sensors.Sensor', on_delete=models.RESTRICT, db_column='sensor_id', verbose_name=_('Sensor'))
    variable = models.ForeignKey('variables.Variable', on_delete=models.RESTRICT, db_column='variable_id', verbose_name=_('Variable'))

    class Meta:
        db_table = 'measurement'
        verbose_name = _('Medición')
        verbose_name_plural = _('Mediciones')

    def __str__(self):
        return f"{self.m_date}: {self.m_value}"