// models/carrito/CarritoHistory.js

export default class CarritoHistory {
  constructor(carrito) {
    this.carrito = carrito;
    this.mementos = [];
    this.currentIndex = -1;
  }

  snapshot() {
    // Borrar “futuro” si estamos en medio del historial
    this.mementos = this.mementos.slice(0, this.currentIndex + 1);

    const memento = this.carrito.crearMemento();
    this.mementos.push(memento);
    this.currentIndex = this.mementos.length - 1;
  }

  undo() {
    if (this.currentIndex <= 0) {
      return;
    }
    this.currentIndex -= 1;
    const memento = this.mementos[this.currentIndex];
    this.carrito.restaurarDesdeMemento(memento);
  }

  redo() {
    if (this.currentIndex >= this.mementos.length - 1) {
      return;
    }
    this.currentIndex += 1;
    const memento = this.mementos[this.currentIndex];
    this.carrito.restaurarDesdeMemento(memento);
  }

  listarSnapshots() {
    return this.mementos.map((m, idx) => ({
      index: idx,
      name: m.getName()
    }));
  }
}
