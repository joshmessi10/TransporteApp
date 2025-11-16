// models/envios/state/EnvioDevueltoState.js
import EstadoEnvio from './EstadoEnvio.js';

export default class EnvioDevueltoState extends EstadoEnvio {
  avanzar() {
    throw new Error('Un envío DEVUELTO no sigue avanzando en el flujo normal');
  }

  devolver() {
    // ya está devuelto
    throw new Error('El envío ya está DEVUELTO');
  }

  marcarFallido(motivo) {
    this.envio.estado = 'FALLIDO';
    this.envio.setEstadoObj(this.envio.stateFactory.create('FALLIDO'));
    this._appendObservacion(`DEVUELTO -> FALLIDO: ${motivo}`);
  }
}
