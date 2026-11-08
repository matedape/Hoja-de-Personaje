export class DamageType {
  constructor(id, name, keywords, effect, icon = '⚔️') {
    this.id = id;
    this.name = name;
    this.keywords = keywords; // Array con sinónimos y variaciones para los typos
    this.effect = effect;
    this.icon = icon;
  }
}

// Tu base de datos central de efectos de daño
export const DAMAGE_DATABASE = [
  new DamageType('cortante', 'Cortante', ['cortante', 'corte', 'cortnt', 'cortate','cotate'], ' Tiene la capacidad de realizar “amputación” (una chance del 10% a cualquier parte del cuerpo) o “hemorragia” (con una chance del 30% al oponente, aplica 2 cargas).', '🗡️'),
  new DamageType('punzante', 'Punzante', ['punzante', 'perforante', 'punza', 'puzate'], ' Tiene la capacidad de producir “hemorragia” (Una chance del 50%, aplica de 1 a 4 carga).', '📌'),
  new DamageType('contundente', 'Contundente', ['contundente', 'Contundente', 'cotudente','contudete'], 'Tienen la capacidad de producir “Fracturas” (una chance del 30% a cualquier) o de realizar “Aturdido” (una chance del 10%).', '👊'),
];