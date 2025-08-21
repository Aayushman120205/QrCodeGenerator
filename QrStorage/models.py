from django.db import models

class Qr(models.Model):
    file = models.FileField(upload_to='uploads/%Y/%m/%d/', help_text="Uploaded file (PDF, image, etc.)")
    qr_code = models.FileField(upload_to='qrcodes/%Y/%m/%d/', blank=True, help_text="QR code image for the file")

    def __str__(self):
        return f"{self.file} - {self.id}"