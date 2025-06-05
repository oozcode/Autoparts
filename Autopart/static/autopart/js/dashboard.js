class DashboardVendedor {
  constructor() {
    this.apiUrl = '/api/productos/';
    this.productos = [];
    this.csrfToken = this.getCSRFToken();
    this.modalCrear = new bootstrap.Modal(document.getElementById('crearModal'));
    this.modalEditar = new bootstrap.Modal(document.getElementById('editarModal'));
    this.init();
  }

  init() {
    this.cargarCategoriasYMarcas();
    this.cargarProductos();
    this.setupEventListeners();
    this.cargarFiltroMarcaAuto();
  }

  getCSRFToken() {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || '';
  }
  crearProducto(formData, form) {
  Swal.fire({
    title: '¿Agregar producto?',
    text: '¿Estás seguro de que deseas agregar este producto?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, agregar',
    cancelButtonText: 'Cancelar',
    cancelButtonColor: '#3085d6',
    confirmButtonColor: '#198754',
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'X-CSRFToken': this.csrfToken },
        body: formData
      })
        .then(res => {
          if (!res.ok) throw new Error('Error al crear producto');
          return res.json();
        })
        .then(data => {
          this.modalCrear.hide();
          this.cargarProductos();
          form.reset();
          Swal.fire('¡Agregado!', 'El producto fue agregado.', 'success');
        })
        .catch(() => Swal.fire('Error', 'Error al crear producto. Revisa los datos.', 'error'));
    }
  });
}
  cargarCategoriasYMarcas() {
    // ...tu código existente para cargar categorías y marcas...
    // (sin cambios)
    fetch('/api/categorias/', {
      method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        const selectCatCrear = document.querySelector('#formCrearProducto select[name="categoria"]');
        const selectCatEditar = document.querySelector('#formEditarProducto select[name="categoria"]');
        const filtroCat = document.getElementById('filtroCategoria');
        const opts = data.map(cat => `<option value="${cat.id}">${cat.nombre}</option>`).join('');
        selectCatCrear.innerHTML = opts;
        selectCatEditar.innerHTML = opts;
        filtroCat.innerHTML = '<option value="">Todas</option>' + opts;
      })
      .catch(err => console.warn('No se pudo cargar categorías:', err));

    fetch('/api/marcas/', {
      method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        const selectMarcaCrear = document.querySelector('#formCrearProducto select[name="marca"]');
        const selectMarcaEditar = document.querySelector('#formEditarProducto select[name="marca"]');
        const filtroMarca = document.getElementById('filtroMarca');
        const opts = data.map(mar => `<option value="${mar.id}">${mar.nombre}</option>`).join('');
        selectMarcaCrear.innerHTML = opts;
        selectMarcaEditar.innerHTML = opts;
        filtroMarca.innerHTML = '<option value="">Todas</option>' + opts;
      })
      .catch(err => console.warn('No se pudo cargar marcas:', err));

    fetch('/api/marcas-auto/', {
      method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        const selectAutoCrear = document.querySelector('#formCrearProducto select[name="marcas_auto"]');
        const selectAutoEditar = document.querySelector('#formEditarProducto select[name="marcas_auto"]');
        const opts = data.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
        selectAutoCrear.innerHTML = opts;
        selectAutoEditar.innerHTML = opts;
      })
      .catch(err => console.warn('No se pudo cargar marcas de auto:', err));
  }

  cargarFiltroMarcaAuto() {
    fetch('/api/marcas-auto/')
      .then(res => res.json())
      .then(data => {
        const filtroMarcaAuto = document.getElementById('filtroMarcaAuto');
        if (filtroMarcaAuto) {
          filtroMarcaAuto.innerHTML = '<option value="">Todas las marcas de auto</option>' +
            data.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
        }
      });
  }

  cargarProductos() {
    fetch(this.apiUrl, {
      method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar productos');
        return res.json();
      })
      .then(data => {
        this.productos = data;
        this.renderProductos();
      })
      .catch(err => console.error(err));
  }

  renderProductos(lista = this.productos) {
    // ...tu código existente...
    const tbody = document.getElementById('productosBody');
    tbody.innerHTML = lista
      .map(p => {
        const precioMinorista = (p.precio_minorista !== null && p.precio_minorista !== undefined && p.precio_minorista !== '')
          ? Number(p.precio_minorista).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })
          : '$0';
        const precioMayorista = (p.precio_mayorista !== null && p.precio_mayorista !== undefined && p.precio_mayorista !== '')
          ? Number(p.precio_mayorista).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })
          : '$0';

        const marcasAuto = p.marcas_auto_info && p.marcas_auto_info.length
          ? p.marcas_auto_info.map(m => m.nombre).join(', ')
          : '-';

        return `
          <tr>
            <td>${p.id}</td>
            <td>
              <img src="${p.imagen ? p.imagen.url : '/static/autopart/img/m4.jpg'}" alt="${p.nombre}" style="max-width: 80px;">
            </td>
            <td>${p.nombre}</td>
            <td>${precioMinorista}</td>
            <td>${precioMayorista}</td>
            <td>${p.marca_info ? p.marca_info.nombre : ''}</td>
            <td>${p.categoria_info ? p.categoria_info.nombre : ''}</td>
            <td>${marcasAuto}</td>
            <td>${p.stock}</td>
            <td>
              <div class="dashboard-action-btns">
                <button class="btn btn-edit btn-editar" data-id="${p.id}">Editar</button>
                <button class="btn btn-delete btn-eliminar" data-id="${p.id}">Eliminar</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  setupEventListeners() {
  const formCrear = document.getElementById('formCrearProducto');
  formCrear.addEventListener('submit', (e) => { // Usa función flecha aquí
    e.preventDefault();
    this.crearProducto(new FormData(formCrear), formCrear);
  });

    const formEditar = document.getElementById('formEditarProducto');
    formEditar.addEventListener('submit', e => {
      e.preventDefault();
      const id = formEditar.dataset.id;
      this.editarProducto(id, new FormData(formEditar), formEditar);
    });

    document.querySelector('#editarModal .btn-secondary').addEventListener('click', () => {
      this.modalEditar.hide();
    });

    document.getElementById('productosBody').addEventListener('click', e => {
      const target = e.target;
      const id = target.dataset.id;
      if (target.classList.contains('btn-eliminar')) {
        this.eliminarProducto(id);
      } else if (target.classList.contains('btn-editar')) {
        this.abrirModalEditar(id);
      }
    });

    // Filtros
    document.getElementById('filtroPrecioMayoristaMin').addEventListener('input', () => this.filtrarProductos());
    document.getElementById('filtroPrecioMayoristaMax').addEventListener('input', () => this.filtrarProductos());
    document.getElementById('filtroPrecioMin').addEventListener('input', () => dashboard.filtrarProductos());
    document.getElementById('filtroPrecioMax').addEventListener('input', () => dashboard.filtrarProductos());
    document.getElementById('filtroNombre').addEventListener('input', () => this.filtrarProductos());
    document.getElementById('filtroMarca').addEventListener('change', () => this.filtrarProductos());
    document.getElementById('filtroCategoria').addEventListener('change', () => this.filtrarProductos());
    document.getElementById('filtroMarcaAuto').addEventListener('change', () => this.filtrarProductos());
    document.getElementById('filtroStock').addEventListener('change', () => this.filtrarProductos());
    document.getElementById('btnLimpiarFiltros').addEventListener('click', () => {
      document.getElementById('filtroNombre').value = '';
      document.getElementById('filtroMarca').value = '';
      document.getElementById('filtroCategoria').value = '';
      document.getElementById('filtroMarcaAuto').value = '';
      document.getElementById('filtroStock').value = '';
      this.filtrarProductos();
    });
    
  }
eliminarProducto(id) {
  Swal.fire({
    title: '¿Eliminar producto?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33', // Rojo para el botón de confirmar
    cancelButtonColor: '#3085d6'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${this.apiUrl}${id}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': this.csrfToken }
      })
        .then(res => {
          if (!res.ok) throw new Error('Error al eliminar');
          this.cargarProductos();
          Swal.fire('¡Eliminado!', 'El producto fue eliminado.', 'success');
        })
        .catch(() => Swal.fire('Error', 'No se pudo eliminar el producto.', 'error'));
    }
  });
}
  abrirModalEditar(id) {
    const producto = this.productos.find(p => String(p.id) === String(id));
    if (!producto) return;

    const formEditar = document.getElementById('formEditarProducto');
    formEditar.dataset.id = producto.id;
    formEditar.nombre.value = producto.nombre || '';
    formEditar.descripcion.value = producto.descripcion || '';
    formEditar.precio_minorista.value = producto.precio_minorista || '';
    formEditar.precio_mayorista.value = producto.precio_mayorista || '';
    formEditar.stock.value = producto.stock || '';
    formEditar.peso.value = producto.peso || '';
    formEditar.largo.value = producto.largo || '';
    formEditar.ancho.value = producto.ancho || '';
    formEditar.alto.value = producto.alto || '';
    formEditar.categoria.value = producto.categoria || '';
    formEditar.marca.value = producto.marca || '';

    // Marcas de auto (multi-select)
    const selectMarcasAuto = formEditar.marcas_auto;
    Array.from(selectMarcasAuto.options).forEach(opt => {
      opt.selected = producto.marcas_auto_info && producto.marcas_auto_info.some(m => String(m.id) === String(opt.value));
    });

    this.modalEditar.show();
  }
  editarProducto(id, formData, form) {
  const isOferta = form.querySelector('#ofertaEditar').checked;
  const descuento = parseFloat(form.querySelector('#descuentoEditar').value);
  const precioMinorista = parseFloat(form.querySelector('input[name="precio_minorista"]').value);
  const precioMayorista = parseFloat(form.querySelector('input[name="precio_mayorista"]').value);

  if (isOferta && !isNaN(descuento) && descuento > 0 && descuento < 100) {
    const factor = (100 - descuento) / 100;
    const ofertaMinorista = Math.round(precioMinorista * factor);
    const ofertaMayorista = Math.round(precioMayorista * factor);
    formData.set('precio_oferta_minorista', ofertaMinorista);
    formData.set('precio_oferta_mayorista', ofertaMayorista);
    formData.set('oferta_activa', 'true');
    formData.set('descuento_oferta', descuento);
  } else {
    formData.set('oferta_activa', 'false');
    formData.set('descuento_oferta', '0');
    formData.set('precio_oferta_minorista', '');
    formData.set('precio_oferta_mayorista', '');
  }

  Swal.fire({
    title: '¿Editar producto?',
    text: '¿Estás seguro de que deseas guardar los cambios?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, guardar',
    cancelButtonText: 'Cancelar',
    cancelButtonColor: '#3085d6',
    confirmButtonColor: '#198754'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${this.apiUrl}${id}/`, {
        method: 'PUT',
        headers: { 'X-CSRFToken': this.csrfToken },
        body: formData
      })
        .then(res => {
          if (!res.ok) throw new Error('Error al editar producto');
          return res.json();
        })
        .then(data => {
          this.modalEditar.hide();
          this.cargarProductos();
          form.reset();
          Swal.fire('¡Editado!', 'El producto fue actualizado.', 'success');
        })
        .catch(() => Swal.fire('Error', 'Error al editar producto. Revisa los datos.', 'error'));
    }
  });


}


  // ...crearProducto, eliminarProducto, abrirModalEditar, editarProducto igual...

