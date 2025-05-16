// Funciones principales y utilidades
const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    }).format(price);
};

// Función para mostrar mensajes al usuario
const showMessage = (message, type = 'success') => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
};

// Función para validar formularios
const validateForm = (formData) => {
    const errors = [];
    
    for (const [key, value] of formData.entries()) {
        if (!value) {
            errors.push(`El campo ${key} es requerido`);
        }
    }

    return errors;
}; 