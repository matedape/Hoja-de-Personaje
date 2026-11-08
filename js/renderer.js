// --- MÓDULO DE RENDERIZADO (DOM) ---
import { currentSlot, charactersData, skillFilters} from './state.js';
import { DamageSystem } from './damagesystem.js';


export function renderEquipment() {
  const container = document.getElementById('equipmentList');
  if (!container) return;
  container.innerHTML = '';
  const equipment = charactersData[currentSlot].equipment || [];

  equipment.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'item-card-wrapper';
    const detailsId = `equip-details-${index}`;

    let badgesHTML = '';
    if (item.hasDetails) {
      if (item.dice) badgesHTML += `<span class="badge-stat"><span class="stat-icon icon-dice"></span> ${item.dice}</span>`;
      // El badge de daño ahora es interactivo de una sola vez
      if (item.damageType) {
        badgesHTML += `
          <span class="badge-stat" onclick="inspectDamage('${item.damageType}')" style="cursor: pointer;" title="Clic para ver efectos de daño">
            <span class="stat-icon icon-sword"></span> ${item.damageType}
          </span>
        `;
      }
      if (item.guard) badgesHTML += `<span class="badge-stat"><span class="stat-icon icon-shield"></span> Guardia ${item.guard}</span>`;
    }

    const hasExtraInfo = item.hasDetails && (item.rarity || item.bonusStats || item.range || item.desc);

    card.innerHTML = `
      <div class="item-row" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: rgba(255,255,255,0.6); border: 1px solid var(--paper-border); border-radius: 4px; margin-bottom: 4px;">
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          ${hasExtraInfo ? `<button type="button" class="btn-toggle-info" onclick="toggleItemDetails('${detailsId}')"><span class="tab-icon icon-scroll"></span></button>` : ''}
          <span style="font-weight: bold;">${item.name}</span>
          ${badgesHTML}
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button type="button" class="btn-qty" onclick="moveItem('equip', ${index}, -1)">▲</button>
          <button type="button" class="btn-qty" onclick="moveItem('equip', ${index}, 1)">▼</button>
          <button type="button" class="btn-qty" onclick="changeItemQty('equip', ${index}, -1)">–</button>
          <span style="font-weight: bold; min-width: 24px; text-align: center;">x${item.qty}</span>
          <button type="button" class="btn-qty" onclick="changeItemQty('equip', ${index}, 1)">+</button>
          <button type="button" class="btn-delete" onclick="deleteItem('equip', ${index})">✕</button>
        </div>
      </div>
      ${hasExtraInfo ? `
        <div id="${detailsId}" class="item-extra-info" style="display: none; padding: 8px 12px; margin-top: -3px; margin-bottom: 6px; background: rgba(0,0,0,0.03); border: 1px dashed var(--paper-border); font-size: 0.85rem;">
          ${item.rarity ? `<div style="color: #7a1c1c; font-weight: bold; font-size: 0.9rem;">${item.rarity}</div>` : ''}
          ${item.bonusStats ? `<div><strong>Stats:</strong> ${item.bonusStats}</div>` : ''}
          ${item.range ? `<div><strong>Alcance:</strong> ${item.range}</div>` : ''}
          ${item.effectType && item.desc ? `<div style="margin-top: 4px;"><strong>[${item.effectType}]:</strong> ${item.desc}</div>` : (item.desc ? `<div style="margin-top: 4px;">${item.desc}</div>` : '')}
        </div>
      ` : ''}
    `;
    container.appendChild(card);
  });
}

