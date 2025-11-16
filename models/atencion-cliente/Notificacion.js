// models/atencion-cliente/Notificacion.js

export default class Notificacion {
  constructor({
    idNotificacion,
    idUsuarioDestino,
    canal, // 'EMAIL' | 'SMS' | 'PUSH_APP' | 'WHATSAPP'
    titulo,
    mensaje,
    fechaProgramada = new Date(),
    fechaEnvio = null,
    estado = 'PENDIENTE', // 'PENDIENTE' | 'ENVIADA' | 'ERROR'
    referenciaOrigen = 'OTRO', // 'TIQUETE' | 'ENVIO' | 'PQRS' | 'OTRO'
    idOrigen = null
  }) {
    this.idNotificacion = idNotificacion;
    this.idUsuarioDestino = idUsuarioDestino;
    this.canal = canal;
    this.titulo = titulo;
    this.mensaje = mensaje;
    this.fechaProgramada = fechaProgramada
      ? new Date(fechaProgramada)
      : new Date();
    this.fechaEnvio = fechaEnvio ? new Date(fechaEnvio) : null;
    this.estado = estado;
    this.referenciaOrigen = referenciaOrigen;
    this.idOrigen = idOrigen;
  }

  marcarEnviada(fechaEnvio = new Date()) {
    this.estado = 'ENVIADA';
    this.fechaEnvio = new Date(fechaEnvio);
  }

  marcarError(detalle) {
    this.estado = 'ERROR';
    if (detalle) {
      this.mensaje += this.mensaje
        ? ` | ERROR_ENVIO: ${detalle}`
        : `ERROR_ENVIO: ${detalle}`;
    }
  }

  estaPendiente() {
    return this.estado === 'PENDIENTE';
  }
}
