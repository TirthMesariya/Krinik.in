# Generated by Django 4.2.16 on 2025-01-08 06:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0027_user_total_deposited_amount_user_total_profit_amount'),
    ]

    operations = [
        migrations.AddField(
            model_name='all_match_details',
            name='pool_id',
            field=models.IntegerField(blank=True, default=0, null=True),
        ),
    ]
