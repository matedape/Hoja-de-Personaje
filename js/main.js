// --- MÓDULO PRINCIPAL DE ENTRADA ---
import {
  currentSlot,
  setCurrentSlot,
  charactersData,
  formInputIds,
  editingSkillId,
  setEditingSkillId,
  MAX_SLOTS,
  skillFilters
} from './state.js';

import {
  saveCurrentCharacterData,
  loadCurrentCharacterData,
  loadAllSlotsFromStorage,
  migrateOldDataIfNeeded,
  exportCharacter,
  triggerImport,
  importCharacter
} from './storage.js';

import {
  renderEquipment,
  renderBackpack,
  renderSkills,
  renderStatuses,
  renderTabs,
  updateTrackers
} from './renderer.js';

// --- INICIALIZACIÓN DE LA APLICACIÓN ---
window.addEventListener('DOMContentLoaded', () => {
  const savedSlot = loadAllSlotsFromStorage();
  if (savedSlot) setCurrentSlot(savedSlot);
  
  migrateOldDataIfNeeded();
  renderTabs();
  loadCurrentCharacterData();

  // Escuchadores de eventos para autoguardado de campos generales
  document.addEventListener('input', (e) => {
    if (formInputIds.includes(e.target.id)) return;
    saveCurrentCharacterData();
  });

  document.addEventListener('change', (e) => {
    saveCurrentCharacterData();
    if (e.target.classList.contains('save-cb') || e.target.classList.contains('food-cb') || e.target.classList.contains('energy-cb')) {
      updateTrackers();
    }
  });
});

// --- VINCULACIÓN AL OBJETO WINDOW (PARA EVENTOS EN EL HTML) ---
window.renderTabs = renderTabs;
window.renderEquipment = renderEquipment;
window.renderBackpack = renderBackpack;
window.renderSkills = renderSkills;
window.renderStatuses = renderStatuses;
window.updateTrackers = updateTrackers;
window.exportCharacter = exportCharacter;
window.triggerImport = triggerImport;
window.importCharacter = importCharacter;

window.switchSlot = function(newSlot) {
  if (newSlot === currentSlot) return;
  saveCurrentCharacterData();
  setCurrentSlot(newSlot);
  loadCurrentCharacterData();
  renderTabs();
};

window.addNewCharacterSlot = function() {
  let nextSlot = (currentSlot % MAX_SLOTS) + 1;
  window.switchSlot(nextSlot);
};

window.toggleSheetFace = function() {
  const card = document.getElementById('sheetCard');
  if (card) card.classList.toggle('flipped');
};

// --- OPERACIONES CRUD EQUIPAMIENTO ---
window.addEquipment = function() {
  const nameInput = document.getElementById('equipName');
  const qtyInput = document.getElementById('equipQty');
  const hasDetails = document.getElementById('equipHasDetails')?.checked || false;
  if (!nameInput || nameInput.value.trim() === '') return;

  const newItem = {
    id: Date.now(),
    name: nameInput.value.trim(),
    qty: parseInt(qtyInput.value) || 1,
    hasDetails: hasDetails
  };

  if (hasDetails) {
    newItem.category = document.getElementById('equipCategory').value;
    newItem.effectType = document.getElementById('equipEffectType').value;
    newItem.rarity = document.getElementById('equipRarity').value.trim();
    newItem.desc = document.getElementById('equipDesc').value.trim();
    if (newItem.category === 'weapon') {
      newItem.dice = document.getElementById('equipDice').value.trim();
      newItem.damageType = document.getElementById('equipDamageType').value.trim();
      newItem.range = document.getElementById('equipRange').value.trim();
    } else if (newItem.category === 'armor') {
      newItem.guard = document.getElementById('equipGuard').value.trim();
      newItem.bonusStats = document.getElementById('equipBonusStats').value.trim();
    }
  }

  charactersData[currentSlot].equipment.push(newItem);
  nameInput.value = '';
  qtyInput.value = '1';
  document.getElementById('equipHasDetails').checked = false;
  window.toggleExtraFields('equip');
  renderEquipment();
  saveCurrentCharacterData();
};

