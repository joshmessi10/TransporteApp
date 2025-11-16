// models/carrito/CarritoCompra.js
import CarritoMemento from './CarritoMemento.js';

export default class CarritoCompra {
  constructor({ idCliente }) {
    this.idCliente = idCliente;
    this.tiquetesDraft = [];  // [{ viajeId, asiento, precio }]
    this.enviosDraft = [];    // [{ envioId?, dto }]
    this.descuentoGlobal = 0;
  }

  // ------- Operaciones de dominio -------

  agregarTiquete({ viajeId, asiento, precio }) {
    this.tiquetesDraft.push({ viajeId, asiento, precio });
  }

  eliminarTiquete(index) {
    if (index < 0 || index >= this.tiquetesDraft.length) return;
    this.tiquetesDraft.splice(index, 1);
  }

  agregarEnvio({ idTemporal, dto, precio }) {
    this.enviosDraft.push({ idTemporal, dto: { ...dto }, precio });
  }

  eliminarEnvio(index) {
    if (index < 0 || index >= this.enviosDraft.length) return;
    this.enviosDraft.splice(index, 1);
  }

  aplicarDescuentoGlobal(monto) {
    this.descuentoGlobal = monto;
  }

  calcularTotal() {
    const totalTiq = this.tiquetesDraft.reduce((acc, t) => acc + (t.precio || 0), 0);
    const totalEnv = this.enviosDraft.reduce((acc, e) => acc + (e.precio || 0), 0);
    return totalTiq + totalEnv - this.descuentoGlobal;
  }

  // ------- API Memento -------

  crearMemento() {
    const state = {
      idCliente: this.idCliente,
      tiquetesDraft: this.tiquetesDraft,
      enviosDraft: this.enviosDraft,
      descuentoGlobal: this.descuentoGlobal
    };
    return new CarritoMemento(state);
  }

  restaurarDesdeMemento(memento) {
    const state = memento.getState();
    this.idCliente = state.idCliente;
    this.tiquetesDraft = state.tiquetesDraft;
    this.enviosDraft = state.enviosDraft;
    this.descuentoGlobal = state.descuentoGlobal;
  }
}
