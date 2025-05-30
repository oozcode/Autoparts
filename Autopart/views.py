from django.shortcuts import render, get_object_or_404, redirect
from .models import Producto, PerfilUsuario, Categoria, Order, OrderItem,Marca

from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import logout, login
from django.contrib import messages
from .forms import RegistroForm, EmailAuthenticationForm
from django.views.decorators.http import require_POST     
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .serializers import ProductoSerializer,CategoriaSerializer, MarcaSerializer


# --- Permiso personalizado para vendedores ---
class IsVendedor(permissions.BasePermission):
    def has_permission(self, request, view):
        # Solo permite si el usuario está autenticado y es parte del grupo "vendedor"
        return request.user and request.user.is_authenticated and request.user.groups.filter(name='vendedor').exists()


# Tus vistas tradicionales aquí (sin cambios)...
def index(request):
    productos = Producto.objects.all()[:8]
    categorias = Categoria.objects.all()
    return render(request, 'autopart/index.html', {'productos': productos, 'categorias': categorias})
# Vista para la página del catálogo
def catalogo(request):
    categorias = Categoria.objects.prefetch_related('productos').all()
    return render(request, 'autopart/catalogo.html', {'categorias': categorias})

# Vista para la página del carrito de compras
def carrito(request):
    return render(request, 'autopart/carrito.html')

# Vista para la página de inicio de sesión
def login_view(request):
    if request.method == 'POST':
        form = EmailAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('index')
    else:
        form = EmailAuthenticationForm()
    return render(request, 'registration/login.html', {'form': form})

# Vista para la página de registro
def registro(request):
    if request.method == 'POST':
        form = RegistroForm(request.POST)
        if form.is_valid():
            user = form.save()
            perfil = PerfilUsuario.objects.create(user=user)
            telefono = form.cleaned_data.get('telefono')
            if telefono:
                perfil.telefono = telefono
                perfil.save()

            login(request, user)
            messages.success(request, '¡Registro exitoso! Bienvenido a Autoparts 🥳🚗')
            return redirect('index')
        else:
            messages.error(request, 'Hubo un error en el formulario. Por favor, revisa los campos 😥')
    else:
        form = RegistroForm()

    return render(request, 'registration/registro.html', {'form': form})

def exit(request):
    logout(request)
    messages.success(request, 'Sesión cerrada correctamente')
    return redirect('index')

# Vista para la página de pago
def pago(request):
    return render(request, 'autopart/pago.html')

# Vista para la página de frenos y suspensión
def frenos(request):
    return render(request, 'autopart/frenos.html')

# Vista para la página de electricidad y baterías
def electrico(request):
    return render(request, 'autopart/electrico.html')

# Vista para la página de motores y componentes
def motores(request):
    productos = Producto.objects.filter(categoria__nombre='Motores y Componentes')
    return render(request, 'autopart/motores.html', {'productos': productos})

# Vista para la página de accesorios
def accesorios(request):
    productos = Producto.objects.filter(categoria__nombre='Accesorios')
    return render(request, 'autopart/accesorios.html', {'productos': productos})

# Vista para la página de detalles del producto
def detalle_producto(request, id):
    producto = get_object_or_404(Producto, id=id)
    return render(request, 'autopart/detalle_producto.html', {'producto': producto})

# Vista para mostrar productos filtrados por categoría
def productos_por_categoria(request, categoria_slug):
    # Obtiene la categoría usando el slug o muestra error 404 si no existe
    categoria = get_object_or_404(Categoria, slug=categoria_slug)

    # Filtra productos que pertenezcan a esta categoría
    productos = Producto.objects.filter(categoria=categoria)

    # Renderiza la plantilla con la lista de productos y categoría
    return render(request, 'autopart/productos_categoria.html', {
        'categoria': categoria,
        'productos': productos
    })

