// models/envios/state/EnvioEntregadoState.js
import EstadoEnvio from './EstadoEnvio.js';

export default class EnvioEntregadoState extends EstadoEnvio {
  avanzar() {
    // No hay más transición hacia adelante
    throw new Error('El envío ya está ENTREGADO');
  }

  devolver() {
    // Podrías permitir devoluciones post-entrega según política
    this.envio.estado = 'DEVUELTO';
    this.envio.setEstadoObj(this.envio.stateFactory.create('DEVUELTO'));
    this._appendObservacion('Devolución posterior a entrega');
  }

  marcarFallido(motivo) {
    throw new Error('No se puede marcar como FALLIDO un envío entregado');
  }
}
