// models/carrito/CarritoHistory.js

export default class CarritoHistory {
  constructor(carrito) {
    this.carrito = carrito;    // Originator
    this.mementos = [];        // pila de snapshots
    this.currentIndex = -1;    // puntero al snapshot actual
  }

  // Guarda un nuevo snapshot y corta el “futuro” (estilo editor de texto)
  snapshot() {
    // Si hicimos undo y luego cambiamos algo, borramos todos los “redos”
    this.mementos = this.mementos.slice(0, this.currentIndex + 1);

    const memento = this.carrito.crearMemento();
    this.mementos.push(memento);
    this.currentIndex = this.mementos.length - 1;
  }

  deshacer() {
    if (this.currentIndex <= 0) {
      // Nada más que deshacer
      return false;
    }
    this.currentIndex -= 1;
    const memento = this.mementos[this.currentIndex];
    this.carrito.restaurarDesdeMemento(memento);
    return true;
  }

  rehacer() {
    if (this.currentIndex < 0 || this.currentIndex >= this.mementos.length - 1) {
      // Nada más que rehacer
      return false;
    }
    this.currentIndex += 1;
    const memento = this.mementos[this.currentIndex];
    this.carrito.restaurarDesdeMemento(memento);
    return true;
  }

  listarSnapshots() {
    return this.mementos.map((m, idx) => ({
      index: idx,
      name: m.getName()
    }));
  }
}
