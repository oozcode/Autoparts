from django.shortcuts import render, get_object_or_404
from .models import Producto, PerfilUsuario, Categoria
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth import logout, authenticate, login
from django.urls import reverse
from django.contrib import messages
from .forms import RegistroForm, EmailAuthenticationForm

# Vista para la página de inicio
def index(request):
    productos = Producto.objects.all()[:8]  # Mostrar solo los primeros 8 productos (ajustable)
    categorias = Categoria.objects.all()
    data = {
        'productos': productos,
        'categorias': categorias,
    }
    return render(request, 'autopart/index.html', data)

# Vista para la página del catálogo
def catalogo(request):
    categorias = Categoria.objects.all().prefetch_related('producto_set')
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
