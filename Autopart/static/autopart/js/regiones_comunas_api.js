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
    actualizarResumen();
    return;
  }

  const datos = {
    originCountyCode: "PROV", 
    destinationCountyCode: comunaDestino,
    package: {
      weight: "16",
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
    if (data.rates && data.rates.length > 0) {
      const envio = parseInt(data.rates[0].serviceValue);
      document.getElementById("envio").textContent = `$${envio}`;
      actualizarResumen(); 
    } else {
      document.getElementById("envio").textContent = "$0";
      actualizarResumen();
    }
  })
  .catch(err => {
    document.getElementById("envio").textContent = "$0";
    actualizarResumen();
    console.error(err);
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