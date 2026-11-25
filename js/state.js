// --- ESTADO GLOBAL DE LA APLICACIÓN ---
export let currentSlot = 1;
export const MAX_SLOTS = 3;

export let charactersData = {
  1: createEmptyCharacter(),
  2: createEmptyCharacter(),
  3: createEmptyCharacter()
};

export let editingSkillId = null;

export const skillFilters = {
  type: 'all',    // 'all', 'Activa', 'Pasiva'
  tag: 'all'      // 'all', 'Combate', 'Defensiva', 'Apoyo', 'Movilidad', 'Utilidad'
};

// IDs de inputs que no deben disparar el guardado automático masivo de inputs genéricos
export const formInputIds = [
  'statusName', 'statusDuration',
  'equipName', 'equipQty', 'equipDice', 'equipDamageType', 'equipRange', 'equipGuard', 'equipBonusStats', 'equipRarity', 'equipDesc',
  'bagName', 'bagQty', 'bagDice', 'bagDamageType', 'bagRange', 'bagGuard', 'bagBonusStats', 'bagRarity', 'bagDesc',
  'skillName', 'skillSearch', 'skillCooldown'
];

export function createEmptyCharacter() {
  return {
    inputs: {},
    checkboxes: [],
    equipment: [],
    backpack: [],
    statuses: [],
    skills: []
  };
}

export function normalizeCharacter(rawChar) {
  const base = createEmptyCharacter();
  if (!rawChar || typeof rawChar !== 'object') {
    return base;
  }

  return {
    inputs: rawChar.inputs && typeof rawChar.inputs === 'object' ? { ...rawChar.inputs } : {},
    checkboxes: Array.isArray(rawChar.checkboxes) ? [...rawChar.checkboxes] : [],
    equipment: Array.isArray(rawChar.equipment) ? [...rawChar.equipment] : [],
    backpack: Array.isArray(rawChar.backpack) ? [...rawChar.backpack] : [],
    statuses: Array.isArray(rawChar.statuses) ? [...rawChar.statuses] : [],
    skills: Array.isArray(rawChar.skills) ? [...rawChar.skills] : []
  };
}

export function normalizeCharactersData(rawData) {
  const normalized = {};
  for (let slot = 1; slot <= MAX_SLOTS; slot++) {
    normalized[slot] = normalizeCharacter(rawData ? rawData[slot] : null);
  }
  return normalized;
}

// Funciones para modificar el estado de forma segura desde otros módulos
export function setCurrentSlot(slot) {
  currentSlot = slot;
}

export function setEditingSkillId(id) {
  editingSkillId = id;
}

export function setCharactersData(newData) {
  charactersData = normalizeCharactersData(newData);
}