// --- OPERACIONES CRUD MOCHILA ---
window.addBagItem = function() {
  const nameInput = document.getElementById('bagName');
  const qtyInput = document.getElementById('bagQty');
  const hasDetails = document.getElementById('bagHasDetails')?.checked || false;
  if (!nameInput || nameInput.value.trim() === '') return;

  const newItem = {
    id: Date.now(),
    name: nameInput.value.trim(),
    qty: parseInt(qtyInput.value) || 1,
    hasDetails: hasDetails
  };

  if (hasDetails) {
    newItem.category = document.getElementById('bagCategory').value;
    newItem.effectType = document.getElementById('bagEffectType').value;
    newItem.rarity = document.getElementById('bagRarity').value.trim();
    newItem.desc = document.getElementById('bagDesc').value.trim();
    if (newItem.category === 'weapon') {
      newItem.dice = document.getElementById('bagDice').value.trim();
      newItem.damageType = document.getElementById('bagDamageType').value.trim();
      newItem.range = document.getElementById('bagRange').value.trim();
    } else if (newItem.category === 'armor') {
      newItem.guard = document.getElementById('bagGuard').value.trim();
      newItem.bonusStats = document.getElementById('bagBonusStats').value.trim();
    }
  }

  charactersData[currentSlot].backpack.push(newItem);
  nameInput.value = '';
  qtyInput.value = '1';
  document.getElementById('bagHasDetails').checked = false;
  window.toggleExtraFields('bag');
  renderBackpack();
  saveCurrentCharacterData();
};

// --- FILTRADO DE HABILIDADES ---
window.filterSkills = function(category, value) {
  if (category === 'type') {
    skillFilters.type = value;
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === value);
    });
  } else if (category === 'tag') {
    skillFilters.tag = value;
    document.querySelectorAll('.filter-tag-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tag === value);
    });
  }
  renderSkills();
};

// --- OPERACIONES CRUD HABILIDADES ---
window.addSkill = function() {
  const nameInput = document.getElementById('skillName');
  const typeSelect = document.getElementById('skillType');
  const cooldownInput = document.getElementById('skillCooldown');
  const descInput = document.getElementById('skillDesc');
  if (!nameInput || nameInput.value.trim() === '') return;
  
  // Recolectar etiquetas seleccionadas
  const selectedTags = [];
  const tagCheckboxes = document.querySelectorAll('#skillTagsContainer input[type="checkbox"]:checked');
  tagCheckboxes.forEach(cb => selectedTags.push(cb.value));

  const skills = charactersData[currentSlot].skills;

  if (editingSkillId !== null) {
    const skill = skills.find(s => s.id === editingSkillId);
    if (skill) {
      skill.name = nameInput.value.trim();
      skill.type = typeSelect ? typeSelect.value : 'Activa';
      skill.cooldown = cooldownInput ? cooldownInput.value.trim() : '';
      skill.desc = descInput ? descInput.value.trim() : '';
      skill.tags = selectedTags;
    }
    setEditingSkillId(null);
    document.getElementById('btnSaveSkill').textContent = '+ Agregar Habilidad';
  } else {
    skills.push({
      id: Date.now(),
      name: nameInput.value.trim(),
      type: typeSelect ? typeSelect.value : 'Activa',
      cooldown: cooldownInput ? cooldownInput.value.trim() : '',
      desc: descInput ? descInput.value.trim() : '',
      tags: selectedTags,
      isFavorite: false
    });
  }

  nameInput.value = '';
  if (cooldownInput) cooldownInput.value = '';
  if (descInput) descInput.value = '';
  tagCheckboxes.forEach(cb => cb.checked = false);

  renderSkills();
  saveCurrentCharacterData();
};

// --- OPERACIONES CRUD ESTADOS ---
window.addStatus = function() {
  const nameInput = document.getElementById('statusName');
  const durationInput = document.getElementById('statusDuration');
  if (!nameInput || nameInput.value.trim() === '') return;

  charactersData[currentSlot].statuses.push({
    id: Date.now(),
    name: nameInput.value.trim(),
    duration: durationInput ? durationInput.value.trim() : ''
  });

  nameInput.value = '';
  if (durationInput) durationInput.value = '';
  renderStatuses();
  saveCurrentCharacterData();
};

window.changeItemQty = function(storageKey, index, delta) {
  const list = storageKey === 'equip' ? charactersData[currentSlot].equipment : charactersData[currentSlot].backpack;
  if (list[index]) {
    list[index].qty += delta;
    if (list[index].qty <= 0) list.splice(index, 1);
    if (storageKey === 'equip') renderEquipment();
    else renderBackpack();
    saveCurrentCharacterData();
  }
};

