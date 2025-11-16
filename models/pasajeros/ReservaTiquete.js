// models/pasajeros/ReservaTiquete.js

export default class ReservaTiquete {
  constructor({
    idReserva,
    idCliente,
    idViaje,
    asientosReservados = [], // array de números de asiento
    fechaCreacion = new Date(),
    fechaExpiracion = null,
    estado = 'ACTIVA' // 'ACTIVA' | 'CANCELADA' | 'EXPIRADA' | 'CONVERTIDA_EN_TIQUETE'
  }) {
    this.idReserva = idReserva;
    this.idCliente = idCliente;
    this.idViaje = idViaje;
    this.asientosReservados = asientosReservados;
    this.fechaCreacion = fechaCreacion ? new Date(fechaCreacion) : new Date();
    this.fechaExpiracion = fechaExpiracion ? new Date(fechaExpiracion) : null;
    this.estado = estado;
  }

  estaVigente(ahora = new Date()) {
    if (this.estado !== 'ACTIVA') return false;
    if (!this.fechaExpiracion) return true;
    return this.fechaExpiracion >= ahora;
  }

  cancelar() {
    if (this.estado === 'CONVERTIDA_EN_TIQUETE' || this.estado === 'EXPIRADA') {
      throw new Error('No se puede cancelar una reserva ya convertida o expirada');
    }
    this.estado = 'CANCELADA';
  }

  marcarComoExpirada() {
    if (this.estado === 'ACTIVA') {
      this.estado = 'EXPIRADA';
    }
  }

  cantidadAsientos() {
    return this.asientosReservados.length;
  }

  /**
   * En un sistema real, aquí crearíamos Tiquete(s) usando un repositorio/servicio.
   * Para este modelo, devolvemos un array de objetos simples simulando tiquetes.
   */
  convertirEnTiquetes({ precioBasePorAsiento = 0, impuestosPorAsiento = 0 } = {}) {
    if (!this.estaVigente()) {
      throw new Error('No se puede convertir una reserva no vigente');
    }
    if (this.cantidadAsientos() === 0) {
      throw new Error('La reserva no tiene asientos');
    }

    this.estado = 'CONVERTIDA_EN_TIQUETE';

    return this.asientosReservados.map((numeroAsiento, idx) => ({
      numeroAsiento,
      posicion: idx,
      precioBase: precioBasePorAsiento,
      impuestos: impuestosPorAsiento,
      total: precioBasePorAsiento + impuestosPorAsiento
    }));
  }
}
