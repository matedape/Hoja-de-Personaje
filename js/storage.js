// --- MÓDULO DE PERSISTENCIA Y ALMACENAMIENTO ---
import {
  currentSlot,
  MAX_SLOTS,
  charactersData,
  formInputIds,
  setCharactersData,
  createEmptyCharacter,
  normalizeCharacter
} from './state.js';
import { renderEquipment, renderBackpack, renderStatuses, renderSkills, updateTrackers } from './renderer.js';

// Mapa de respaldo para convertir fichas viejas (basadas en índices) al nuevo sistema por ID
const legacyInputMap = {
  0: 'charName',
  1: 'charClass',
  2: 'charSex',
  3: 'charRace',
  4: 'charLevel',
  5: 'charLife',
  6: 'charExp',
  7: 'charGold',
  8: 'attrConstitution',
  9: 'attrStrength',
  10: 'attrDexterity',
  11: 'attrIntelligence',
  12: 'attrWisdom',
  13: 'attrCharisma',
  14: 'attrSpeed',
  15: 'attrPerception',
  16: 'attrHitDice',
  17: 'attrGuard'
};

export function saveCurrentCharacterData() {
  const container = document.getElementById('sheetCard');
  if (!container) return;

  const currentChar = normalizeCharacter(charactersData[currentSlot]);
  const inputsData = {};
  const inputs = container.querySelectorAll('input[type="text"], input[type="number"], textarea, select');

  inputs.forEach((input, index) => {
    if (!formInputIds.includes(input.id)) {
      const key = input.id ? input.id : 'input_' + index;
      inputsData[key] = input.value;
    }
  });

  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  const cbData = Array.from(checkboxes).map(cb => cb.checked);

  charactersData[currentSlot] = {
    ...currentChar,
    inputs: inputsData,
    checkboxes: cbData
  };

  localStorage.setItem('dnd_multichar_data', JSON.stringify(charactersData));
  localStorage.setItem('dnd_active_slot', String(currentSlot));
}

export function loadCurrentCharacterData() {
  const container = document.getElementById('sheetCard');
  if (!container) return;

  const char = normalizeCharacter(charactersData[currentSlot] || createEmptyCharacter());
  charactersData[currentSlot] = char;

  const inputs = container.querySelectorAll('input[type="text"], input[type="number"], textarea, select');
  inputs.forEach((input, index) => {
    if (!formInputIds.includes(input.id)) {
      const explicitId = input.id;
      const legacyKey = 'input_' + index;

      let value = '';
      if (explicitId && char.inputs[explicitId] !== undefined) {
        value = char.inputs[explicitId];
      } else if (legacyKey && char.inputs[legacyKey] !== undefined) {
        value = char.inputs[legacyKey];
      } else if (explicitId && legacyInputMap[index] && char.inputs[legacyInputMap[index]] !== undefined) {
        value = char.inputs[legacyInputMap[index]];
      } else {
        value = input.defaultValue || '';
      }

      input.value = value;
    }
  });

  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((cb, index) => {
    cb.checked = char.checkboxes[index] !== undefined ? Boolean(char.checkboxes[index]) : false;
  });

  renderEquipment();
  renderBackpack();
  renderStatuses();
  renderSkills();
  updateTrackers();
}

export function loadAllSlotsFromStorage() {
  const savedData = localStorage.getItem('dnd_multichar_data');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      setCharactersData(parsed);
    } catch (e) {
      console.error("Error al cargar datos:", e);
      setCharactersData({});
    }
  } else {
    setCharactersData({});
  }

  const savedSlot = parseInt(localStorage.getItem('dnd_active_slot'), 10);
  if (savedSlot && savedSlot >= 1 && savedSlot <= MAX_SLOTS) {
    return savedSlot;
  }
  return currentSlot;
}

export function migrateOldDataIfNeeded() {
  const oldInputs = localStorage.getItem('dnd_sheet_inputs');
  const oldEquipment = localStorage.getItem('dnd_sheet_equipment');
  const oldBackpack = localStorage.getItem('dnd_sheet_backpack');
  const oldStatuses = localStorage.getItem('dnd_sheet_statuses');
  const oldSkills = localStorage.getItem('dnd_sheet_skills');

  if (oldInputs || oldEquipment || oldBackpack || oldStatuses || oldSkills) {
    if (!localStorage.getItem('dnd_multichar_data')) {
      const migratedChar = normalizeCharacter({
        inputs: oldInputs ? JSON.parse(oldInputs) : {},
        checkboxes: [],
        equipment: oldEquipment ? JSON.parse(oldEquipment) : [],
        backpack: oldBackpack ? JSON.parse(oldBackpack) : [],
        statuses: oldStatuses ? JSON.parse(oldStatuses) : [],
        skills: oldSkills ? JSON.parse(oldSkills) : []
      });

      setCharactersData({ 1: migratedChar });
      localStorage.setItem('dnd_multichar_data', JSON.stringify(charactersData));
      localStorage.removeItem('dnd_sheet_inputs');
      localStorage.removeItem('dnd_sheet_equipment');
      localStorage.removeItem('dnd_sheet_backpack');
      localStorage.removeItem('dnd_sheet_statuses');
      localStorage.removeItem('dnd_sheet_skills');
    }
  }
}

export function exportCharacter() {
  saveCurrentCharacterData();
  const characterData = normalizeCharacter(charactersData[currentSlot]);
  const rawName = characterData.inputs?.charName || characterData.inputs?.input_0 || `Personaje_${currentSlot}`;
  const cleanName = rawName
    .trim()
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase() || `personaje_${currentSlot}`;

  const timestamp = formatExportTimestamp();
  const fileName = `${cleanName}_ficha_${timestamp}.json`;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(characterData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function triggerImport() {
  document.getElementById('importFileInput').click();
}

export function importCharacter(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Formato de ficha no válido');
      }
      const normalized = normalizeCharacter(data);
      charactersData[currentSlot] = normalized;
      loadCurrentCharacterData();
      saveCurrentCharacterData();
      const importedName = normalized.inputs?.charName?.trim() || `Personaje ${currentSlot}`;
      alert(`¡"${importedName}" cargado correctamente en el Slot ${currentSlot}!`);
    } catch (err) {
      alert('El archivo seleccionado no es un JSON de personaje válido.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';

}

function formatExportTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}_${hours}-${minutes}`;
}