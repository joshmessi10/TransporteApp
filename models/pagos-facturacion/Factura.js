// models/pagos-facturacion/Factura.js

export default class Factura {
  constructor({
    idFactura,
    numeroFactura,
    idCliente,
    fechaEmision = new Date(),
    subtotal = 0,
    impuestos = 0,
    total = 0,
    estado = 'VIGENTE', // 'VIGENTE' | 'ANULADA'
    medioGeneracion = 'WEB', // 'WEB' | 'PUNTO_FISICO'
    urlPdf = null,
    uuidDian = null
  }) {
    this.idFactura = idFactura;
    this.numeroFactura = numeroFactura;
    this.idCliente = idCliente;
    this.fechaEmision = fechaEmision ? new Date(fechaEmision) : new Date();
    this.subtotal = subtotal;
    this.impuestos = impuestos;
    this.total = total;
    this.estado = estado;
    this.medioGeneracion = medioGeneracion;
    this.urlPdf = urlPdf;
    this.uuidDian = uuidDian;
  }

  calcularTotales(items = []) {
    let subtotal = 0;
    let impuestos = 0;

    items.forEach((item) => {
      if (!item) return;
      // asumimos que item es instancia de ItemFactura
      subtotal += item.subtotal ?? 0;
      impuestos += item.impuesto ?? 0;
    });

    this.subtotal = subtotal;
    this.impuestos = impuestos;
    this.total = subtotal + impuestos;
  }

  marcarAnulada(motivo = '') {
    if (!this.puedeAnularse()) {
      throw new Error('La factura no puede ser anulada');
    }
    this.estado = 'ANULADA';
    if (motivo) {
      this.urlPdf = this.urlPdf
        ? `${this.urlPdf} | ANULADA: ${motivo}`
        : `ANULADA: ${motivo}`;
    }
  }

  puedeAnularse() {
    return this.estado === 'VIGENTE';
  }

  generarDescripcionResumen() {
    return `Factura ${this.numeroFactura} - Cliente ${this.idCliente} - Total ${this.total}`;
  }
}
