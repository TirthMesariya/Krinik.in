# Generated by Django 4.2.16 on 2024-12-11 08:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0020_withdraw_amount_timestamp'),
    ]

    operations = [
        migrations.AddField(
            model_name='pair',
            name='updated_limit',
            field=models.IntegerField(default=0),
        ),
    ]
