// models/organizacion/Conductor.js

export default class Conductor {
  constructor({
    idConductor,
    tipoDocumento,
    numeroDocumento,
    nombreCompleto,
    telefono,
    numeroLicencia,
    categoriaLicencia,
    fechaVencimientoLicencia, // Date
    estado = 'DISPONIBLE' // 'DISPONIBLE' | 'EN_RUTA' | 'INACTIVO'
  }) {
    this.idConductor = idConductor;
    this.tipoDocumento = tipoDocumento;
    this.numeroDocumento = numeroDocumento;
    this.nombreCompleto = nombreCompleto;
    this.telefono = telefono;
    this.numeroLicencia = numeroLicencia;
    this.categoriaLicencia = categoriaLicencia;
    this.fechaVencimientoLicencia = fechaVencimientoLicencia
      ? new Date(fechaVencimientoLicencia)
      : null;
    this.estado = estado;
  }

  licenciaVigente(fechaReferencia = new Date()) {
    if (!this.fechaVencimientoLicencia) return false;
    return this.fechaVencimientoLicencia >= fechaReferencia;
  }

  actualizarEstado(nuevoEstado) {
    this.estado = nuevoEstado;
  }

  actualizarContacto(telefono) {
    this.telefono = telefono;
  }

  disponibleParaFecha(fecha) {
    // stub: por ahora solo revisa estado y vigencia de licencia
    return this.estado === 'DISPONIBLE' && this.licenciaVigente(fecha);
  }
}
