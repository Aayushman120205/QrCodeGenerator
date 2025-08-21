from rest_framework import serializers

from .models import Qr

class QrSerializers(serializers.ModelSerializer):
    class Meta:
        model = Qr
        fields = '__all__'