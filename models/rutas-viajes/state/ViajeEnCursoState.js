// models/rutas-viajes/state/ViajeEnCursoState.js
import EstadoViaje from './EstadoViaje.js';

export default class ViajeEnCursoState extends EstadoViaje {
  iniciar() {
    throw new Error('El viaje ya está EN_CURSO');
  }

  finalizar(fechaLlegada) {
    this.viaje.estado = 'FINALIZADO';
    this.viaje.fechaHoraLlegadaReal = fechaLlegada
      ? new Date(fechaLlegada)
      : new Date();

    this.viaje.setEstadoObj(this.viaje.stateFactory.create('FINALIZADO'));
    this._appendObservacion('Viaje finalizado');
  }

  cancelar(motivo) {
    this.viaje.estado = 'CANCELADO';
    this.viaje.setEstadoObj(this.viaje.stateFactory.create('CANCELADO'));
    this._appendObservacion(`Viaje cancelado EN_CURSO: ${motivo}`);
  }
}
