from django.db import models
from django.utils.translation import gettext_lazy as _


class Report(models.Model):
    report_id = models.BigAutoField(primary_key=True)
    r_type = models.CharField(_('Tipo'), max_length=50)
    generation_date = models.DateTimeField(_('Generado'), auto_now_add=True)
    r_description = models.TextField(_('Descripción'), blank=True, null=True)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.RESTRICT, db_column='institution_id', verbose_name=_('Institución'))

    class Meta:
        db_table = 'report'
        verbose_name = _('Reporte')
        verbose_name_plural = _('Reportes')


class ReportLog(models.Model):
    log_id = models.BigAutoField(primary_key=True)
    report = models.ForeignKey('reports.Report', on_delete=models.RESTRICT, db_column='report_id', verbose_name=_('Reporte'))
    institution = models.ForeignKey('institutions.Institution', on_delete=models.RESTRICT, db_column='institution_id', verbose_name=_('Institución'))
    created_at = models.DateTimeField(_('Creado en'), auto_now_add=True)
    description = models.TextField(_('Descripción'), blank=True, null=True)

    class Meta:
        db_table = 'report_log'
        verbose_name = _('Log de Reporte')
        verbose_name_plural = _('Logs de Reportes')