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
  }

  getCSRFToken() {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || '';
  }

  cargarCategoriasYMarcas() {
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
    const tbody = document.getElementById('productosBody');
    tbody.innerHTML = lista
      .map(p => `
        <tr>
          <td>${p.id}</td>
          <td><img src="${p.imagen || ''}" alt="${p.nombre}" style="max-width: 80px;"></td>
          <td>${p.nombre}</td>
          <td>${p.precio_minorista}</td>
          <td>${p.precio_mayorista}</td>
          <td>${p.marca_info ? p.marca_info.nombre : ''}</td>
          <td>${p.categoria_info ? p.categoria_info.nombre : ''}</td>
          <td>${p.stock}</td>
          <td>
            <button class="btn btn-warning btn-sm btn-editar" data-id="${p.id}">✏️</button>
            <button class="btn btn-danger btn-sm btn-eliminar" data-id="${p.id}">🗑️</button>
          </td>
        </tr>
      `)
      .join('');
  }

  setupEventListeners() {
    const formCrear = document.getElementById('formCrearProducto');
    formCrear.addEventListener('submit', e => {
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

    document.getElementById('filtroNombre').addEventListener('input', () => this.filtrarProductos());
    document.getElementById('filtroMarca').addEventListener('change', () => this.filtrarProductos());
    document.getElementById('filtroCategoria').addEventListener('change', () => this.filtrarProductos());
  }

  crearProducto(formData, form) {
    fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'X-CSRFToken': this.csrfToken },
      credentials: 'include',
      body: formData
    })
      .then(res => {
        if (!res.ok) return res.json().then(errJson => { throw new Error(Object.values(errJson).flat().join(', ')); });
        return res.json();
      })
      .then(productoNuevo => {
        this.productos.push(productoNuevo);
        this.renderProductos();
        this.modalCrear.hide();
        form.reset();
      })
      .catch(err => alert('Error al crear producto: ' + err.message));
  }

  eliminarProducto(id) {
    if (!confirm('¿Seguro quieres eliminar este producto? 😢')) return;
    fetch(`${this.apiUrl}${id}/`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-CSRFToken': this.csrfToken }
    })
      .then(res => {
        if (res.status === 204) {
          this.productos = this.productos.filter(p => p.id != id);
          this.renderProductos();
        } else {
          return res.json().then(errJson => { throw new Error(Object.values(errJson).flat().join(', ')); });
        }
      })
      .catch(err => alert('Error al eliminar: ' + err.message));
  }

  abrirModalEditar(id) {
    const producto = this.productos.find(p => p.id == id);
    if (!producto) return alert('Producto no encontrado');

    const formEditar = document.getElementById('formEditarProducto');
    formEditar.dataset.id = producto.id;

    formEditar.querySelector('[name="nombre"]').value = producto.nombre || '';
    formEditar.querySelector('[name="descripcion"]').value = producto.descripcion || '';
    formEditar.querySelector('[name="precio_minorista"]').value = producto.precio_minorista || '';
    formEditar.querySelector('[name="precio_mayorista"]').value = producto.precio_mayorista || '';
    formEditar.querySelector('[name="stock"]').value = producto.stock || '';
    formEditar.querySelector('[name="marca"]').value = producto.marca || '';
    formEditar.querySelector('[name="categoria"]').value = producto.categoria || '';
    formEditar.querySelector('[name="peso"]').value = producto.peso || '';
    formEditar.querySelector('[name="largo"]').value = producto.largo || '';
    formEditar.querySelector('[name="ancho"]').value = producto.ancho || '';
    formEditar.querySelector('[name="alto"]').value = producto.alto || '';

    this.modalEditar.show();
  }

  editarProducto(id, formData, form) {
    fetch(`${this.apiUrl}${id}/`, {
      method: 'PATCH',
      headers: { 'X-CSRFToken': this.csrfToken },
      credentials: 'include',
      body: formData
    })
      .then(res => {
        if (!res.ok) return res.json().then(errJson => { throw new Error(Object.values(errJson).flat().join(', ')); });
        return res.json();
      })
      .then(actualizado => {
        const index = this.productos.findIndex(p => p.id == id);
        if (index !== -1) {
          this.productos[index] = actualizado;
          this.renderProductos();
        }
        this.modalEditar.hide();
        form.reset();
      })
      .catch(err => alert('Error al actualizar producto: ' + err.message));
  }

  filtrarProductos() {
    const nombre = document.getElementById('filtroNombre').value.toLowerCase();
    const marca = document.getElementById('filtroMarca').value;
    const categoria = document.getElementById('filtroCategoria').value;

    const productosFiltrados = this.productos.filter(p => {
      return (
        (!nombre || p.nombre.toLowerCase().includes(nombre)) &&
        (!marca || String(p.marca) === marca) &&
        (!categoria || String(p.categoria) === categoria)
      );
    });

    this.renderProductos(productosFiltrados);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new DashboardVendedor();
});
