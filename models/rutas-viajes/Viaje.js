// models/rutas-viajes/Viaje.js
import ViajeStateFactory from './state/ViajeStateFactory.js';

export default class Viaje {
  constructor({
    idViaje,
    idRuta,
    fechaHoraSalidaProgramada,
    fechaHoraLlegadaProgramada,
    fechaHoraSalidaReal = null,
    fechaHoraLlegadaReal = null,
    vehiculoPlaca = null,
    idConductor = null,
    estado = 'PROGRAMADO', // 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO'
    capacidadAsientos = 0,
    asientosOcupados = 0,
    pesoCargaKg = 0,
    observaciones = ''
  }) {
    this.idViaje = idViaje;
    this.idRuta = idRuta;
    this.fechaHoraSalidaProgramada = fechaHoraSalidaProgramada
      ? new Date(fechaHoraSalidaProgramada)
      : null;
    this.fechaHoraLlegadaProgramada = fechaHoraLlegadaProgramada
      ? new Date(fechaHoraLlegadaProgramada)
      : null;
    this.fechaHoraSalidaReal = fechaHoraSalidaReal
      ? new Date(fechaHoraSalidaReal)
      : null;
    this.fechaHoraLlegadaReal = fechaHoraLlegadaReal
      ? new Date(fechaHoraLlegadaReal)
      : null;
    this.vehiculoPlaca = vehiculoPlaca;
    this.idConductor = idConductor;
    this.estado = estado;
    this.capacidadAsientos = capacidadAsientos;
    this.asientosOcupados = asientosOcupados;
    this.pesoCargaKg = pesoCargaKg;
    this.observaciones = observaciones;

    // ---------- State pattern ----------
    this.stateFactory = new ViajeStateFactory();

    const initialStateObj = this.stateFactory.create(this.estado);
    Object.defineProperty(this, '_estadoObj', {
      value: initialStateObj,
      enumerable: false, // para evitar ciclos en JSON.stringify
      writable: true,
      configurable: true
    });
    this._estadoObj.setContext(this);
  }

  // ============ State helpers ============

  setEstadoObj(estadoObj) {
    this._estadoObj = estadoObj;
    this._estadoObj.setContext(this);
  }

  iniciarViaje(fechaSalidaReal = null) {
    this._estadoObj.iniciar(fechaSalidaReal);
  }

  finalizarViaje(fechaLlegadaReal = null) {
    this._estadoObj.finalizar(fechaLlegadaReal);
  }

  cancelar(motivo = '') {
    this._estadoObj.cancelar(motivo);
  }

  // ============ Métodos de dominio previos (ocupación / carga) ============

  asignarVehiculo(placa) {
    this.vehiculoPlaca = placa;
  }

  asignarConductor(idConductor) {
    this.idConductor = idConductor;
  }

  hayAsientosDisponibles(cantidad = 1) {
    return this.asientosOcupados + cantidad <= this.capacidadAsientos;
  }

  reservarAsientos(cantidad = 1) {
    if (!this.hayAsientosDisponibles(cantidad)) {
      throw new Error('No hay asientos suficientes disponibles');
    }
    this.asientosOcupados += cantidad;
  }

  liberarAsientos(cantidad = 1) {
    if (this.asientosOcupados - cantidad < 0) {
      throw new Error('No se pueden liberar más asientos de los ocupados');
    }
    this.asientosOcupados -= cantidad;
  }

  porcentajeOcupacion() {
    if (this.capacidadAsientos === 0) return 0;
    return (this.asientosOcupados / this.capacidadAsientos) * 100;
  }

  puedeAgregarCarga(pesoAdicionalKg) {
    return this.pesoCargaKg + pesoAdicionalKg >= 0;
  }

  agregarCarga(pesoKg) {
    if (!this.puedeAgregarCarga(pesoKg)) {
      throw new Error('El peso de carga resultante no es válido');
    }
    this.pesoCargaKg += pesoKg;
  }

  quitarCarga(pesoKg) {
    if (this.pesoCargaKg - pesoKg < 0) {
      throw new Error('No se puede dejar la carga en negativo');
    }
    this.pesoCargaKg -= pesoKg;
  }
}
