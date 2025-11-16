// models/pasajeros/Tiquete.js

export default class Tiquete {
  constructor({
    idTiquete,
    idViaje,
    idCliente,
    numeroAsiento,
    fechaHoraCompra = new Date(),
    canalVenta = 'WEB', // 'WEB' | 'TAQUILLA' | 'APP'
    precioBase = 0,
    impuestos = 0,
    descuento = 0,
    precioTotal = null,
    estado = 'RESERVADO', // 'RESERVADO' | 'PAGADO' | 'USADO' | 'ANULADO'
    codigoQR = '',
    idFactura = null
  }) {
    this.idTiquete = idTiquete;
    this.idViaje = idViaje;
    this.idCliente = idCliente;
    this.numeroAsiento = numeroAsiento;
    this.fechaHoraCompra = fechaHoraCompra ? new Date(fechaHoraCompra) : new Date();
    this.canalVenta = canalVenta;
    this.precioBase = precioBase;
    this.impuestos = impuestos;
    this.descuento = descuento;
    this.precioTotal = precioTotal ?? this.calcularPrecioTotal();
    this.estado = estado;
    this.codigoQR = codigoQR;
    this.idFactura = idFactura;
  }

  calcularPrecioTotal() {
    const total = this.precioBase + this.impuestos - this.descuento;
    this.precioTotal = total < 0 ? 0 : total;
    return this.precioTotal;
  }

  marcarComoPagado() {
    if (this.estado === 'ANULADO') {
      throw new Error('No se puede pagar un tiquete anulado');
    }
    this.estado = 'PAGADO';
  }

  marcarComoUsado() {
    if (this.estado !== 'PAGADO') {
      throw new Error('Solo un tiquete pagado puede marcarse como usado');
    }
    this.estado = 'USADO';
  }

  anular(motivo = '') {
    if (!this.puedeAnularse()) {
      throw new Error('El tiquete no puede ser anulado en su estado actual');
    }
    this.estado = 'ANULADO';
    if (motivo) {
      this.codigoQR += this.codigoQR ? ` | ANULADO: ${motivo}` : `ANULADO: ${motivo}`;
    }
  }

  puedeAnularse() {
    return this.estado === 'RESERVADO' || this.estado === 'PAGADO';
  }

  esValidoParaAbordar() {
    return this.estado === 'PAGADO';
  }
}
