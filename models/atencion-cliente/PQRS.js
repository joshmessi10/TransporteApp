// models/atencion-cliente/PQRS.js

export default class PQRS {
  constructor({
    idPQRS,
    idCliente,
    tipo, // 'PETICION' | 'QUEJA' | 'RECLAMO' | 'SUGERENCIA'
    asociadoA = 'OTRO', // 'TIQUETE' | 'ENVIO' | 'OTRO'
    idReferencia = null, // idTiquete / idEnvio / null
    descripcion,
    fechaCreacion = new Date(),
    estado = 'ABIERTA', // 'ABIERTA' | 'EN_GESTION' | 'CERRADA'
    areaResponsable = null,
    respuesta = null,
    fechaCierre = null
  }) {
    this.idPQRS = idPQRS;
    this.idCliente = idCliente;
    this.tipo = tipo;
    this.asociadoA = asociadoA;
    this.idReferencia = idReferencia;
    this.descripcion = descripcion;
    this.fechaCreacion = fechaCreacion ? new Date(fechaCreacion) : new Date();
    this.estado = estado;
    this.areaResponsable = areaResponsable;
    this.respuesta = respuesta;
    this.fechaCierre = fechaCierre ? new Date(fechaCierre) : null;
  }

  asignarArea(area) {
    this.areaResponsable = area;
    if (this.estado === 'ABIERTA') {
      this.estado = 'EN_GESTION';
    }
  }

  actualizarEstado(nuevoEstado) {
    // 'ABIERTA' | 'EN_GESTION' | 'CERRADA'
    this.estado = nuevoEstado;
    if (nuevoEstado === 'CERRADA' && !this.fechaCierre) {
      this.fechaCierre = new Date();
    }
  }

  registrarRespuesta(respuesta) {
    this.respuesta = respuesta;
    // normalmente al registrar respuesta se marca como cerrada
    this.estado = 'CERRADA';
    this.fechaCierre = new Date();
  }

  puedeCerrarse() {
    // Podrías tener reglas más complejas; por ahora, que al menos haya un área asignada
    return !!this.areaResponsable;
  }
}
