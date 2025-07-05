# Generated manually to add data_pagamento field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gastos', '0002_alter_gasto_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='gasto',
            name='data_pagamento',
            field=models.DateField(blank=True, null=True, verbose_name='Data do Pagamento'),
        ),
    ]