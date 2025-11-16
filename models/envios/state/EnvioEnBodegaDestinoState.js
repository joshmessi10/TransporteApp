// models/envios/state/EnvioEnBodegaDestinoState.js
import EstadoEnvio from './EstadoEnvio.js';

export default class EnvioEnBodegaDestinoState extends EstadoEnvio {
  avanzar() {
    // EN_BODEGA_DESTINO -> EN_REPARTO
    this.envio.estado = 'EN_REPARTO';
    this.envio.setEstadoObj(this.envio.stateFactory.create('EN_REPARTO'));
    this._appendObservacion('Envío salido de bodega destino hacia reparto');
  }

  devolver() {
    // EN_BODEGA_DESTINO -> DEVUELTO (por ejemplo, rechazo antes del reparto)
    this.envio.estado = 'DEVUELTO';
    this.envio.setEstadoObj(this.envio.stateFactory.create('DEVUELTO'));
    this._appendObservacion('Envío devuelto desde bodega destino');
  }

  marcarFallido(motivo) {
    this.envio.estado = 'FALLIDO';
    this.envio.setEstadoObj(this.envio.stateFactory.create('FALLIDO'));
    this._appendObservacion(`FALLIDO (bodega destino): ${motivo}`);
  }
}
