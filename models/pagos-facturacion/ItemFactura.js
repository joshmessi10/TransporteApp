// models/pagos-facturacion/ItemFactura.js

export default class ItemFactura {
  constructor({
    idItem,
    idFactura,
    descripcion,
    cantidad = 1,
    precioUnitario = 0,
    impuesto = 0, // valor de impuesto (no porcentaje)
    subtotal = null
  }) {
    this.idItem = idItem;
    this.idFactura = idFactura;
    this.descripcion = descripcion;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.impuesto = impuesto;
    this.subtotal = subtotal ?? this.recalcularSubtotal();
  }

  recalcularSubtotal() {
    this.subtotal = this.cantidad * this.precioUnitario;
    return this.subtotal;
  }

  totalConImpuesto() {
    return this.subtotal + this.impuesto;
  }
}
