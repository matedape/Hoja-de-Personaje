export class EffectType {
     constructor(id, name, keywords, effect, icon = '⚔️') {
    this.id = id;
    this.name = name;
    this.keywords = keywords; // Array con sinónimos y variaciones para los typos
    this.effect = effect;
    this.icon = icon;
  }
}

export const EFFECT_DATABASE = [
new EffectType('veneno', 'Veneno', ['veneno', 'venenoso', 'ven', 'veneeno','veneo'], ' Tiene la capacidad de realizar “amputación” (una chance del 10% a cualquier parte del cuerpo) o “hemorragia” (con una chance del 30% al oponente, aplica 2 cargas).', '🗡️')




];