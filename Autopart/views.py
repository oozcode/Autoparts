from django.shortcuts import render
from .models import Producto

# Vista para la página de inicio
def index(request):
    productos = Producto.objects.all()
    data= {
        'productos':productos
    }
    return render(request, 'autopart/index.html',data)

# Vista para la página del catálogo
def catalogo(request):
    return render(request, 'autopart/catalogo.html')

# Vista para la página del carrito de compras
def carrito(request):
    return render(request, 'autopart/carrito.html')

# Vista para la página de inicio de sesión
def login_view(request):
    return render(request, 'autopart/login.html')

# Vista para la página de registro
def registro(request):
    return render(request, 'autopart/registro.html')

# Vista para la página de pago
def pago(request):
    return render(request, 'autopart/pago.html')

# Vista para la página de frenos y suspensión
def frenos(request):
    return render(request, 'autopart/frenos.html')

# Vista para la página de electricidad y baterías
def electricidad(request):
    return render(request, 'autopart/electricidad.html')
