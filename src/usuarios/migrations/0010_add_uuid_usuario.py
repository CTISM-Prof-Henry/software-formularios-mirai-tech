import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0009_usuario_cargo'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='uuid',
            field=models.UUIDField(db_column='uuid', default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
