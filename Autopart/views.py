from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from .models import Precio, Producto, PerfilUsuario, Categoria, Order, OrderItem,Marca,TipoCliente
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import logout, login
from django.contrib import messages
from .forms import RegistroForm, EmailAuthenticationForm, PerfilUsuarioAdminForm
from django.views.decorators.http import require_POST     
from django.http import JsonResponse
import json
from transbank.webpay.webpay_plus.transaction import Transaction,WebpayOptions
from transbank.common.integration_type import IntegrationType
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import SAFE_METHODS, BasePermission, IsAuthenticated
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .serializers import ProductoSerializer,CategoriaSerializer, MarcaSerializer, PerfilUsuarioSerializer
from django.contrib.auth.models import User
from django.db.models import Q
from django import template
CommerCode = '597055555532'
ApiKeySecret = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'
options = WebpayOptions(CommerCode,ApiKeySecret,IntegrationType.TEST)
transaction = Transaction(options)




# --- Permiso personalizado para vendedores ---
class IsVendedorOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True  # GET, HEAD, OPTIONS → permitidos para todos
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
def resumen_pedido(request):
    return render(request, 'autopart/resumen_pedido.html')
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
    permission_classes = [permissions.IsAuthenticated, IsVendedorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user, modificado_por=self.request.user)

    def perform_update(self, serializer):
        serializer.save(modificado_por=self.request.user)

    def destroy(self, request, *args, **kwargs):
        # Solo vendedores pueden eliminar
        if not request.user.groups.filter(name='vendedor').exists():
            raise PermissionDenied("No tienes permiso para eliminar productos")
        return super().destroy(request, *args, **kwargs)

class MarcaViewSet(viewsets.ModelViewSet):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    permission_classes = [IsVendedorOrReadOnly]  # ← usa permiso mixto

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsVendedorOrReadOnly]
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


@user_passes_test(lambda u: u.is_superuser)
def asignar_tipo_cliente(request, user_id):
    # Obtener el usuario
    user = get_object_or_404(User, id=user_id)
    perfil, created = PerfilUsuario.objects.get_or_create(user=user)

    # Obtener o crear el TipoCliente "Mayorista"
    tipo_mayorista, _ = TipoCliente.objects.get_or_create(nombre__iexact='Mayorista', defaults={'nombre': 'Mayorista'})

    if request.method == 'POST':
        # Si llega POST, asignamos y redirigimos
        perfil.tipo_cliente = tipo_mayorista
        perfil.save()
        return redirect('lista_usuarios')
    else:
        # Si es GET, mostramos el formulario de confirmación
        return render(request, 'autopart/confirmar_asignacion.html', {
            'perfil': perfil,
            'tipo_mayorista': tipo_mayorista
        })


@user_passes_test(lambda u: u.is_superuser)
def lista_usuarios(request):
    query = request.GET.get('q')
    
    usuarios = User.objects.filter(is_staff=False, is_superuser=False)

    if query:
        usuarios = usuarios.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(email__icontains=query)
        )

    usuarios = usuarios.select_related('perfilusuario')

    return render(request, 'autopart/listar_clientes.html', {'usuarios': usuarios, 'query': query})

def catalogo(request):
    categorias = Categoria.objects.prefetch_related('productos').all()
    
    es_mayorista = False
    if request.user.is_authenticated:
        perfil = getattr(request.user, 'perfilusuario', None)
        if perfil and perfil.tipo_cliente and perfil.tipo_cliente.nombre.lower() == 'mayorista':
            es_mayorista = True

    return render(request, 'autopart/catalogo.html', {
        'categorias': categorias,
        'es_mayorista': es_mayorista
    })

def detalle_producto(request, producto_id):
    producto = get_object_or_404(Producto, id=producto_id)
    return render(request, 'autopart/detalle_producto.html', {'producto': producto})

@login_required
@require_POST
def crear_pedido(request):
    try:
        data = json.loads(request.body)
        cart = data.get('cart', [])
        tipo_pedido = data.get('tipo_pedido')
        resumen = data.get('resumen', {})

        if not cart or not tipo_pedido:
            return JsonResponse({'error': 'Carrito vacío o tipo de pedido no definido'}, status=400)

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
            subtotal=resumen.get('subtotal', 0),
            iva=resumen.get('iva', 0),
            envio=resumen.get('envio', 0),
            total=resumen.get('total', 0),
        )

        tipo_cliente = getattr(request.user.perfilusuario, 'tipo_cliente', None)

        for item in cart:
            producto = Producto.objects.get(pk=item['id'])

            try:
                if tipo_cliente:
                    precio = producto.precios.get(tipo_cliente=tipo_cliente).valor
                else:
                    precio = item.get("price", producto.precio_minorista)
            except Precio.DoesNotExist:
                precio = item.get("price", producto.precio_minorista)

            OrderItem.objects.create(
                order=order,
                producto=producto,
                quantity=item.get('quantity', 1),
                price=precio
            )

        return JsonResponse({'order_id': order.id})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def pagar_pedido(request, pedido_id):
    orden = get_object_or_404(Order, id=pedido_id, user=request.user)
    transaction = Transaction(options)

    try:
        # Usa directamente el total ya guardado (suma de subtotal + iva + envío)
        total = orden.total  # ← ya deberías tenerlo desde crear_pedido

        response = transaction.create(
            buy_order=str(orden.id),
            session_id=request.session.session_key,
            amount=int(total),
            return_url=request.build_absolute_uri(reverse('pago_exitoso'))
        )
        return redirect(f"{response['url']}?token_ws={response['token']}")
    except Exception as e:
        messages.error(request, "Error al procesar el pago.")
        return redirect('resumen_pedido')

def pago_exitoso(request):
    
    token_ws = request.GET.get('token_ws')  
    transaction = Transaction(options) 
    result = transaction.commit(token_ws)  

    if result['status'] == 'AUTHORIZED':
  
        pedido_id = int(result['buy_order'])  
        pedido = get_object_or_404(Order, id=pedido_id)
        productos = OrderItem.objects.filter(order=pedido)
        pedido.estado = 'pagado' 
        pedido.save()

        return render(request, 'autopart/pago_exitoso.html', {'pedido': pedido, 'producto': productos})
    else:
        return render(request, 'autopart/pago_fallido.html') 
    
@login_required
def mis_pedidos(request):
    pedidos = Order.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'autopart/mis_pedidos.html', {'pedidos': pedidos})

@login_required
def detalle_pedido(request, pedido_id):
    pedido = get_object_or_404(Order, id=pedido_id, user=request.user)
    productos = OrderItem.objects.filter(order=pedido)
    return render(request, 'autopart/detalle_pedido.html', {'pedido': pedido, 'productos': productos})

@login_required
def perfil_usuario(request):
    perfil = getattr(request.user, 'perfilusuario', None)
    return render(request, 'autopart/perfil_usuario.html', {'perfil': perfil})