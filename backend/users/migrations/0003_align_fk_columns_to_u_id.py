# Generated manually to align FK column names with DDL (u_id)
from django.db import migrations, models
from django.db.models import deletion


def rename_fk_columns_forward(apps, schema_editor):
    # Safely rename u_id_id -> u_id if needed (PostgreSQL)
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='email' AND column_name='u_id_id'
                ) THEN
                    ALTER TABLE email RENAME COLUMN u_id_id TO u_id;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='phone_number' AND column_name='u_id_id'
                ) THEN
                    ALTER TABLE phone_number RENAME COLUMN u_id_id TO u_id;
                END IF;
            END
            $$;
            """
        )


def rename_fk_columns_backward(apps, schema_editor):
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='email' AND column_name='u_id'
                ) THEN
                    ALTER TABLE email RENAME COLUMN u_id TO u_id_id;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='phone_number' AND column_name='u_id'
                ) THEN
                    ALTER TABLE phone_number RENAME COLUMN u_id TO u_id_id;
                END IF;
            END
            $$;
            """
        )


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(rename_fk_columns_forward, rename_fk_columns_backward),
        migrations.AlterField(
            model_name='email',
            name='u_id',
            field=models.ForeignKey(db_column='u_id', on_delete=deletion.CASCADE, related_name='emails', to='users.user'),
        ),
        migrations.AlterField(
            model_name='phonenumber',
            name='u_id',
            field=models.ForeignKey(db_column='u_id', on_delete=deletion.CASCADE, related_name='phones', to='users.user'),
        ),
    ]
