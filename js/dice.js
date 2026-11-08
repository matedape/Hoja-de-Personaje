export function initDiceRoller() {
  const btn = document.getElementById('floatingDiceBtn');
  const overlay = document.getElementById('diceModalOverlay');
  const closeBtn = document.getElementById('closeDiceModalBtn');
  const rollBtn = document.getElementById('executeRollBtn');
  const resultContainer = document.getElementById('diceResultContainer');
  const totalDisplay = document.getElementById('diceTotalDisplay');
  const detailsBtn = document.getElementById('toggleDetailsBtn');
  const detailsList = document.getElementById('diceDetailsList');
  const critBanner = document.getElementById('critBanner');

  if (!btn || !overlay) return;

  // Abrir modal
  btn.addEventListener('click', () => {
    overlay.style.display = 'flex';
    resultContainer.style.display = 'none';
  });

  // Cerrar modal con botón
  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  // Cerrar haciendo clic afuera del recuadro
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.style.display = 'none';
    }
  });

  // Toggle para desplegar/ocultar el detalle de los dados
  detailsBtn.addEventListener('click', () => {
    if (detailsList.style.display === 'none') {
      detailsList.style.display = 'block';
      detailsBtn.textContent = 'Ocultar detalle de dados';
    } else {
      detailsList.style.display = 'none';
      detailsBtn.textContent = 'Ver detalle de dados';
    }
  });

  // Ejecutar tirada
  rollBtn.addEventListener('click', () => {
    const count = parseInt(document.getElementById('diceCountInput').value) || 1;
    const faces = parseInt(document.getElementById('diceTypeSelect').value) || 6;
    const modifier = parseInt(document.getElementById('diceModifierInput').value) || 0;

    // Mostrar estado de carga / animación de números
    resultContainer.style.display = 'block';
    totalDisplay.textContent = '🎲...';
    critBanner.style.display = 'none';
    detailsList.style.display = 'none';
    detailsBtn.textContent = 'Ver detalle de dados';
    detailsList.innerHTML = '';

    setTimeout(() => {
      let rolls = [];
      let sum = 0;
      let allMax = true;

      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * faces) + 1;
        rolls.push(roll);
        sum += roll;
        if (roll !== faces) {
          allMax = false;
        }
      }

      const finalTotal = sum + modifier;
      totalDisplay.textContent = finalTotal;

      // Si todos los dados sacaron su cara máxima, se activa el crítico épico
      if (allMax && count > 0 && faces > 1) {
        critBanner.style.display = 'block';
      } else {
        critBanner.style.display = 'none';
      }

      // Rellenar lista de desglose individual
      let detailsHTML = `<strong>Tirada:</strong> ${count}d${faces} ${modifier >= 0 ? '+' + modifier : modifier}<br>`;
      detailsHTML += `<strong>Resultados:</strong> [${rolls.join(', ')}]`;
      if (modifier !== 0) {
        detailsHTML += `<br><strong>Modificador:</strong> ${modifier}`;
      }
      detailsList.innerHTML = detailsHTML;
    }, 600);
  });
}

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  initDiceRoller();
});