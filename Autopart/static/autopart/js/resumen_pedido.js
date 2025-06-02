
document.addEventListener("DOMContentLoaded", () => {
  const resumenCliente = JSON.parse(localStorage.getItem("cliente")) || {};
  const resumenPedido = JSON.parse(localStorage.getItem("resumen")) || {};
  const carrito = JSON.parse(localStorage.getItem("cart")) || [];

  // Render cliente
  const divCliente = document.getElementById("resumenCliente");
  divCliente.innerHTML = `
    <p><strong>Nombre:</strong> ${resumenCliente.nombre} ${resumenCliente.apellidos}</p>
    <p><strong>RUT:</strong> ${resumenCliente.rut}</p>
    <p><strong>Email:</strong> ${resumenCliente.email}</p>
    <p><strong>Teléfono:</strong> ${resumenCliente.telefono}</p>
    <p><strong>Dirección:</strong> ${resumenCliente.calle} ${resumenCliente.numero}, ${resumenCliente.comuna}, ${resumenCliente.region}</p>
    <p><strong>Tipo de Pedido:</strong> ${resumenCliente.tipo_pedido}</p>
  `;

  // Render productos
  const productosDiv = document.getElementById("resumenProductos");
  let subtotal = 0;
  carrito.forEach(item => {
    const totalItem = item.price * item.quantity;
    subtotal += totalItem;

    productosDiv.innerHTML += `
      <div class="d-flex justify-content-between border-bottom py-2">
        <div><strong>${item.name}</strong><div class="text-muted small">x${item.quantity}</div></div>
        <div>${totalItem.toLocaleString("es-CL", { style: "currency", currency: "CLP" })}</div>
      </div>`;
  });

  const iva = subtotal * 0.19;
  const envio = resumenPedido.envio || 0;
  const total = subtotal + iva + envio;

  document.getElementById("resumenSubtotal").textContent = subtotal.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
  document.getElementById("resumenIva").textContent = iva.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
  document.getElementById("resumenEnvio").textContent = envio.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
  document.getElementById("resumenTotal").textContent = total.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

  document.getElementById("btnConfirmarPago").addEventListener("click", () => {
  const metodo = document.getElementById("metodoPago").value;
  if (!metodo) {
    alert("Por favor selecciona un método de pago.");
    return;
  }

  const cliente = JSON.parse(localStorage.getItem("cliente"));
  const cart = JSON.parse(localStorage.getItem("cart"));
  const resumen = JSON.parse(localStorage.getItem("resumen"));

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + "=")) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  fetch("/crear_pedido/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken")
    },
    body: JSON.stringify({
        ...cliente,
        cart,
        resumen,
        tipo_pedido: cliente.tipo_pedido
        })
  })
    .then(res => res.json())
    .then(data => {
      if (data.order_id) {
        localStorage.setItem("order_id", data.order_id);

        if (metodo === "tarjeta") {
          window.location.href = `/pagar/${data.order_id}/`;
        } else {
          alert("Método de pago no implementado todavía.");
        }
      } else {
        alert("Error al crear el pedido.");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Ocurrió un error al procesar tu pedido.");
    });
});

});
