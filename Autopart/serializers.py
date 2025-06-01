from rest_framework import serializers
from .models import Producto, Categoria, Marca, PerfilUsuario

class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = ['id', 'nombre']

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']

class ProductoSerializer(serializers.ModelSerializer):
    categoria_info = CategoriaSerializer(source='categoria', read_only=True)
    marca_info = MarcaSerializer(source='marca', read_only=True)

    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())
    marca = serializers.PrimaryKeyRelatedField(queryset=Marca.objects.all())

    imagen = serializers.SerializerMethodField()

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
            'peso',
            'largo',
            'ancho',
            'alto',
            'categoria',
            'categoria_info',
            'marca',
            'marca_info',
            'creado_por',
            'modificado_por',
            'ultima_modificacion',
        ]
        read_only_fields = ['creado_por', 'modificado_por', 'ultima_modificacion']

    def get_imagen(self, obj):
        if obj.imagen:
            return {"url": obj.imagen.url}
        return None
class PerfilUsuarioSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email')
    user_first_name = serializers.CharField(source='user.first_name')
    user_last_name = serializers.CharField(source='user.last_name')

    class Meta:
        model = PerfilUsuario
        fields = ['id', 'user_email', 'user_first_name', 'user_last_name', 'tipo_cliente', 'telefono']
