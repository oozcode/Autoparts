const API_KEY = "c27187ca467b4e6ca3f24c48dee7abea";
const tipoPedido = document.getElementById("tipo_pedido");
const regionSelect = document.getElementById("region");
const comunaSelect = document.getElementById("comuna");
const envioContainer = document.getElementById("envioContainer");
const shippingOptions = document.getElementById("shippingOptions");
const calcularBtn = document.getElementById("calcularEnvio");

let resumen = {
  subtotal: 0,
  iva: 0,
  envio: 0,
  total: 0
};

function actualizarResumen() {
  const subtotalEl = document.getElementById("subtotal");
  const totalFinalEl = document.getElementById("totalFinal");
  const impuestosEl = document.getElementById("impuestos");
  const envioSeleccionado = document.querySelector("input[name='opcionEnvio']:checked");

  resumen.envio = envioSeleccionado ? parseInt(envioSeleccionado.value) : 0;
  resumen.iva = resumen.subtotal * 0.19;
  resumen.total = resumen.subtotal + resumen.iva + resumen.envio;

  subtotalEl.textContent = resumen.subtotal.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
  impuestosEl.textContent = resumen.iva.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
  totalFinalEl.textContent = resumen.total.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
  document.getElementById("envio").textContent = resumen.envio.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

  validarEnvio(); // <-- Llama a la validación cada vez que se actualiza el resumen
}

function mostrarResumenPedido() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsContainer = document.getElementById("cartItems");

  resumen.subtotal = 0;
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p class='text-muted'>Tu carrito está vacío.</p>";
    return;
  }

  cart.forEach(item => {
    const totalItem = item.price * item.quantity;
    resumen.subtotal += totalItem;

    const itemHTML = `
      <div class="d-flex justify-content-between border-bottom py-2">
        <div><strong>${item.name}</strong><div class="text-muted small">Cantidad: ${item.quantity}</div></div>
        <div>${totalItem.toLocaleString("es-CL", { style: "currency", currency: "CLP" })}</div>
      </div>`;
    cartItemsContainer.insertAdjacentHTML("beforeend", itemHTML);
  });

  actualizarResumen();
}

tipoPedido.addEventListener("change", () => {
  if (tipoPedido.value === "delivery") {
    envioContainer.style.display = "block";
    calcularBtn.style.display = "inline-block";
  } else {
    envioContainer.style.display = "block";
    shippingOptions.innerHTML = `<p class="text-muted">Retiro disponible en: <br><strong>Providencia 666, Providencia</strong></p>`;
  }
  actualizarResumen();
});

fetch("https://testservices.wschilexpress.com/georeference/api/v1.0/regions", {
  headers: { "Ocp-Apim-Subscription-Key": API_KEY }
})
.then(res => res.json())
.then(data => {
  data.regions.forEach(region => {
    const opt = document.createElement("option");
    opt.value = region.regionId;
    opt.textContent = region.regionName;
    regionSelect.appendChild(opt);
  });
});

regionSelect.addEventListener("change", () => {
  comunaSelect.innerHTML = "<option value=''>Cargando...</option>";
  const regionId = regionSelect.value;

  fetch(`https://testservices.wschilexpress.com/georeference/api/v1.0/coverage-areas?RegionCode=${regionId}&type=0`, {
    headers: { "Ocp-Apim-Subscription-Key": API_KEY }
  })
  .then(res => res.json())
  .then(data => {
    comunaSelect.innerHTML = "<option value=''>Seleccione una comuna</option>";
    data.coverageAreas.forEach(area => {
      const opt = document.createElement("option");
      opt.value = area.countyCode;
      opt.textContent = area.coverageName;
      comunaSelect.appendChild(opt);
    });
  });
});

calcularBtn.addEventListener("click", () => {
  const comunaDestino = comunaSelect.value;
  if (!comunaDestino) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  let totalPeso = 0;
  let maxAlto = 0;
  let maxAncho = 0;
  let totalLargo = 0;

  cart.forEach(item => {
    const cantidad = item.quantity || 1;
    totalPeso += (item.peso || 0) * cantidad;
    totalLargo += (item.largo || 0) * cantidad;
    maxAncho = Math.max(maxAncho, item.ancho || 0);
    maxAlto = Math.max(maxAlto, item.alto || 0);
  });

  if (totalPeso === 0 || totalLargo === 0 || maxAncho === 0 || maxAlto === 0) {
    shippingOptions.innerHTML = "<p>Las dimensiones del paquete no son válidas.</p>";
    return;
  }

  const datos = {
    originCountyCode: "PROV",
    destinationCountyCode: comunaDestino,
    package: {
      weight: totalPeso.toFixed(2),
      height: maxAlto.toFixed(2),
      width: maxAncho.toFixed(2),
      length: totalLargo.toFixed(2)
    },
    productType: 3,
    contentType: 1,
    declaredWorth: resumen.subtotal.toString(),
    deliveryTime: 0
  };

  fetch("https://testservices.wschilexpress.com/rating/api/v1.0/rates/courier", { 
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": API_KEY
    },
    body: JSON.stringify(datos)
  })
  .then(res => res.json())
  .then(data => {
    console.log("Solicitud enviada a Chilexpress:", datos);

    shippingOptions.innerHTML = "";
    if (data.data?.courierServiceOptions?.length) {
      data.data.courierServiceOptions.forEach((opcion, i) => {
        shippingOptions.innerHTML += `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="opcionEnvio" id="opcion${i}" value="${opcion.serviceValue}">
            <label class="form-check-label" for="opcion${i}">
              ${opcion.serviceDescription} - $${parseInt(opcion.serviceValue).toLocaleString("es-CL")}
            </label>
          </div>`;
      });

      document.querySelectorAll("input[name='opcionEnvio']").forEach(radio => {
        radio.addEventListener("change", actualizarResumen);
        radio.addEventListener("change", validarEnvio); // <-- Importante para la validación
      });
    } else {
      shippingOptions.innerHTML = "<p>No hay opciones de envío disponibles.</p>";
    }
    validarEnvio(); // <-- Llama a la validación después de cargar opciones
  })
  .catch(() => {
    shippingOptions.innerHTML = "<p>Error al calcular envío.</p>";
    validarEnvio();
  });
});

// --- VALIDACIÓN DEL BOTÓN SIGUIENTE ---
function validarEnvio() {
  const form = document.getElementById("billingForm");
  const btnSiguiente = document.getElementById("btnSiguiente");
  if (!form || !btnSiguiente) return;

  const isFormValid = form.checkValidity();
  const isDelivery = tipoPedido.value === "delivery";
  const envioSeleccionado = document.querySelector("input[name='opcionEnvio']:checked");
  const envioValor = envioSeleccionado ? parseInt(envioSeleccionado.value) : 0;

  if (isDelivery && envioValor === 0) {
    btnSiguiente.disabled = true;
  } else {
    btnSiguiente.disabled = !isFormValid;
  }
}

// Observa cambios en las opciones de envío (por si se actualizan dinámicamente)
if (shippingOptions) {
  const observer = new MutationObserver(validarEnvio);
  observer.observe(shippingOptions, { childList: true, subtree: true });
}

// Valida también al cambiar el tipo de pedido o cualquier input del form
document.addEventListener("DOMContentLoaded", () => {
  mostrarResumenPedido();
  envioContainer.style.display = "none";

  const form = document.getElementById("billingForm");
  if (form) {
    form.addEventListener("input", validarEnvio);
  }
  if (tipoPedido) {
    tipoPedido.addEventListener("change", validarEnvio);
  }
  validarEnvio();
});