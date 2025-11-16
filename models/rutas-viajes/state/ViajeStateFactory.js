// models/rutas-viajes/state/ViajeStateFactory.js
import ViajeProgramadoState from './ViajeProgramadoState.js';
import ViajeEnCursoState from './ViajeEnCursoState.js';
import ViajeFinalizadoState from './ViajeFinalizadoState.js';
import ViajeCanceladoState from './ViajeCanceladoState.js';

export default class ViajeStateFactory {
  create(estado) {
    switch (estado) {
      case 'PROGRAMADO':
        return new ViajeProgramadoState();
      case 'EN_CURSO':
        return new ViajeEnCursoState();
      case 'FINALIZADO':
        return new ViajeFinalizadoState();
      case 'CANCELADO':
        return new ViajeCanceladoState();
      default:
        throw new Error(`Estado de viaje no soportado: ${estado}`);
    }
  }
}
