// models/envios/state/EnvioRegistradoState.js
import EstadoEnvio from './EstadoEnvio.js';

export default class EnvioRegistradoState extends EstadoEnvio {
  avanzar() {
    // REGISTRADO -> EN_BODEGA_ORIGEN
    this.envio.estado = 'EN_BODEGA_ORIGEN';
    this.envio.setEstadoObj(this.envio.stateFactory.create('EN_BODEGA_ORIGEN'));
    this._appendObservacion('Envío ingresado a bodega origen');
  }

  devolver() {
    // No tiene sentido devolver algo que ni siquiera salió
    throw new Error('No se puede devolver un envío recién registrado');
  }

  marcarFallido(motivo) {
    this.envio.estado = 'FALLIDO';
    this.envio.setEstadoObj(this.envio.stateFactory.create('FALLIDO'));
    this._appendObservacion(`FALLIDO (registrado): ${motivo}`);
  }
}