filtrarProductos() {
  const nombre = document.getElementById('filtroNombre').value.toLowerCase();
  const marca = document.getElementById('filtroMarca').value;
  const categoria = document.getElementById('filtroCategoria').value;
  const marcaAuto = document.getElementById('filtroMarcaAuto').value;
  const stockFiltro = document.getElementById('filtroStock').value;
  const precioMin = parseFloat(document.getElementById('filtroPrecioMin').value) || null;
  const precioMax = parseFloat(document.getElementById('filtroPrecioMax').value) || null;
  const precioMayoristaMin = parseFloat(document.getElementById('filtroPrecioMayoristaMin').value) || null;
  const precioMayoristaMax = parseFloat(document.getElementById('filtroPrecioMayoristaMax').value) || null;

  let lista = this.productos;

  if (nombre) {
    lista = lista.filter(p => p.nombre.toLowerCase().includes(nombre));
  }
  if (marca) {
    lista = lista.filter(p => String(p.marca) === String(marca));
  }
  if (categoria) {
    lista = lista.filter(p => String(p.categoria) === String(categoria));
  }
  if (marcaAuto) {
    lista = lista.filter(p =>
      p.marcas_auto_info && p.marcas_auto_info.some(m => String(m.id) === String(marcaAuto))
    );
  }
  if (stockFiltro === 'con') {
    lista = lista.filter(p => Number(p.stock) > 0);
  } else if (stockFiltro === 'sin') {
    lista = lista.filter(p => Number(p.stock) <= 0);
  }
  if (precioMin !== null) {
    lista = lista.filter(p => Number(p.precio_minorista) >= precioMin);
  }
  if (precioMax !== null) {
    lista = lista.filter(p => Number(p.precio_minorista) <= precioMax);
  }
  if (precioMayoristaMin !== null) {
    lista = lista.filter(p => Number(p.precio_mayorista) >= precioMayoristaMin);
  }
  if (precioMayoristaMax !== null) {
    lista = lista.filter(p => Number(p.precio_mayorista) <= precioMayoristaMax);
  }

  this.renderProductos(lista);
}
}
let tipoEntidad = '';
let selectActualizar = null;
const modalNuevaEntidad = new bootstrap.Modal(document.getElementById('modalNuevaEntidad'));

