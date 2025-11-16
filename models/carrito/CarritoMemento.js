// models/carrito/CarritoMemento.js

export default class CarritoMemento {
  constructor(state) {
    // Guardamos una copia "deep" sencilla
    this.state = JSON.parse(JSON.stringify(state));
    this.timestamp = new Date();
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  getName() {
    const { tiquetesDraft, enviosDraft, descuentoGlobal } = this.state;
    const tiq = tiquetesDraft ? tiquetesDraft.length : 0;
    const env = enviosDraft ? enviosDraft.length : 0;
    return `${this.timestamp.toISOString()} | T=${tiq}, E=${env}, desc=${descuentoGlobal}`;
  }
}