export function renderBackpack() {
  const container = document.getElementById('bagList');
  if (!container) return;
  container.innerHTML = '';
  const backpack = charactersData[currentSlot].backpack || [];

  backpack.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'item-card-wrapper';
    const detailsId = `bag-details-${index}`;

    let badgesHTML = '';
    if (item.hasDetails) {
      if (item.dice) badgesHTML += `<span class="badge-stat"><span class="stat-icon icon-dice"></span> ${item.dice}</span>`;

 if (item.damageType) {
        badgesHTML += `
          <span class="badge-stat" onclick="inspectDamage('${item.damageType}')" style="cursor: pointer;" title="Clic para ver efectos de daño">
            <span class="stat-icon icon-sword"></span> ${item.damageType}
          </span>
        `;
      }

      if (item.guard) badgesHTML += `<span class="badge-stat"><span class="stat-icon icon-shield"></span> Guardia ${item.guard}</span>`;
    }

    const hasExtraInfo = item.hasDetails && (item.rarity || item.bonusStats || item.range || item.desc);

    card.innerHTML = `
      <div class="item-row" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: rgba(255,255,255,0.6); border: 1px solid var(--paper-border); border-radius: 4px; margin-bottom: 4px;">
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          ${hasExtraInfo ? `<button type="button" class="btn-toggle-info" onclick="toggleItemDetails('${detailsId}')"><span class="tab-icon icon-scroll"></span></button>` : ''}
          <span style="font-weight: bold; text-transform: uppercase;">${item.name}</span>
          ${badgesHTML}
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button type="button" class="btn-qty" onclick="moveItem('backpack', ${index}, -1)">▲</button>
          <button type="button" class="btn-qty" onclick="moveItem('backpack', ${index}, 1)">▼</button>
          <button type="button" class="btn-qty" onclick="changeItemQty('backpack', ${index}, -1)">–</button>
          <span style="font-weight: bold; min-width: 24px; text-align: center;">x${item.qty}</span>
          <button type="button" class="btn-qty" onclick="changeItemQty('backpack', ${index}, 1)">+</button>
          <button type="button" class="btn-delete" onclick="deleteItem('backpack', ${index})">✕</button>
        </div>
      </div>
      ${hasExtraInfo ? `
        <div id="${detailsId}" class="item-extra-info" style="display: none; padding: 8px 12px; margin-top: -3px; margin-bottom: 6px; background: rgba(0,0,0,0.03); border: 1px dashed var(--paper-border); font-size: 0.85rem;">
          ${item.rarity ? `<div style="color: #7a1c1c; font-weight: bold; font-size: 0.9rem;">${item.rarity}</div>` : ''}
          ${item.bonusStats ? `<div><strong>Stats:</strong> ${item.bonusStats}</div>` : ''}
          ${item.range ? `<div><strong>Alcance:</strong> ${item.range}</div>` : ''}
          ${item.effectType && item.desc ? `<div style="margin-top: 4px;"><strong>[${item.effectType}]:</strong> ${item.desc}</div>` : (item.desc ? `<div style="margin-top: 4px;">${item.desc}</div>` : '')}
        </div>
      ` : ''}
    `;
    container.appendChild(card);
  });
}

export function renderSkills() {
  const list = document.getElementById('skillsList');
  const searchInput = document.getElementById('skillSearch');
  if (!list) return;

  const skills = charactersData[currentSlot].skills || [];
  const filter = searchInput ? searchInput.value.toLowerCase().trim() : '';
  list.innerHTML = '';

  // Ordenar: primero las favoritas (máx 3)
  skills.sort((a, b) => (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1));

  // Filtrado por buscador, tipo y etiquetas
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(filter) || 
                          skill.desc.toLowerCase().includes(filter) ||
                          (skill.type && skill.type.toLowerCase().includes(filter));
    
    const matchesType = skillFilters.type === 'all' || skill.type === skillFilters.type;
    const matchesTag = skillFilters.tag === 'all' || (skill.tags && skill.tags.includes(skillFilters.tag));

    return matchesSearch && matchesType && matchesTag;
  });

  if (filteredSkills.length === 0) {
    list.innerHTML = '<p style="font-style: italic; font-size: 0.85rem; text-align: center; color: var(--accent-color);">No hay habilidades que coincidan.</p>';
    return;
  }

  filteredSkills.forEach((skill) => {
    const realIndex = skills.findIndex(s => s.id === skill.id);
    const card = document.createElement('div');
    card.className = `skill-card ${skill.isFavorite ? 'favorite-card' : ''}`;

    const typeClass = (skill.type || 'Activa').toLowerCase();
    const cooldownHTML = skill.cooldown && skill.cooldown.trim() !== '' ? `<span class="badge-cooldown"><span class="stat-icon icon-hourglass"></span> ${skill.cooldown}</span>` : '';
    const starIcon = skill.isFavorite ? '★' : '☆';

    // Generar HTML de las etiquetas asignadas
    let tagsHTML = '';
    if (skill.tags && skill.tags.length > 0) {
      tagsHTML = `<div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px;">` +
       skill.tags.map(t => `<span class="skill-tag-badge">${t}</span>`).join('') +
        `</div>`;
    }

    card.innerHTML = `
      <div class="skill-card-header">
        <div class="skill-badges">
          <button type="button" class="btn-fav ${skill.isFavorite ? 'active' : ''}" onclick="toggleFavoriteSkill(${skill.id})">${starIcon}</button>
          <span class="skill-card-title">${skill.name}</span>
          <span class="badge-type ${typeClass}">${skill.type || 'Activa'}</span>
          ${cooldownHTML}
        </div>
        <div style="display: flex; gap: 4px; align-items: center;">
          ${filter === '' && skillFilters.type === 'all' && skillFilters.tag === 'all' ? `
            <button type="button" class="btn-qty" onclick="moveSkill(${realIndex}, -1)">▲</button>
            <button type="button" class="btn-qty" onclick="moveSkill(${realIndex}, 1)">▼</button>
          ` : ''}
          <button type="button" class="btn-qty" onclick="editSkill(${skill.id})"><span class="tab-icon icon-pencil"></span></button>
          <button type="button" class="btn-delete" onclick="deleteSkill(${skill.id})">✕</button>
        </div>
      </div>
      <div class="skill-card-desc">${skill.desc}</div>
      ${tagsHTML}
    `;
    list.appendChild(card);
  });
}