window.deleteItem = function(storageKey, index) {
  if (storageKey === 'equip') {
    charactersData[currentSlot].equipment.splice(index, 1);
    renderEquipment();
  } else {
    charactersData[currentSlot].backpack.splice(index, 1);
    renderBackpack();
  }
  saveCurrentCharacterData();
};

window.deleteSkill = function(id) {
  charactersData[currentSlot].skills = charactersData[currentSlot].skills.filter(s => s.id !== id);
  renderSkills();
  saveCurrentCharacterData();
};

window.deleteStatus = function(id) {
  charactersData[currentSlot].statuses = charactersData[currentSlot].statuses.filter(s => s.id !== id);
  renderStatuses();
  saveCurrentCharacterData();
};

// --- CONTROL DE FAVORITOS (MÁXIMO 3) ---
window.toggleFavoriteSkill = function(id) {
  const skills = charactersData[currentSlot].skills;
  const skill = skills.find(s => s.id === id);
  if (!skill) return;

  if (!skill.isFavorite) {
    const currentFavoritesCount = skills.filter(s => s.isFavorite).length;
    if (currentFavoritesCount >= 3) {
      alert("⚠️ Solo puedes tener un máximo de 3 habilidades favoritas (acceso rápido). Desmarca una para elegir otra.");
      return;
    }
    skill.isFavorite = true;
  } else {
    skill.isFavorite = false;
  }

  renderSkills();
  saveCurrentCharacterData();
};

window.editSkill = function(id) {
  const skill = charactersData[currentSlot].skills.find(s => s.id === id);
  if (!skill) return;
  document.getElementById('skillName').value = skill.name;
  document.getElementById('skillType').value = skill.type || 'Activa';
  document.getElementById('skillCooldown').value = skill.cooldown || '';
  document.getElementById('skillDesc').value = skill.desc || '';
  
  // Marcar los checkboxes de etiquetas correspondientes
  const tagCheckboxes = document.querySelectorAll('#skillTagsContainer input[type="checkbox"]');
  tagCheckboxes.forEach(cb => {
    cb.checked = skill.tags && skill.tags.includes(cb.value);
  });

  setEditingSkillId(id);
  document.getElementById('btnSaveSkill').innerHTML = '<span class="tab-icon icon-save"></span> Guardar Cambios';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.moveItem = function(type, index, direction) {
  const list = type === 'equip' ? charactersData[currentSlot].equipment : charactersData[currentSlot].backpack;
  const targetIndex = index + direction;
  if (targetIndex >= 0 && targetIndex < list.length) {
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    if (type === 'equip') renderEquipment();
    else renderBackpack();
    saveCurrentCharacterData();
  }
};

window.moveSkill = function(index, direction) {
  const skills = charactersData[currentSlot].skills;
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= skills.length) return;
  const currentSkill = skills[index];
  const targetSkill = skills[targetIndex];
  if (currentSkill.isFavorite && !targetSkill.isFavorite) return;
  if (!currentSkill.isFavorite && targetSkill.isFavorite) return;
  skills[index] = targetSkill;
  skills[targetIndex] = currentSkill;
  renderSkills();
  saveCurrentCharacterData();
};

window.changeStatusQty = function(id, delta) {
  const status = charactersData[currentSlot].statuses.find(s => s.id === id);
  if (status) {
    let current = parseInt(status.duration);
    if (!isNaN(current)) {
      current += delta;
      if (current <= 0) {
        deleteStatus(id);
        return;
      }
      status.duration = current.toString();
      renderStatuses();
      saveCurrentCharacterData();
    }
  }
};

// --- CONTROL DE UI INTERACTIVA ---
window.updateItemCategoryFields = function(prefix) {
  const category = document.getElementById(`${prefix}Category`).value;
  const weaponFields = document.getElementById(`${prefix}FieldsWeapon`);
  const armorFields = document.getElementById(`${prefix}FieldsArmor`);
  if (weaponFields) weaponFields.style.display = (category === 'weapon') ? 'grid' : 'none';
  if (armorFields) armorFields.style.display = (category === 'armor') ? 'grid' : 'none';
};

window.toggleExtraFields = function(prefix) {
  const check = document.getElementById(`${prefix}HasDetails`);
  const container = document.getElementById(`${prefix}ExtraFields`);
  if (check && container) {
    container.style.display = check.checked ? 'block' : 'none';
    if (check.checked) window.updateItemCategoryFields(prefix);
  }
};

window.toggleItemDetails = function(elementId) {
  const detailsDiv = document.getElementById(elementId);
  if (detailsDiv) {
    detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
  }
};