@login_required
@require_POST
def crear_pedido(request):
    try:
        data = json.loads(request.body)
        cart = data.get('cart', [])
        tipo_pedido = data.get('tipo_pedido')

        if not cart or not tipo_pedido:
            return JsonResponse({'error': 'Carrito vacío o tipo de pedido no definido'}, status=400)

        # Crear la orden
        order = Order.objects.create(
            user=request.user,
            tipo_pedido=tipo_pedido,
            rut=data['rut'],
            nombre=data['nombre'],
            apellidos=data['apellidos'],
            region=data['region'],
            comuna=data['comuna'],
            calle=data['calle'],
            numero=data['numero'],
            complemento=data.get('complemento', ''),
            email=data['email'],
            telefono=data['telefono'],
        )

        tipo_cliente = request.user.perfilusuario.tipo_cliente

        for item in cart:
            producto = Producto.objects.get(pk=item['id'])
            precio = producto.precios.get(tipo_cliente=tipo_cliente).valor
            OrderItem.objects.create(
                order=order,
                producto=producto,
                price=precio,
                quantity=item['quantity']
            )

        return JsonResponse({'order_id': order.id})
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



# --- Vistas API para CRUD con DRF ---
class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendedor]

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user, modificado_por=self.request.user)

    def perform_update(self, serializer):
        serializer.save(modificado_por=self.request.user)

    def destroy(self, request, *args, **kwargs):
        # Solo vendedores pueden eliminar
        if not request.user.groups.filter(name='vendedor').exists():
            raise PermissionDenied("No tienes permiso para eliminar productos")
        return super().destroy(request, *args, **kwargs)

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]

class MarcaViewSet(viewsets.ModelViewSet):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    permission_classes = [permissions.IsAuthenticated]
# Opcional: para tus endpoints clásicos que aún quieras mantener y que también sean solo para vendedores
@login_required
@csrf_exempt
def crear_producto(request):
    if not request.user.groups.filter(name='vendedor').exists():
        return JsonResponse({'error': 'No tienes permiso para crear productos'}, status=403)

    if request.method == 'POST':
        data = json.loads(request.body)
        producto = Producto.objects.create(
            nombre=data['nombre'],
            descripcion=data['descripcion'],
            precio_minorista=data['precio_minorista'],
            precio_mayorista=data['precio_mayorista'],
            stock=data['stock'],
            categoria_id=data.get('categoria'),  # si envías id categoría
            marca_id=data.get('marca'),          # si envías id marca
            creado_por=request.user,
            modificado_por=request.user
        )
        return JsonResponse({'message': 'Producto creado', 'id': producto.id})

@login_required
@csrf_exempt
def actualizar_producto(request, producto_id):
    if not request.user.groups.filter(name='vendedor').exists():
        return JsonResponse({'error': 'No tienes permiso para actualizar productos'}, status=403)

    if request.method == 'POST':
        data = json.loads(request.body)
        producto = Producto.objects.get(id=producto_id)
        producto.nombre = data['nombre']
        producto.descripcion = data['descripcion']
        producto.precio_minorista = data['precio_minorista']
        producto.precio_mayorista = data['precio_mayorista']
        producto.stock = data['stock']
        producto.categoria_id = data.get('categoria')
        producto.marca_id = data.get('marca')
        producto.modificado_por = request.user
        producto.save()
        return JsonResponse({'message': 'Producto actualizado'})

@login_required
@csrf_exempt
def eliminar_producto(request, producto_id):
    if not request.user.groups.filter(name='vendedor').exists():
        return JsonResponse({'error': 'No tienes permiso para eliminar productos'}, status=403)

    if request.method == 'POST':
        producto = Producto.objects.get(id=producto_id)
        producto.delete()
        return JsonResponse({'message': 'Producto eliminado'})


def es_vendedor(user):
    return user.groups.filter(name="vendedor").exists()

@login_required
@user_passes_test(es_vendedor)
def dashboard_vendedor(request):
    return render(request, 'autopart/dashboard.html')
