from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from Autopart.views import ProductosMayoristaAPIView
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('Autopart.urls')),
    path('api/productos-mayorista/', ProductosMayoristaAPIView.as_view(), name='api_productos_mayorista'),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
