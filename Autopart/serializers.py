from rest_framework import serializers
from .models import Producto, Categoria, Marca, PerfilUsuario, MarcaAuto
from decimal import Decimal

class MarcaAutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarcaAuto
        fields = ['id', 'nombre']

class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = ['id', 'nombre']

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'imagen']  # <-- importante incluir 'imagen'


class ProductoSerializer(serializers.ModelSerializer):
    categoria_info = CategoriaSerializer(source='categoria', read_only=True)
    marca_info = MarcaSerializer(source='marca', read_only=True)
    marcas_auto_info = MarcaAutoSerializer(source='marcas_auto', many=True, read_only=True)
    marcas_auto = serializers.PrimaryKeyRelatedField(queryset=MarcaAuto.objects.all(), many=True, required=False)
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
            'marcas_auto',
            'marcas_auto_info',
            'creado_por',
            'modificado_por',
            'ultima_modificacion',
            'oferta_activa',
            'descuento_oferta',
            'precio_oferta_minorista',
            'precio_oferta_mayorista',
        ]
        read_only_fields = ['creado_por', 'modificado_por', 'ultima_modificacion']

    def get_imagen(self, obj):
        if obj.imagen:
            return {"url": obj.imagen.url}
        return None

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)

        # Calcular precios de oferta si corresponde
        if validated_data.get('oferta_activa') and validated_data.get('descuento_oferta'):
            descuento = Decimal(validated_data['descuento_oferta']) / Decimal('100')
            instance.precio_oferta_minorista = instance.precio_minorista * (Decimal('1') - descuento)
            instance.precio_oferta_mayorista = instance.precio_mayorista * (Decimal('1') - descuento)
        else:
            instance.precio_oferta_minorista = None
            instance.precio_oferta_mayorista = None

        instance.save()
        return instance

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email')
    user_first_name = serializers.CharField(source='user.first_name')
    user_last_name = serializers.CharField(source='user.last_name')

    class Meta:
        model = PerfilUsuario
        fields = ['id', 'user_email', 'user_first_name', 'user_last_name', 'tipo_cliente', 'telefono']

class ProductoMayoristaSerializer(serializers.ModelSerializer):
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'precio_mayorista', 'stock', 'imagen_url']

    def get_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.imagen:
            return request.build_absolute_uri(obj.imagen.url)
        return None