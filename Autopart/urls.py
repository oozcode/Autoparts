from django.urls import path
from . import views  # Importar las vistas de la aplicación
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.index, name='index'),
    path('catalogo/', views.catalogo, name='catalogo'),
    path('carrito/', views.carrito, name='carrito'),
    path('login/', views.login_view, name='login'),
    path('registro/', views.registro, name='registro'),
    path('logout/', auth_views.LogoutView.as_view(next_page='index'), name='logout'),
    path('pago/', views.pago, name='pago'),
    path('frenos/', views.frenos, name='frenos'),
    path('electrico/', views.electrico, name='electrico'),
    path('motores/', views.motores, name='motores'),
    path('accesorios/', views.accesorios, name='accesorios'),
    path('producto/<int:id>/', views.detalle_producto, name='detalle_producto'),
    # Cambié el nombre de la vista para que coincida con la nueva ruta de productos por categoría
    path('categoria/<slug:categoria_slug>/', views.productos_por_categoria, name='productos_por_categoria'),

]
