from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import PerfilUsuario

class RegistroForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, label="Nombre")
    last_name = forms.CharField(max_length=30, label="Apellido")
    email = forms.EmailField(max_length=254, label="Correo electrónico")
    telefono = forms.CharField(max_length=15, label="Teléfono", required=False) 

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'telefono', 'password1', 'password2')