document.getElementById('btnNuevaMarca').onclick = function() {
  tipoEntidad = 'marca';
  selectActualizar = document.getElementById('filtroMarca');
  document.getElementById('tituloModalNuevaEntidad').textContent = 'Agregar nueva marca';
  document.getElementById('inputNuevaEntidad').value = '';
  modalNuevaEntidad.show();
};
document.getElementById('btnNuevaCategoria').onclick = function() {
  tipoEntidad = 'categoria';
  selectActualizar = document.getElementById('filtroCategoria');
  document.getElementById('tituloModalNuevaEntidad').textContent = 'Agregar nueva categoría';
  document.getElementById('inputNuevaEntidad').value = '';
  modalNuevaEntidad.show();
};
document.getElementById('btnNuevaMarcaAuto').onclick = function() {
  tipoEntidad = 'marca_auto';
  selectActualizar = document.getElementById('filtroMarcaAuto');
  document.getElementById('tituloModalNuevaEntidad').textContent = 'Agregar nueva marca de auto';
  document.getElementById('inputNuevaEntidad').value = '';
  modalNuevaEntidad.show();
};

document.getElementById('formNuevaEntidad').onsubmit = function(e) {
  e.preventDefault();
  const nombre = document.getElementById('inputNuevaEntidad').value.trim();
  if (!nombre) return;

  let url = '';
  if (tipoEntidad === 'marca') url = '/api/marcas/';
  if (tipoEntidad === 'categoria') url = '/api/categorias/';
  if (tipoEntidad === 'marca_auto') url = '/api/marcas-auto/';

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': window.dashboard.csrfToken
    },
    body: JSON.stringify({ nombre })
  })
  .then(res => res.json())
  .then(data => {
    modalNuevaEntidad.hide();
    // Recargar el select correspondiente
    if (tipoEntidad === 'marca') window.dashboard.cargarCategoriasYMarcas();
    if (tipoEntidad === 'categoria') window.dashboard.cargarCategoriasYMarcas();
    if (tipoEntidad === 'marca_auto') window.dashboard.cargarFiltroMarcaAuto();
  })
  .catch(() => alert('Error al agregar. Intenta nuevamente.'));
  
};


