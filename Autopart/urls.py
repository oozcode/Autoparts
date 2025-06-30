from django.urls import path, include
from . import views 
from .views import MarcaAutoViewSet, ProductoViewSet, dashboard_vendedor, CategoriaViewSet, MarcaViewSet, pago_exitoso,vista_mayorista_api
from django.contrib.auth import views as auth_views
from rest_framework.routers import DefaultRouter
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

router = DefaultRouter()
router.register(r'productos', ProductoViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'marcas', MarcaViewSet)
router.register(r'marcas-auto', MarcaAutoViewSet)
schema_view = get_schema_view(
   openapi.Info(
      title="API Autoparts",
      default_version='v1',
      description="Documentación amigable del API para vendedores 🚗",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('', views.index, name='index'),
    path('catalogo/', views.catalogo, name='catalogo'),
    path('carrito/', views.carrito, name='carrito'),
    path('login/', views.login_view, name='login'),
    path('registro/', views.registro, name='registro'),
    path('logout/', auth_views.LogoutView.as_view(next_page='index'), name='logout'),
    path('pago/', views.pago, name='pago'),
    path('categoria/<slug:categoria_slug>/', views.productos_por_categoria, name='productos_por_categoria'),
    path('crear-pedido/', views.crear_pedido, name='crear_pedido'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/', include(router.urls)),
    path('dashboard/', dashboard_vendedor, name='dashboard_vendedor'),
    path('asignar-tipo/<int:user_id>/', views.asignar_tipo_cliente, name='asignar_tipo_cliente'),
    path('clientes/', views.lista_usuarios, name='lista_usuarios'),
    path('producto/<int:producto_id>/', views.detalle_producto, name='detalle_producto'),
    path('resumen_pedido/', views.resumen_pedido, name='resumen_pedido'),
    path('pagar/<int:pedido_id>/', views.pagar_pedido, name='pagar_pedido'),
    path('crear_pedido/', views.crear_pedido, name='crear_pedido'),
    path('pago_exitoso/', views.pago_exitoso, name='pago_exitoso'),
    path('mis-pedidos/', views.mis_pedidos, name='mis_pedidos'),
    path('perfil/', views.perfil_usuario, name='perfil_usuario'),
    path('pedido/<int:pedido_id>/', views.detalle_pedido, name='detalle_pedido'),
    path('asignar-vendedor/<int:user_id>/', views.asignar_vendedor, name='asignar_vendedor'),
    path('quitar-vendedor/<int:user_id>/', views.quitar_vendedor, name='quitar_vendedor'),
    path('quitar-mayorista/<int:user_id>/', views.quitar_mayorista, name='quitar_mayorista'),
    path('asignar-mayorista/<int:user_id>/', views.asignar_mayorista, name='asignar_mayorista'),
    path('confirmar-retiro/<int:pedido_id>/', views.confirmar_retiro, name='confirmar_retiro'),
    path('dashboard/pedidos/', views.dashboard_pedidos, name='dashboard_pedidos'),
    path('eliminar-pedido/<int:pedido_id>/', views.eliminar_pedido, name='eliminar_pedido'),
    path('mayorista-visual/', vista_mayorista_api, name='vista_mayorista_api'),
    path('pago/transferencia/<int:order_id>/', views.pago_transferencia, name='pago_transferencia'),
    path('pago/transferencia/<int:order_id>/confirmacion/',views.pago_transferencia_confirmacion,name='pago_transferencia_confirmacion'),
    
]