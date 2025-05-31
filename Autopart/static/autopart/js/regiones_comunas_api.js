const API_KEY = "c27187ca467b4e6ca3f24c48dee7abea";  
const regionSelect = document.getElementById('region');
const comunaSelect = document.getElementById('comuna');
const resultado = document.getElementById('resultado');

// Obtener regiones
fetch("https://testservices.wschilexpress.com/georeference/api/v1.0/regions", {
  headers: {
    "Ocp-Apim-Subscription-Key": API_KEY
  }
})
.then(response => response.json())
.then(data => {
  data.regions.forEach(region => {
    const option = document.createElement("option");
    option.value = region.regionId;
    option.textContent = region.regionName;
    regionSelect.appendChild(option);
  });
});

// Cuando se selecciona una región, obtener comunas
regionSelect.addEventListener("change", () => {
  comunaSelect.innerHTML = "";
  const regionId = regionSelect.value;
  fetch(`https://testservices.wschilexpress.com/georeference/api/v1.0/coverage-areas?RegionCode=${regionId}&type=0`, {
    headers: {
      "Ocp-Apim-Subscription-Key": API_KEY
    }
  })
  .then(response => response.json())
  .then(data => {
    data.coverageAreas.forEach(area => {
      const option = document.createElement("option");
      option.value = area.countyCode;
      option.textContent = area.coverageName;
      comunaSelect.appendChild(option);
    });
  });
});

// Calcular envío al presionar el botón
comunaSelect.addEventListener("change", () => {
  if (comunaSelect.value) {
    document.getElementById("calcularEnvio").click();
  } else {
    document.getElementById("envio").textContent = "$0";
    actualizarResumen();
  }
});

// Modifica la función de cálculo para actualizar el campo de envío
document.getElementById("calcularEnvio").addEventListener("click", () => {
  const comunaDestino = comunaSelect.value;

  if (!comunaDestino) {
    document.getElementById("envio").textContent = "$0";
    return;
  }

  const datos = {
    originCountyCode: "PROV", 
    destinationCountyCode: comunaDestino,
    package: {
      weight: "10",
      height: "1",
      width: "1",
      length: "1"
    },
    productType: 3,
    contentType: 1,
    declaredWorth: "2333",
    deliveryTime: 2
  };

  fetch("https://testservices.wschilexpress.com/rating/api/v1.0/rates/courier", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": API_KEY
    },
    body: JSON.stringify(datos)
  })
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById("shippingOptions");
    container.innerHTML = ""; // Limpiar opciones anteriores

    if (
      data.data &&
      data.data.courierServiceOptions &&
      data.data.courierServiceOptions.length > 0
    ) {
      const opciones = data.data.courierServiceOptions;

      opciones.forEach((opcion, index) => {
        const descripcion = opcion.serviceDescription;
        const valor = parseInt(opcion.serviceValue);

        const radioHTML = `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="opcionEnvio" id="opcionEnvio${index}" value="${valor}">
            <label class="form-check-label" for="opcionEnvio${index}">
              ${descripcion} - $${valor}
            </label>
          </div>
        `;
        container.innerHTML += radioHTML;
      });

      // Agregar evento a cada radio button para actualizar el resumen de envío
      document.getElementsByName("opcionEnvio").forEach(radio => {
        radio.addEventListener("change", (e) => {
          const valor = parseInt(e.target.value);
          document.getElementById("envio").textContent = `$${valor}`;
          // actualizarResumen(); // Descomenta si luego quieres usar esta lógica
        });
      });
    } else {
      container.innerHTML = "<p>No hay opciones de envío disponibles.</p>";
      document.getElementById("envio").textContent = "$0";
    }
  })
  .catch(err => {
    console.error("Error al cargar opciones de envío:", err);
    document.getElementById("shippingOptions").innerHTML = "<p>Error al cargar opciones de envío.</p>";
    document.getElementById("envio").textContent = "$0";
  });
});


// Función para actualizar el resumen del pedido

function actualizarResumen() {
  const subtotal = 10000; 
  const envioTexto = document.getElementById("envio").textContent;
  const envio = envioTexto === "$0" ? 0 : parseInt(envioTexto.replace(/\D/g, ''));
  const total = subtotal + envio;

  
  document.getElementById("subtotal").textContent = `$${subtotal}`;
  document.getElementById("totalFinal").textContent = `$${total}`;

}