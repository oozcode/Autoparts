# Autoparts/urls.py

from django.urls import path
from . import views  # Importar las vistas de la aplicación

urlpatterns = [
    path('', views.index, name='index'),
    path('catalogo/', views.catalogo, name='catalogo'),
    path('carrito/', views.carrito, name='carrito'),
    path('login/', views.login_view, name='login'),
    path('registro/', views.registro, name='registro'),
    path('pago/', views.pago, name='pago'),
    path('frenos/', views.frenos, name='frenos'),
    path('electrico/', views.electrico, name='electrico'),
]

