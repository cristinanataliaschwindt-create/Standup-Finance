// content.js - Se inyecta en sitios de e-commerce (Carrefour, Dia, Coto)

console.log("Standup Finance: Content script cargado en", window.location.hostname);

setTimeout(() => {
  detectarProducto();
}, 3000);

async function detectarProducto() {
  const host = window.location.hostname;
  if (!host.includes('carrefour')) return;

  console.log("Standup Finance: Iniciando análisis en Carrefour...");

  // Intento de DOM scraping genérico para Carrefour
  // El título suele estar en un <h1> o clases con "productName"
  let tituloElement = document.querySelector('h1') || document.querySelector('[class*="productName"]');
  let precioElement = document.querySelector('[class*="sellingPrice"]') || document.querySelector('[class*="currencyContainer"]');

  // Valores extraídos del DOM real, con fallback a valores de prueba si fallan los selectores en el prototipo
  let originalName = tituloElement ? tituloElement.innerText.trim() : "Café Premium La Morenita 500g";
  
  let rawPrice = precioElement ? precioElement.innerText : "8000";
  // Limpiar el precio para dejar solo números (ej: "$ 8.000,00" -> 8000)
  let originalPrice = parseFloat(rawPrice.replace(/[^0-9,-]+/g,"").replace(".", "").replace(",", "."));
  if (isNaN(originalPrice)) originalPrice = 8000;

  console.log("Standup Finance detectó:", originalName, "a $", originalPrice);

  try {
    // Consulta a la API local de Next.js
    const response = await fetch('http://localhost:3000/api/substitution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ originalName, originalPrice })
    });

    const data = await response.json();

    if (data.found) {
      mostrarOverlay(data);
    } else {
      console.log("Standup Finance: No se encontraron sustitutos más económicos para este producto.");
    }
  } catch (error) {
    console.error("Standup Finance Error consultando API local. ¿Está corriendo el frontend en localhost:3000?", error);
  }
}

function mostrarOverlay(datos) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.bottom = '20px';
  overlay.style.right = '20px';
  overlay.style.backgroundColor = '#F5F5DC';
  overlay.style.border = '2px solid #8B4513';
  overlay.style.padding = '20px';
  overlay.style.borderRadius = '10px';
  overlay.style.zIndex = '999999';
  overlay.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
  overlay.style.fontFamily = 'sans-serif';
  overlay.style.color = '#8B4513';

  overlay.innerHTML = `
    <h3 style="margin-top:0; color:#FF8C00;">¡Ahorro Encontrado!</h3>
    <p>En lugar de <b>${datos.original}</b> ($${datos.precioOriginal}),<br> 
    te sugerimos <b>${datos.sustituto}</b> ($${datos.precioSustituto}).</p>
    <p style="font-weight:bold; font-size:1.1em;">Ahorras: $${datos.ahorro} ARS</p>
    <button id="btn-sustituir-sf" style="background-color:#FF8C00; color:white; border:none; padding:10px 15px; border-radius:5px; cursor:pointer; font-weight:bold;">
      Aceptar Sustitución y Micro-Invertir
    </button>
  `;

  document.body.appendChild(overlay);

  document.getElementById('btn-sustituir-sf').addEventListener('click', () => {
    // Comunicar el ahorro al popup localmente
    chrome.runtime.sendMessage({ action: "updateSavings", amount: datos.ahorro });
    
    // Redirigir a la Web App para firmar la transacción en Soroban
    const url = new URL('http://localhost:3000/invest');
    url.searchParams.append('amount', datos.ahorro.toString());
    url.searchParams.append('item', datos.sustituto);
    
    window.open(url.toString(), '_blank');
    overlay.remove();
  });
}
