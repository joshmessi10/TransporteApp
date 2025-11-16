// models/envios/state/EnvioEnBodegaOrigenState.js
import EstadoEnvio from './EstadoEnvio.js';

export default class EnvioEnBodegaOrigenState extends EstadoEnvio {
  avanzar() {
    // EN_BODEGA_ORIGEN -> EN_TRANSITO
    this.envio.estado = 'EN_TRANSITO';
    this.envio.setEstadoObj(this.envio.stateFactory.create('EN_TRANSITO'));
    this._appendObservacion('Envío despachado desde bodega origen (en tránsito)');
  }

  devolver() {
    // EN_BODEGA_ORIGEN -> DEVUELTO (por ejemplo, remitente lo retira)
    this.envio.estado = 'DEVUELTO';
    this.envio.setEstadoObj(this.envio.stateFactory.create('DEVUELTO'));
    this._appendObservacion('Envío devuelto al remitente desde bodega origen');
  }

  marcarFallido(motivo) {
    this.envio.estado = 'FALLIDO';
    this.envio.setEstadoObj(this.envio.stateFactory.create('FALLIDO'));
    this._appendObservacion(`FALLIDO (bodega origen): ${motivo}`);
  }
}
