import re
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import PerfilUsuario
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

class RegistroForm(UserCreationForm):
    first_name = forms.CharField(
        max_length=30,
        label="Nombre",
        widget=forms.TextInput(attrs={'class': 'form-input'})
    )
    last_name = forms.CharField(
        max_length=30,
        label="Apellido",
        widget=forms.TextInput(attrs={'class': 'form-input'})
    )
    email = forms.EmailField(
        max_length=254,
        label="Correo electrónico",
        widget=forms.EmailInput(attrs={'class': 'form-input'})
    )
    telefono = forms.CharField(
    max_length=15,
    label="Teléfono",
    required=False,
    widget=forms.TextInput(attrs={
        'class': 'form-input',
        'pattern': r'\d{9}',
        'title': 'Ingresa solo números'
    })
)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'telefono', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password1'].widget.attrs.update({'class': 'form-input', 'placeholder': ''})
        self.fields['password2'].widget.attrs.update({'class': 'form-input', 'placeholder': ''})
        self.fields['password1'].label = 'Contraseña'
        self.fields['password2'].label = 'Confirmar contraseña'
        self.fields['password1'].help_text = ''
        self.fields['password2'].help_text = ''

    def save(self, commit=True):
        user = super().save(commit=False)
        email = self.cleaned_data['email']
        email = self.cleaned_data.get('email')
        user.email = email
        user.username = email  # ← Esto genera el username automáticamente con el correo 💡
        if commit:
            user.save()
        return user
    def clean_telefono(self):
        telefono = self.cleaned_data.get('telefono')
        if telefono:
            # Solo números, mínimo 8 y máximo 15 dígitos
            if not re.fullmatch(r'\d{8,15}', telefono):
                raise forms.ValidationError("Ingresa un número de teléfono válido (solo números, 8 a 15 dígitos).")
        return telefono
User = get_user_model()

class EmailAuthenticationForm(AuthenticationForm):
    username = forms.EmailField(
        label="Correo electrónico",
        widget=forms.EmailInput(attrs={'autofocus': True, 'class': 'form-input'}),
    )

    def confirm_login_allowed(self, user):
        super().confirm_login_allowed(user)

    def clean(self):
        email = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')

        if email and password:
            self.user_cache = authenticate(self.request, username=email, password=password)
            if self.user_cache is None:
                raise forms.ValidationError("Correo o contraseña incorrectos.")
            self.confirm_login_allowed(self.user_cache)

        return self.cleaned_data

class PerfilUsuarioAdminForm(forms.ModelForm):
    class Meta:
        model = PerfilUsuario
        fields = ['tipo_cliente', 'telefono']
        widgets = {
            'tipo_cliente': forms.Select(attrs={'class': 'form-input'}),
            'telefono': forms.TextInput(attrs={'class': 'form-input'}),
        }