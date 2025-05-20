from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings

class Categoria(models.Model):
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre

class Producto(models.Model):
    marca = models.CharField(max_length=50)
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT)
    nombre = models.CharField(max_length=50)
    descripcion = models.TextField(blank=True)  # descripción, puede quedar en blanco
    precio = models.DecimalField(max_digits=10, decimal_places=2)  # precio con decimales
    img = models.ImageField(upload_to='productos', null=True, blank=True)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.nombre} - {self.marca}"

