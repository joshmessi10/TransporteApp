// models/rutas-viajes/state/ViajeCanceladoState.js
import EstadoViaje from './EstadoViaje.js';

export default class ViajeCanceladoState extends EstadoViaje {
  iniciar() {
    throw new Error('No se puede iniciar un viaje CANCELADO');
  }

  finalizar() {
    throw new Error('No se puede finalizar un viaje CANCELADO');
  }

  cancelar() {
    throw new Error('El viaje ya está CANCELADO');
  }
}
