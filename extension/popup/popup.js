document.addEventListener('DOMContentLoaded', () => {
  const btnDashboard = document.getElementById('btn-dashboard');
  
  if (btnDashboard) {
    btnDashboard.addEventListener('click', () => {
      // Por ahora simulamos abrir el dashboard de localhost
      window.open('http://localhost:3000', '_blank');
    });
  }

  // Aquí podemos escuchar mensajes del content.js para actualizar la UI
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateSavings") {
      document.getElementById('status-card').classList.add('hidden');
      const summary = document.getElementById('savings-summary');
      summary.classList.remove('hidden');
      summary.querySelector('.amount').textContent = `$${request.amount} ARS`;
    }
  });
});
