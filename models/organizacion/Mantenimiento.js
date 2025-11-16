// models/organizacion/Mantenimiento.js

export default class Mantenimiento {
  constructor({
    idMantenimiento,
    vehiculoPlaca,
    tipo, // 'PREVENTIVO' | 'CORRECTIVO'
    descripcion,
    fechaProgramada = null,
    fechaEjecucion = null,
    estado = 'PROGRAMADO', // 'PROGRAMADO' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO'
    kilometrajeProgramado = 0,
    costoEstimado = 0,
    costoReal = 0
  }) {
    this.idMantenimiento = idMantenimiento;
    this.vehiculoPlaca = vehiculoPlaca;
    this.tipo = tipo;
    this.descripcion = descripcion;
    this.fechaProgramada = fechaProgramada ? new Date(fechaProgramada) : null;
    this.fechaEjecucion = fechaEjecucion ? new Date(fechaEjecucion) : null;
    this.estado = estado;
    this.kilometrajeProgramado = kilometrajeProgramado;
    this.costoEstimado = costoEstimado;
    this.costoReal = costoReal;
  }

  programar(fechaProgramada, kmProgramado, costoEstimado = 0) {
    this.fechaProgramada = new Date(fechaProgramada);
    this.kilometrajeProgramado = kmProgramado;
    this.costoEstimado = costoEstimado;
    this.estado = 'PROGRAMADO';
  }

  iniciar() {
    this.estado = 'EN_PROCESO';
  }

  completar(costoReal, fechaEjecucion = new Date()) {
    this.estado = 'COMPLETADO';
    this.costoReal = costoReal;
    this.fechaEjecucion = new Date(fechaEjecucion);
  }

  cancelar(motivo) {
    this.estado = 'CANCELADO';
    this.descripcion += ` | Cancelado: ${motivo}`;
  }

  estaAtrasado(ahora = new Date()) {
    if (!this.fechaProgramada) return false;
    return this.estado === 'PROGRAMADO' && this.fechaProgramada < ahora;
  }
}
