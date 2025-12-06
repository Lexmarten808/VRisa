from django.db import models
from django.utils.translation import gettext_lazy as _


class Station(models.Model):
    station_id = models.BigAutoField(primary_key=True)
    s_name = models.CharField(_('Nombre'), max_length=100)
    # Permitir valores de prueba sin validar formato numérico
    lat = models.CharField(_('Latitud'), max_length=32)
    lon = models.CharField(_('Longitud'), max_length=32)
    calibration_certificate = models.CharField(_('Certificado de calibración'), max_length=100, blank=True, null=True)
    maintenance_date = models.DateTimeField(_('Fecha de mantenimiento'), blank=True, null=True)
    admin_id = models.ForeignKey('users.User', on_delete=models.RESTRICT, db_column='admin_id', verbose_name=_('Administrador'), null=True, blank=True)
    s_state = models.CharField(_('Estado'), max_length=20)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.SET_NULL, db_column='institution_id', null=True, blank=True, verbose_name=_('Institución'))
    # Campos para solicitudes de conexión sin tablas adicionales
    requested_institution = models.ForeignKey('institutions.Institution', on_delete=models.SET_NULL, db_column='requested_institution_id', null=True, blank=True, related_name='station_connection_requests', verbose_name=_('Institución solicitada'))
    request_status = models.CharField(_('Estado de solicitud'), max_length=20, blank=True, null=True)
    request_submitted_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, db_column='request_submitted_by', null=True, blank=True, related_name='station_connection_requests_submitted', verbose_name=_('Solicitud enviada por'))

    class Meta:
        db_table = 'station'
        verbose_name = _('Estación')
        verbose_name_plural = _('Estaciones')

    def __str__(self):
        return f"{self.station_id} - {self.s_name}"


class StationRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    request_id = models.BigAutoField(primary_key=True)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, db_column='institution_id', verbose_name=_('Institución'))
    submitted_by = models.ForeignKey('users.User', on_delete=models.CASCADE, db_column='submitted_by', related_name='station_requests', verbose_name=_('Solicitado por'))
    s_name = models.CharField(_('Nombre de Estación'), max_length=120)
    lat = models.DecimalField(_('Latitud'), max_digits=9, decimal_places=6)
    lon = models.DecimalField(_('Longitud'), max_digits=9, decimal_places=6)
    sensor_type = models.CharField(_('Tipo de Sensor'), max_length=120)
    variables = models.TextField(_('Variables'), help_text=_('Lista separada por comas'), blank=True)
    responsible = models.CharField(_('Responsable Técnico'), max_length=120)
    calibration_doc = models.CharField(_('Certificado de calibración'), max_length=200, blank=True, null=True)
    maintenance_doc = models.CharField(_('Documento de mantenimiento'), max_length=200, blank=True, null=True)
    status = models.CharField(_('Estado'), max_length=16, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(_('Fecha de solicitud'), auto_now_add=True)
    decision_at = models.DateTimeField(_('Fecha de decisión'), null=True, blank=True)
    decision_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='station_requests_decided', verbose_name=_('Decidido por'))
    notes = models.TextField(_('Notas'), blank=True)

    class Meta:
        db_table = 'station_request'
        verbose_name = _('Solicitud de Estación')
        verbose_name_plural = _('Solicitudes de Estación')


class StationCredential(models.Model):
    station = models.OneToOneField(Station, on_delete=models.CASCADE, related_name='credentials')
    api_key = models.CharField(max_length=64)
    secret = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'station_credentials'
