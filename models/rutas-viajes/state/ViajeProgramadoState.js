// models/rutas-viajes/state/ViajeProgramadoState.js
import EstadoViaje from './EstadoViaje.js';

export default class ViajeProgramadoState extends EstadoViaje {
  iniciar(fechaSalida) {
    if (!this.viaje.vehiculoPlaca || !this.viaje.idConductor) {
      throw new Error('No se puede iniciar un viaje sin vehículo ni conductor asignados');
    }

    this.viaje.estado = 'EN_CURSO';
    this.viaje.fechaHoraSalidaReal = fechaSalida
      ? new Date(fechaSalida)
      : new Date();

    this.viaje.setEstadoObj(this.viaje.stateFactory.create('EN_CURSO'));
    this._appendObservacion('Viaje iniciado');
  }

  finalizar() {
    throw new Error('No se puede finalizar un viaje que aún no inicia');
  }

  cancelar(motivo) {
    this.viaje.estado = 'CANCELADO';
    this.viaje.setEstadoObj(this.viaje.stateFactory.create('CANCELADO'));
    this._appendObservacion(`Viaje cancelado (antes de iniciar): ${motivo}`);
  }
}
