# Generated by Django 4.1.2 on 2022-12-01 15:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('swccg', '0009_starwarscard_destinyvalues'),
    ]

    operations = [
        migrations.AddField(
            model_name='starwarscard',
            name='image',
            field=models.ImageField(blank=True, upload_to='swccg\\static\\swccg\\images'),
        ),
    ]
