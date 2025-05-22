# Autoparts/urls.py

from django.urls import path
from . import views  # Importar las vistas de la aplicación
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.index, name='index'),
    path('catalogo/', views.catalogo, name='catalogo'),
    path('carrito/', views.carrito, name='carrito'),
    path('login/', views.login_view, name='login'),
    path('registro/', views.registro, name='registro'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    path('pago/', views.pago, name='pago'),
    path('frenos/', views.frenos, name='frenos'),
    path('electrico/', views.electrico, name='electrico'),
    path('producto/<int:id>/', views.detalle_producto, name='detalle_producto'),
]

