from django.urls import path,include 
from rest_framework.routers import DefaultRouter
from .views import QrViewSet

router = DefaultRouter()
router.register(r'qr',QrViewSet)

urlpatterns = [
    path('',include(router.urls)),
]