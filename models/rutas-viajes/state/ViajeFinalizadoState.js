// models/rutas-viajes/state/ViajeFinalizadoState.js
import EstadoViaje from './EstadoViaje.js';

export default class ViajeFinalizadoState extends EstadoViaje {
  iniciar() {
    throw new Error('No se puede iniciar un viaje ya FINALIZADO');
  }

  finalizar() {
    throw new Error('El viaje ya está FINALIZADO');
  }

  cancelar() {
    throw new Error('No se puede cancelar un viaje FINALIZADO');
  }
}
