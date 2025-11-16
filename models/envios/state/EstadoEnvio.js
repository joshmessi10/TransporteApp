// models/envios/state/EstadoEnvio.js

export default class EstadoEnvio {
  setContext(envio) {
    this.envio = envio;
  }

  avanzar() {
    throw new Error('avanzar() debe implementarse en la subclase');
  }

  devolver() {
    throw new Error('devolver() debe implementarse en la subclase');
  }

  // eslint-disable-next-line no-unused-vars
  marcarFallido(motivo) {
    throw new Error('marcarFallido() debe implementarse en la subclase');
  }

  _appendObservacion(texto) {
    if (!texto) return;
    if (!this.envio.observaciones) {
      this.envio.observaciones = texto;
    } else {
      this.envio.observaciones += ` | ${texto}`;
    }
  }
}
