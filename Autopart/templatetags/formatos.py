from django import template

register = template.Library()

@register.filter
def clp(valor):
    try:
        valor = int(valor)
        return f"${valor:,}".replace(",", ".")
    except (ValueError, TypeError):
        return valor
