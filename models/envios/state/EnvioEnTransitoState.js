// models/envios/state/EnvioEnTransitoState.js
import EstadoEnvio from './EstadoEnvio.js';

export default class EnvioEnTransitoState extends EstadoEnvio {
  avanzar() {
    // EN_TRANSITO -> EN_BODEGA_DESTINO
    this.envio.estado = 'EN_BODEGA_DESTINO';
    this.envio.setEstadoObj(this.envio.stateFactory.create('EN_BODEGA_DESTINO'));
    this._appendObservacion('Envío recibido en bodega destino');
  }

  devolver() {
    // EN_TRANSITO -> DEVUELTO (por ejemplo, retorno de ruta)
    this.envio.estado = 'DEVUELTO';
    this.envio.setEstadoObj(this.envio.stateFactory.create('DEVUELTO'));
    this._appendObservacion('Envío devuelto durante el tránsito');
  }

  marcarFallido(motivo) {
    this.envio.estado = 'FALLIDO';
    this.envio.setEstadoObj(this.envio.stateFactory.create('FALLIDO'));
    this._appendObservacion(`FALLIDO (en tránsito): ${motivo}`);
  }
}
