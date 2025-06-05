from django.contrib import admin
from .models import Producto,Categoria

# Register your models here.
admin.site.register(Producto)
admin.site.register(Categoria)
from django.contrib import admin
from .models import Marca  # importa Marca desde tus modelos
from .models import MarcaAuto
from .models import Order
from .models import OrderItem
admin.site.register(Marca)
admin.site.register(MarcaAuto)
admin.site.register(Order)
admin.site.register(OrderItem)