# Generated by Django 4.2.16 on 2024-12-13 12:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0022_user_query_timestamp'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='run',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
