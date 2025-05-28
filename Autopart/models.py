from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator

from django.utils.text import slugify

class Categoria(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)

    def __str__(self):
        return self.nombre

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
        super().save(*args, **kwargs)
#Marca de productos
class Marca(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

#Tipo de cliente
class TipoCliente(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    def __str__(self):
        return self.nombre

#Tabla de productos sin precio
class Producto(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT)
    nombre = models.CharField(max_length=50)
    descripcion = models.TextField(blank=True)
    img = models.ImageField(upload_to='productos', null=True, blank=True)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.nombre} - {self.marca}"
    def get_precio_para_tipo(self, tipo_cliente):
        precio = self.precios.filter(tipo_cliente=tipo_cliente).first()
        return precio.valor if precio else None

#Precio mayorista y minorista
class Precio(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='precios')
    tipo_cliente = models.ForeignKey(TipoCliente, on_delete=models.CASCADE)
    valor = models.DecimalField(max_digits=10, decimal_places=0, validators=[MinValueValidator(1)])
    class Meta:
        unique_together = ('producto', 'tipo_cliente')
    def __str__(self):
        return f"{self.producto.nombre} - {self.tipo_cliente.nombre}: ${self.valor}"

class PerfilUsuario(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tipo_cliente = models.ForeignKey(TipoCliente, on_delete=models.SET_NULL, null=True)
    telefono = models.CharField(max_length=9, blank=True) 

    def __str__(self):
        return f"{self.user.username} - {self.tipo_cliente.nombre if self.tipo_cliente else 'Sin tipo asignado'}"