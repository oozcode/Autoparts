from .models import Categoria, Marca  # Asegúrate de importar Marca

def categorias_disponibles(request):
    return {
        'categorias': Categoria.objects.all()
    }

def marcas_disponibles(request):
    return {
        'marcas_auto': Marca.objects.all()
    }