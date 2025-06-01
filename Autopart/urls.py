from django.urls import path, include
from . import views 
from .views import ProductoViewSet,dashboard_vendedor, CategoriaViewSet, MarcaViewSet
from django.contrib.auth import views as auth_views
from rest_framework.routers import DefaultRouter
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

router = DefaultRouter()
router.register(r'productos', ProductoViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'marcas', MarcaViewSet)
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
    path('frenos/', views.frenos, name='frenos'),
    path('electrico/', views.electrico, name='electrico'),
    path('motores/', views.motores, name='motores'),
    path('accesorios/', views.accesorios, name='accesorios'),
    path('categoria/<slug:categoria_slug>/', views.productos_por_categoria, name='productos_por_categoria'),
    path('crear-pedido/', views.crear_pedido, name='crear_pedido'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/', include(router.urls)),
    path('dashboard/', dashboard_vendedor, name='dashboard_vendedor'),
    path('asignar-tipo/<int:user_id>/', views.asignar_tipo_cliente, name='asignar_tipo_cliente'),
    path('clientes/', views.lista_usuarios, name='lista_usuarios'),
    path('producto/<int:producto_id>/', views.detalle_producto, name='detalle_producto'),
    path('resumen_pedido/', views.resumen_pedido, name='resumen_pedido')
    
]
