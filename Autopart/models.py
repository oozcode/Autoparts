from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils.text import slugify
from django.contrib.auth.models import User
from django.utils import timezone

# Categorías para organizar los productos, con un slug para URLs lindas
class Categoria(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)

    def __str__(self):
        return self.nombre

    # Automágicamente crea el slug si no existe
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
        super().save(*args, **kwargs)

# Marca del producto (ejemplo: Bosch, Michelin, etc.)
class Marca(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

# Tipos de clientes (minorista, mayorista, etc.) para diferenciar precios
class TipoCliente(models.Model):
    nombre = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.nombre

# Productos con datos básicos y relaciones
class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    precio_minorista = models.DecimalField(max_digits=10, decimal_places=2)
    precio_mayorista = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='productos')
    marca = models.ForeignKey(Marca, on_delete=models.CASCADE, related_name='productos')
    creado_por = models.ForeignKey(User, related_name="productos_creados", on_delete=models.SET_NULL, null=True)
    modificado_por = models.ForeignKey(User, related_name="productos_modificados", on_delete=models.SET_NULL, null=True)
    ultima_modificacion = models.DateTimeField(null=True, blank=True)
    imagen = models.ImageField(upload_to='productos/', blank=True, null=True)

    def save(self, *args, **kwargs):
        self.ultima_modificacion = timezone.now()
        super().save(*args, **kwargs)

# Precios específicos por tipo de cliente, para personalizar tarifas 💰
class Precio(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='precios')
    tipo_cliente = models.ForeignKey(TipoCliente, on_delete=models.CASCADE)
    valor = models.DecimalField(max_digits=10, decimal_places=0, validators=[MinValueValidator(1)])

    class Meta:
        unique_together = ('producto', 'tipo_cliente')

    def __str__(self):
        return f"{self.producto.nombre} - {self.tipo_cliente.nombre}: ${self.valor}"

# Perfil extendido para el usuario, con tipo_cliente y teléfono
class PerfilUsuario(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tipo_cliente = models.ForeignKey(TipoCliente, on_delete=models.SET_NULL, null=True)
    telefono = models.CharField(max_length=9, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.tipo_cliente.nombre if self.tipo_cliente else 'Sin tipo asignado'}"

# Orden de compra, con datos para delivery o retiro
class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    tipo_pedido = models.CharField(max_length=10, choices=[('delivery', 'Delivery'), ('retiro', 'Retiro en tienda')])

    # Datos de facturación y envío
    rut = models.CharField(max_length=12)
    nombre = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    comuna = models.CharField(max_length=100)
    calle = models.CharField(max_length=100)
    numero = models.CharField(max_length=10)
    complemento = models.CharField(max_length=100, blank=True)
    email = models.EmailField()
    telefono = models.CharField(max_length=20)

# Items dentro de una orden con cantidad y precio
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=0)
