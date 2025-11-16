// models/procesos-compra/ProcesoCompraEnvio.js
import ProcesoCompra from './ProcesoCompra.js';
import { Envio } from '../envios/index.js';
import { Pago, Factura, ItemFactura } from '../pagos-facturacion/index.js';
import { Notificacion } from '../atencion-cliente/index.js';

export default class ProcesoCompraEnvio extends ProcesoCompra {
  constructor({ cliente, envioDraft, datosPago }) {
    super();
    this.cliente = cliente;     // { idCliente, ... }
    this.envioDraft = envioDraft; // DTO con datos de envío
    this.datosPago = datosPago;

    this.envio = null;
    this.pago = null;
    this.factura = null;

    this.precioBase = 0;
    this.impuestos = 0;
    this.descuento = 0;
  }

  async validarDatosEntrada() {
    if (!this.cliente || !this.cliente.idCliente) {
      throw new Error('Cliente requerido para compra de envío');
    }
    if (!this.envioDraft || !this.envioDraft.origenSedeId || !this.envioDraft.destinoSedeId) {
      throw new Error('Datos básicos de envío incompletos');
    }
  }

  async calcularPrecio() {
    const { pesoKg = 0, altoCm = 0, anchoCm = 0, largoCm = 0 } = this.envioDraft;
    const volumen = altoCm * anchoCm * largoCm;

    const factorPeso = pesoKg * 1000;
    const factorVolumen = volumen * 0.05;
    const base = 7000;

    this.precioBase = base + factorPeso + factorVolumen;
    this.impuestos = this.precioBase * 0.19;
    this.descuento = 0;
  }

  async registrarTransaccion() {
    this.envio = new Envio({
      ...this.envioDraft,
      idEnvio: Date.now(),
      valorDeclarado: this.envioDraft.valorDeclarado ?? 0,
      tipoServicio: this.envioDraft.tipoServicio ?? 'ESTANDAR',
      estado: 'REGISTRADO'
    });
  }

  async procesarPago() {
    const montoTotal = this.precioBase + this.impuestos - this.descuento;

    this.pago = new Pago({
      idPago: Date.now(),
      idCliente: this.cliente.idCliente,
      monto: montoTotal,
      metodoPago: this.datosPago.metodo,
      origenPago: 'ENVIO',
      idOrigen: this.envio.idEnvio
    });

    this.pago.marcarAprobado('REF-ENV-' + this.envio.idEnvio);
  }

  async generarDocumentoSoporte() {
    const item = new ItemFactura({
      idItem: 1,
      idFactura: 2,
      descripcion: `Guía de envío ${this.envio.codigoRastreo || this.envio.idEnvio}`,
      cantidad: 1,
      precioUnitario: this.precioBase,
      impuesto: this.impuestos
    });

    this.factura = new Factura({
      idFactura: 2,
      numeroFactura: 'FV-ENV-' + this.envio.idEnvio,
      idCliente: this.cliente.idCliente,
      medioGeneracion: 'WEB'
    });

    this.factura.calcularTotales([item]);
    this.envio.idFactura = this.factura.idFactura;
  }

  async notificarCliente() {
    const notif = new Notificacion({
      idNotificacion: Date.now(),
      idUsuarioDestino: this.cliente.idCliente,
      canal: 'EMAIL',
      titulo: 'Compra de envío registrada',
      mensaje: `Tu envío #${this.envio.idEnvio} ha sido registrado.`,
      referenciaOrigen: 'ENVIO',
      idOrigen: this.envio.idEnvio
    });

    notif.marcarEnviada();
    this.notificacion = notif;
  }
}
