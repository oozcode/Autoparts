from django.shortcuts import render
from .models import Producto,PerfilUsuario
from django.contrib.auth.models import User
from datetime import datetime
from django.shortcuts import render, redirect ,  get_object_or_404
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import logout, authenticate, login
#from transbank.webpay.webpay_plus.transaction import Transaction,WebpayOptions
#from transbank.common.integration_type import IntegrationType
from django.urls import reverse
from .forms import RegistroForm

# Vista para la página de inicio
def index(request):
    productos = Producto.objects.all()
    data= {
        'productos':productos
    }
    return render(request, 'autopart/index.html',data)

# Vista para la página del catálogo
def catalogo(request):
    productos = Producto.objects.all()
    return render(request, 'autopart/catalogo.html', {'productos': productos})

# Vista para la página del carrito de compras
def carrito(request):
    return render(request, 'autopart/carrito.html')

# Vista para la página de inicio de sesión
def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('index')
    else:
        form = AuthenticationForm()
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
            return redirect('index')
    else:
        form = RegistroForm()
    
    return render(request, 'registration/registro.html', {'form': form})

def exit(request):
    logout(request)
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
    productos = Producto.objects.filter(categoria='motores')
    return render(request, 'autopart/motores.html', {'productos': productos})

# Vista para la página de accesorios
def accesorios(request):
    productos = Producto.objects.filter(categoria='accesorios')
    return render(request, 'autopart/accesorios.html', {'productos': productos})

#Vista para la página de detalles del producto
def detalle_producto(request, id):
    producto = get_object_or_404(Producto, id=id)
    return render(request, 'autopart/detalle_producto.html', {'producto': producto})
