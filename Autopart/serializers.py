# serializers.py

from rest_framework import serializers
from .models import Producto, Categoria, Marca

class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = ['id', 'nombre']

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']



class ProductoSerializer(serializers.ModelSerializer):
    # Campos para mostrar (read-only)
    categoria_info = CategoriaSerializer(source='categoria', read_only=True)
    marca_info = MarcaSerializer(source='marca', read_only=True)

    # Campos para entrada de datos
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())
    marca = serializers.PrimaryKeyRelatedField(queryset=Marca.objects.all())

    class Meta:
        model = Producto
        fields = [
            'id',
            'nombre',
            'imagen',
            'descripcion',
            'precio_minorista',
            'precio_mayorista',
            'stock',
            'categoria',         # Entrada como ID
            'categoria_info',    # Visualización como objeto anidado
            'marca',             # Entrada como ID
            'marca_info',        # Visualización como objeto anidado
            'creado_por',
            'modificado_por',
            'ultima_modificacion',
        ]
        read_only_fields = ['creado_por', 'modificado_por', 'ultima_modificacion']
