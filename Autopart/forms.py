from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import PerfilUsuario
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import get_user_model

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
        widget=forms.TextInput(attrs={'class': 'form-input'})
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
        user.email = email
        user.username = email  # ← Esto genera el username automáticamente con el correo 💡
        if commit:
            user.save()
        return user
    
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
            try:
                user = User.objects.get(email=email)
                if not user.check_password(password):
                    raise forms.ValidationError("Contraseña incorrecta.")
                self.user_cache = user
            except User.DoesNotExist:
                raise forms.ValidationError("Este correo no está registrado.")
        return self.cleaned_data