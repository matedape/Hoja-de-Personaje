import { DAMAGE_DATABASE } from './damagetype.js';

export class DamageSystem {
  static parse(rawText) {
    if (!rawText) return [];
    
    const cleanText = rawText.toLowerCase();
    const tokens = cleanText.split(/[\/,-\s]+/); // Separa por comas, barras, espacios o guiones
    const matchedEffects = [];

    tokens.forEach(token => {
      if (token.length < 3) return; // Ignora palabras muy cortas

      DAMAGE_DATABASE.forEach(dmgType => {
        const isMatch = dmgType.keywords.some(kw => token.includes(kw) || kw.includes(token));
        
        if (isMatch && !matchedEffects.some(e => e.id === dmgType.id)) {
          matchedEffects.push(dmgType);
        }
      });
    });

    return matchedEffects;
  }
}