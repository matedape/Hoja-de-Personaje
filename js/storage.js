// --- MÓDULO DE PERSISTENCIA Y ALMACENAMIENTO ---
import { currentSlot, MAX_SLOTS, charactersData, formInputIds, setCharactersData, createEmptyCharacter } from './state.js';
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

  const inputsData = {};
  const inputs = container.querySelectorAll('input[type="text"], input[type="number"], textarea, select');
  inputs.forEach((input, index) => {
    if (!formInputIds.includes(input.id)) {
      // Usamos siempre el ID del input si existe, evitando problemas de índices cruzados
      const key = input.id ? input.id : 'input_' + index;
      inputsData[key] = input.value;
    }
  });

  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  const cbData = Array.from(checkboxes).map(cb => cb.checked);

  charactersData[currentSlot].inputs = inputsData;
  charactersData[currentSlot].checkboxes = cbData;

  localStorage.setItem('dnd_multichar_data', JSON.stringify(charactersData));
  localStorage.setItem('dnd_active_slot', currentSlot);
}

export function loadCurrentCharacterData() {
  const container = document.getElementById('sheetCard');
  if (!container) return;

  const char = charactersData[currentSlot] || createEmptyCharacter();

  const inputs = container.querySelectorAll('input[type="text"], input[type="number"], textarea, select');
  inputs.forEach((input, index) => {
    if (!formInputIds.includes(input.id)) {
      const explicitId = input.id;
      const legacyKey = 'input_' + index;
      
      // Intentamos buscar por su ID nuevo, y si no está, buscamos en el respaldo viejo (legacy)
      let value = '';
      if (explicitId && char.inputs[explicitId] !== undefined) {
        value = char.inputs[explicitId];
      } else if (legacyKey && char.inputs[legacyKey] !== undefined) {
        value = char.inputs[legacyKey]; // Rescata datos de fichas viejas
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
    cb.checked = char.checkboxes[index] !== undefined ? char.checkboxes[index] : false;
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
    }
  }
  const savedSlot = parseInt(localStorage.getItem('dnd_active_slot'));
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
      charactersData[1] = {
        inputs: oldInputs ? JSON.parse(oldInputs) : {},
        checkboxes: [],
        equipment: oldEquipment ? JSON.parse(oldEquipment) : [],
        backpack: oldBackpack ? JSON.parse(oldBackpack) : [],
        statuses: oldStatuses ? JSON.parse(oldStatuses) : [],
        skills: oldSkills ? JSON.parse(oldSkills) : []
      };
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
  const characterData = charactersData[currentSlot];
  const charName = characterData.inputs['charName'] || characterData.inputs['input_0'] || `Personaje_${currentSlot}`;
  const fileName = `${charName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_ficha.json`;
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
      charactersData[currentSlot] = {
        inputs: data.inputs || {},
        checkboxes: data.checkboxes || [],
        equipment: data.equipment || [],
        backpack: data.backpack || [],
        statuses: data.statuses || [],
        skills: data.skills || []
      };
      loadCurrentCharacterData();
      saveCurrentCharacterData();
      alert(`¡Personaje cargado correctamente en el Slot ${currentSlot}!`);
    } catch (err) {
      alert('Error al leer el archivo JSON.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}