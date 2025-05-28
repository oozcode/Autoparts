from django.contrib import admin
from .models import Producto,Categoria

# Register your models here.
admin.site.register(Producto)
admin.site.register(Categoria)
from django.contrib import admin
from .models import Marca  # importa Marca desde tus modelos

admin.site.register(Marca)
