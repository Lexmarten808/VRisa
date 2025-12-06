from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('stations', '0002_alter_station_lat_alter_station_lon'),
    ]

    operations = [
        migrations.CreateModel(
            name='StationRequest',
            fields=[
                ('request_id', models.BigAutoField(primary_key=True, serialize=False)),
                ('s_name', models.CharField(max_length=120, verbose_name='Nombre de Estación')),
                ('lat', models.CharField(max_length=32, verbose_name='Latitud')),
                ('lon', models.CharField(max_length=32, verbose_name='Longitud')),
                ('sensor_type', models.CharField(max_length=120, verbose_name='Tipo de Sensor')),
                ('variables', models.TextField(blank=True, help_text='Lista separada por comas', verbose_name='Variables')),
                ('responsible', models.CharField(max_length=120, verbose_name='Responsable Técnico')),
                ('calibration_doc', models.CharField(blank=True, max_length=200, null=True, verbose_name='Certificado de calibración')),
                ('maintenance_doc', models.CharField(blank=True, max_length=200, null=True, verbose_name='Documento de mantenimiento')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending', max_length=16, verbose_name='Estado')),
                ('submitted_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de solicitud')),
                ('decision_at', models.DateTimeField(blank=True, null=True, verbose_name='Fecha de decisión')),
                ('notes', models.TextField(blank=True, verbose_name='Notas')),
                ('decision_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='station_requests_decided', to='users.user', verbose_name='Decidido por')),
                ('institution', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='institutions.institution', verbose_name='Institución')),
                ('submitted_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='station_requests', to='users.user', verbose_name='Solicitado por')),
            ],
            options={
                'db_table': 'station_request',
                'verbose_name': 'Solicitud de Estación',
                'verbose_name_plural': 'Solicitudes de Estación',
            },
        ),
        migrations.CreateModel(
            name='StationCredential',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('api_key', models.CharField(max_length=64)),
                ('secret', models.CharField(max_length=64)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('station', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='credentials', to='stations.station')),
            ],
            options={
                'db_table': 'station_credentials',
            },
        ),
    ]
