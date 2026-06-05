import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('riscos', '0005_add_soft_delete'),
    ]

    operations = [
        migrations.AddField(
            model_name='risco',
            name='uuid',
            field=models.UUIDField(db_column='uuid', default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
