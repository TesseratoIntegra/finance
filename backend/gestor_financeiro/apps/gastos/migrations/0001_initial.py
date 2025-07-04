# Generated by Django 4.2.7 on 2025-07-02 13:22

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Gasto',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('descricao', models.CharField(max_length=200)),
                ('categoria', models.CharField(choices=[('Moradia', 'Moradia'), ('Alimentação', 'Alimentação'), ('Transporte', 'Transporte'), ('Saúde', 'Saúde'), ('Educação', 'Educação'), ('Lazer', 'Lazer'), ('Financeiro', 'Financeiro'), ('Outros', 'Outros')], max_length=50)),
                ('valor', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0.01)])),
                ('data', models.DateField()),
                ('tipo', models.CharField(choices=[('Fixo', 'Fixo'), ('Variável', 'Variável'), ('Parcelado', 'Parcelado')], max_length=20)),
                ('parcelas', models.PositiveIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(60)])),
                ('parcela_atual', models.PositiveIntegerField(default=1)),
                ('status', models.CharField(choices=[('Pendente', 'Pendente'), ('Pago', 'Pago')], default='Pendente', max_length=20)),
                ('data_criacao', models.DateTimeField(auto_now_add=True)),
                ('data_atualizacao', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Gasto',
                'verbose_name_plural': 'Gastos',
                'ordering': ['-data_criacao'],
            },
        ),
    ]
