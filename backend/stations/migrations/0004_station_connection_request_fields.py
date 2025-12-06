from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('institutions', '0001_initial'),
        ('users', '0005_remove_email_id_remove_phonenumber_id_email_email_id_and_more'),
        ('stations', '0003_station_requests'),
    ]

    operations = [
        migrations.AddField(
            model_name='station',
            name='request_status',
            field=models.CharField(blank=True, max_length=20, null=True, verbose_name='Estado de solicitud'),
        ),
        migrations.AddField(
            model_name='station',
            name='request_submitted_by',
            field=models.ForeignKey(blank=True, db_column='request_submitted_by', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='station_connection_requests_submitted', to='users.user', verbose_name='Solicitud enviada por'),
        ),
        migrations.AddField(
            model_name='station',
            name='requested_institution',
            field=models.ForeignKey(blank=True, db_column='requested_institution_id', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='station_connection_requests', to='institutions.institution', verbose_name='Institución solicitada'),
        ),
    ]
