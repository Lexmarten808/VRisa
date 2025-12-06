from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('users', '0005_remove_email_id_remove_phonenumber_id_email_email_id_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Institution',
            fields=[
                ('institution_id', models.BigAutoField(primary_key=True, serialize=False)),
                ('i_name', models.CharField(max_length=100, verbose_name='Nombre')),
                ('logo', models.CharField(blank=True, max_length=100, null=True, verbose_name='Logo')),
                ('color_set', models.CharField(blank=True, max_length=50, null=True, verbose_name='Conjunto de colores')),
                ('street', models.CharField(blank=True, max_length=100, null=True, verbose_name='Calle')),
                ('neighborhood', models.CharField(blank=True, max_length=100, null=True, verbose_name='Barrio')),
                ('validated', models.BooleanField(default=False, verbose_name='Validada')),
                ('admin_id', models.ForeignKey(blank=True, db_column='admin_id', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='institutions_administered', to='users.user')),
            ],
            options={
                'verbose_name': 'Institución',
                'verbose_name_plural': 'Instituciones',
                'db_table': 'institution',
            },
        ),
    ]