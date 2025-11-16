// models/pagos-facturacion/Pago.js

export default class Pago {
  constructor({
    idPago,
    idCliente,
    monto,
    fechaHora = new Date(),
    metodoPago, // 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'BILLETERA_DIGITAL'
    referenciaPasarela = null,
    estado = 'PENDIENTE', // 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
    origenPago, // 'TIQUETE' | 'ENVIO'
    idOrigen
  }) {
    this.idPago = idPago;
    this.idCliente = idCliente;
    this.monto = monto;
    this.fechaHora = fechaHora ? new Date(fechaHora) : new Date();
    this.metodoPago = metodoPago;
    this.referenciaPasarela = referenciaPasarela;
    this.estado = estado;
    this.origenPago = origenPago;
    this.idOrigen = idOrigen;
  }

  marcarAprobado(referenciaPasarela = null) {
    this.estado = 'APROBADO';
    if (referenciaPasarela) {
      this.referenciaPasarela = referenciaPasarela;
    }
  }

  marcarRechazado(motivo = '') {
    this.estado = 'RECHAZADO';
    if (motivo) {
      this.referenciaPasarela = this.referenciaPasarela
        ? `${this.referenciaPasarela} | MOTIVO_RECHAZO: ${motivo}`
        : `MOTIVO_RECHAZO: ${motivo}`;
    }
  }

  esAprobado() {
    return this.estado === 'APROBADO';
  }

  correspondeMonto(esperado) {
    return Number(this.monto) === Number(esperado);
  }
}
