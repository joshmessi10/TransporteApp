// models/envios/state/EnvioEnRepartoState.js
import EstadoEnvio from './EstadoEnvio.js';

export default class EnvioEnRepartoState extends EstadoEnvio {
  avanzar() {
    // EN_REPARTO -> ENTREGADO
    this.envio.estado = 'ENTREGADO';
    this.envio.fechaEntregaReal = new Date();
    this.envio.setEstadoObj(this.envio.stateFactory.create('ENTREGADO'));
    this._appendObservacion('Envío entregado al destinatario');
  }

  devolver() {
    // EN_REPARTO -> DEVUELTO (no se encontró destinatario, etc.)
    this.envio.estado = 'DEVUELTO';
    this.envio.setEstadoObj(this.envio.stateFactory.create('DEVUELTO'));
    this._appendObservacion('Envío devuelto desde reparto');
  }

  marcarFallido(motivo) {
    this.envio.estado = 'FALLIDO';
    this.envio.setEstadoObj(this.envio.stateFactory.create('FALLIDO'));
    this._appendObservacion(`FALLIDO (en reparto): ${motivo}`);
  }
}
