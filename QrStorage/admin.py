from django.contrib import admin
from .models import Qr

@admin.register(Qr)
class QrAdmin(admin.ModelAdmin):
    list_display=('id' , 'file' , 'qr_code')