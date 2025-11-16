// models/envios/TrackingEnvio.js

export default class TrackingEnvio {
  constructor({
    idTracking,
    idEnvio,
    fechaHora = new Date(),
    estado,
    ubicacionTexto,
    sedeId = null,
    observaciones = ''
  }) {
    this.idTracking = idTracking;
    this.idEnvio = idEnvio;
    this.fechaHora = fechaHora ? new Date(fechaHora) : new Date();
    this.estado = estado;
    this.ubicacionTexto = ubicacionTexto;
    this.sedeId = sedeId;
    this.observaciones = observaciones;
  }

  registrarEvento() {
    // En un sistema real esto llamaría a un repositorio,
    // aquí solo dejamos el método para representar la intención.
    return {
      idTracking: this.idTracking,
      idEnvio: this.idEnvio,
      estado: this.estado,
      fechaHora: this.fechaHora
    };
  }

  descripcionCorta() {
    return `${this.fechaHora.toISOString()} - ${this.estado} @ ${this.ubicacionTexto}`;
  }
}
