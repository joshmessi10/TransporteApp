// models/rutas-viajes/state/EstadoViaje.js

export default class EstadoViaje {
  setContext(viaje) {
    this.viaje = viaje;
  }

  // fechaSalida / fechaLlegada son opcionales, por si quieres inyectarlas desde fuera

  // eslint-disable-next-line no-unused-vars
  iniciar(fechaSalida) {
    throw new Error('iniciar() debe implementarse en la subclase');
  }

  // eslint-disable-next-line no-unused-vars
  finalizar(fechaLlegada) {
    throw new Error('finalizar() debe implementarse en la subclase');
  }

  // eslint-disable-next-line no-unused-vars
  cancelar(motivo) {
    throw new Error('cancelar() debe implementarse en la subclase');
  }

  _appendObservacion(texto) {
    if (!texto) return;
    if (!this.viaje.observaciones) {
      this.viaje.observaciones = texto;
    } else {
      this.viaje.observaciones += ` | ${texto}`;
    }
  }
}