document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new DashboardVendedor();
   document
    .getElementById('modalGestionCategoria')
    .addEventListener('show.bs.modal', cargarCategoriasEnModal);
});
function cargarCategoriasEnModal() {
  fetch('/api/categorias/')
    .then(response => response.json())
    .then(data => {
      const contenedor = document.getElementById('listaCategorias');
      contenedor.innerHTML = '';

      if (!data.length) {
        contenedor.innerHTML = '<div class="text-muted text-center">No hay categorías disponibles.</div>';
        return;
      }

      data.forEach(categoria => {
        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex align-items-center justify-content-between border p-2 rounded';

        const img = document.createElement('img');
        img.src = categoria.imagen || '/static/autopart/img/no-image.png';
        img.alt = categoria.nombre;
        img.style = 'width: 60px; height: 60px; object-fit: contain; border: 1px solid #ccc; border-radius: 5px;';

        const inputNombre = document.createElement('input');
        inputNombre.type = 'text';
        inputNombre.value = categoria.nombre;
        inputNombre.className = 'form-control mx-2';
        inputNombre.style.maxWidth = '200px';

        const inputImagen = document.createElement('input');
        inputImagen.type = 'file';
        inputImagen.accept = 'image/*';
        inputImagen.className = 'form-control me-2';
        inputImagen.style.maxWidth = '200px';

        const btnGuardar = document.createElement('button');
        btnGuardar.className = 'btn btn-sm btn-success me-2';
        btnGuardar.innerHTML = '💾';
        btnGuardar.onclick = () => actualizarCategoriaConImagen(categoria.id, inputNombre.value, inputImagen.files[0]);

        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn btn-sm btn-danger';
        btnEliminar.innerHTML = '🗑️';
        btnEliminar.onclick = () => eliminarCategoria(categoria.id);

        const derecha = document.createElement('div');
        derecha.className = 'd-flex align-items-center';
        derecha.appendChild(inputNombre);
        derecha.appendChild(inputImagen);
        derecha.appendChild(btnGuardar);
        derecha.appendChild(btnEliminar);

        wrapper.appendChild(img);
        wrapper.appendChild(derecha);

        contenedor.appendChild(wrapper);
      });
    });
}
function actualizarCategoriaConImagen(id, nuevoNombre, nuevaImagen) {
  if (!nuevoNombre.trim()) {
    Swal.fire('Error', 'El nombre no puede estar vacío', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('nombre', nuevoNombre);
  if (nuevaImagen) {
    formData.append('imagen', nuevaImagen);
  }

  fetch(`/api/categorias/${id}/`, {
    method: 'PATCH',
    headers: {
      'X-CSRFToken': window.dashboard.csrfToken
    },
    body: formData
  })
    .then(res => {
      if (!res.ok) throw new Error();
      Swal.fire('¡Actualizado!', 'La categoría fue actualizada', 'success');
      cargarCategoriasEnModal();
      window.dashboard.cargarCategoriasYMarcas(); // Para refrescar selects
    })
    .catch(() => Swal.fire('Error', 'No se pudo actualizar la categoría', 'error'));
}
function eliminarCategoria(id) {
  Swal.fire({
    title: '¿Eliminar categoría?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`/api/categorias/${id}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': window.dashboard.csrfToken }
      })
        .then(res => {
          if (!res.ok) throw new Error();
          Swal.fire('¡Eliminada!', 'La categoría fue eliminada.', 'success');
          cargarCategoriasEnModal();
          window.dashboard.cargarCategoriasYMarcas(); // refrescar selects
        })
        .catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
    }
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formEditarProducto');
  const ofertaCheckbox = document.getElementById('ofertaEditar');
  const descuentoInput = document.getElementById('descuentoEditar');
  const precioMinoristaInput = form.querySelector('input[name="precio_minorista"]');
  const precioMayoristaInput = form.querySelector('input[name="precio_mayorista"]');
  const precioDescuentoOutput = document.getElementById('precioConDescuentoEditar');

  // Mostrar precio de oferta calculado en pantalla
  function mostrarPrecioConDescuento() {
    const descuento = parseFloat(descuentoInput.value);
    const precioMinorista = parseFloat(precioMinoristaInput.value);

    if (!isNaN(descuento) && descuento > 0 && descuento < 100 && !isNaN(precioMinorista)) {
      const factor = (100 - descuento) / 100;
      const precioDescuento = Math.round(precioMinorista * factor);
      precioDescuentoOutput.value = `$${precioDescuento.toLocaleString('es-CL')}`;
    } else {
      precioDescuentoOutput.value = '';
    }
  }

  // Maneja activación/desactivación de oferta
  ofertaCheckbox.addEventListener('change', () => {
    descuentoInput.disabled = !ofertaCheckbox.checked;
    if (!ofertaCheckbox.checked) {
      descuentoInput.value = '';
      precioDescuentoOutput.value = '';
    } else {
      mostrarPrecioConDescuento();
    }
  });

  descuentoInput.addEventListener('input', mostrarPrecioConDescuento);
  precioMinoristaInput.addEventListener('input', mostrarPrecioConDescuento);

  // Al enviar el formulario, no modificar los precios visibles, solo mandar info correcta
  form.addEventListener('submit', function (e) {
    if (ofertaCheckbox.checked && descuentoInput.value) {
      // Nos aseguramos que el descuento se incluya en el cuerpo de la solicitud
      descuentoInput.disabled = false;  // forzado para evitar que el input vacío no se envíe
    }
  });
});