export function renderStatuses() {
  const list = document.getElementById('statusList');
  if (!list) return;
  list.innerHTML = '';
  const statuses = charactersData[currentSlot].statuses || [];

  statuses.forEach(status => {
    const li = document.createElement('li');
    li.className = 'item-card status-card';
    const rawDuration = status.duration ? status.duration.trim() : '';
    const isNumeric = rawDuration !== '' && !isNaN(parseInt(rawDuration));
    
    let durationHTML = isNumeric ? `
      <div class="item-controls">
        <button type="button" class="btn-qty" onclick="changeStatusQty(${status.id}, -1)">-</button>
        <span class="status-badge"><span class="stat-icon icon-hourglass"></span> ${rawDuration}</span>
        <button type="button" class="btn-qty" onclick="changeStatusQty(${status.id}, 1)">+</button>
      </div>
    ` : (rawDuration !== '' ? `<span class="status-badge"><span class="stat-icon icon-hourglass"></span> ${rawDuration}</span>` : '');

    li.innerHTML = `
      <span><strong>${status.name}</strong></span>
      <div class="item-controls">
        ${durationHTML}
        <button type="button" class="btn-delete" onclick="deleteStatus(${status.id})">✕</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// Función global para inspeccionar el daño con modal de pergamino estilizado
window.inspectDamage = function(rawText) {
  const efectos = DamageSystem.parse(rawText);
  
  const existingModal = document.getElementById('damageInspectModal');
  if (existingModal) existingModal.remove();

  const overlay = document.createElement('div');
  overlay.id = 'damageInspectModal';
  overlay.className = 'damage-modal-overlay';

  let contentHTML = '';
  if (efectos.length > 0) {
    contentHTML = efectos.map(e => `
      <div style="margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed var(--paper-border);">
        <strong style="color: var(--accent-color); font-family: var(--font-title); font-size: 1rem;">
          ${e.icon} ${e.name}
        </strong>
        <p style="font-size: 0.85rem; margin-top: 2px; color: var(--text-color);">${e.effect}</p>
      </div>
    `).join('');
  } else {
    contentHTML = `<p style="font-style: italic; text-align: center; font-size: 0.9rem; color: var(--accent-color);">Este tipo de daño no posee efectos secundarios especiales registrados.</p>`;
  }

  overlay.innerHTML = `
    <div class="damage-modal-card">
      <h3 style="font-family: var(--font-title); color: var(--accent-color); text-align: center; margin-bottom: 12px; border-bottom: 2px solid var(--paper-border); padding-bottom: 6px;">
        Efectos de Daño
      </h3>
      <div style="max-height: 220px; overflow-y: auto; margin-bottom: 15px;">
        ${contentHTML}
      </div>
      <button type="button" id="closeDamageModal" class="btn-action" style="width: 100%; justify-content: center;">
        Entendido
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeModal = () => overlay.remove();
  document.getElementById('closeDamageModal').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
};

export function renderTabs() {
  const tabHeader = document.querySelector('.npc-tab-header');
  if (!tabHeader) return;

  tabHeader.innerHTML = `
    <button type="button" class="tab-btn ${currentSlot === 1 ? 'active' : ''}" onclick="switchSlot(1)">P1</button>
    <button type="button" class="tab-btn ${currentSlot === 2 ? 'active' : ''}" onclick="switchSlot(2)">P2</button>
    <button type="button" class="tab-btn ${currentSlot === 3 ? 'active' : ''}" onclick="switchSlot(3)">P3</button>
  `;
}

export function updateTrackers() {
  const saveBoxes = document.querySelectorAll('.save-cb');
  const saveChecked = document.querySelectorAll('.save-cb:checked').length;
  const saveCountElem = document.getElementById('saveCount');
  const energyBoxes = document.querySelectorAll('.energy-cb');
  const energyChecked = document.querySelectorAll('.energy-cb:checked').length;
  const energyCountElem = document.getElementById('energyCount');

  if (energyCountElem) energyCountElem.textContent = energyBoxes.length - energyChecked;
  if (saveCountElem) saveCountElem.textContent = saveBoxes.length - saveChecked;

  const foodBoxes = document.querySelectorAll('.food-cb');
  const foodChecked = document.querySelectorAll('.food-cb:checked').length;
  const foodCountElem = document.getElementById('foodCount');
  if (foodCountElem) foodCountElem.textContent = foodBoxes.length - foodChecked;
}