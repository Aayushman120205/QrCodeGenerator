from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import Qr
from .serializers import QrSerializers
from django.conf import settings
import pyqrcode
from io import BytesIO
from django.core.files.base import ContentFile


class QrViewSet(viewsets.ModelViewSet):
    queryset = Qr.objects.all()
    serializer_class = QrSerializers
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        instance = serializer.save()
        # host = 'http://192.168.5.232:8000'
        # # Generate QR code using pyqrcode
        # file_url = f"{host}{instance.file.url}"  # this is relative like /media/...

        file_url = self.request.build_absolute_uri(instance.file.url)
        qr = pyqrcode.create(file_url)
        buffer = BytesIO()
        qr.png(buffer, scale=6)
        buffer.seek(0)

        file_name = f"qr_{instance.file.name.split('/')[-1]}.png"
        instance.qr_code.save(file_name, ContentFile(buffer.read()), save=True)