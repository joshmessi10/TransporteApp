// models/procesos-compra/ProcesoCompraTiquete.js
import ProcesoCompra from './ProcesoCompra.js';
import { Tiquete } from '../pasajeros/index.js';
import { Pago, Factura, ItemFactura } from '../pagos-facturacion/index.js';
import { Notificacion } from '../atencion-cliente/index.js';

export default class ProcesoCompraTiquete extends ProcesoCompra {
  constructor({ cliente, viaje, datosPago }) {
    super();
    this.cliente = cliente;   // puede ser instancia de Cliente o un objeto { idCliente, ... }
    this.viaje = viaje;       // instancia de Viaje
    this.datosPago = datosPago;

    this.tiquete = null;
    this.pago = null;
    this.factura = null;

    this.precioBase = 0;
    this.impuestos = 0;
    this.descuento = 0;
  }

  async validarDatosEntrada() {
    if (!this.cliente || !this.cliente.idCliente) {
      throw new Error('Cliente requerido para comprar tiquete');
    }
    if (!this.viaje) {
      throw new Error('Viaje requerido para comprar tiquete');
    }
    if (!this.viaje.hayAsientosDisponibles || !this.viaje.hayAsientosDisponibles(1)) {
      throw new Error('No hay asientos disponibles en el viaje');
    }
  }

  async calcularPrecio() {
    // Lógica simplificada: precio fijo base + IVA
    this.precioBase = 50000;
    this.impuestos = this.precioBase * 0.19;
    this.descuento = 0;
  }

  async registrarTransaccion() {
    // Reservar asiento (simplificado: no jugamos con número de asiento real)
    this.viaje.reservarAsientos(1);

    this.tiquete = new Tiquete({
      idTiquete: Date.now(),
      idViaje: this.viaje.idViaje,
      idCliente: this.cliente.idCliente,
      numeroAsiento: 1,
      precioBase: this.precioBase,
      impuestos: this.impuestos,
      descuento: this.descuento,
      estado: 'RESERVADO',
      canalVenta: 'WEB'
    });
  }

  async procesarPago() {
    this.pago = new Pago({
      idPago: Date.now(),
      idCliente: this.cliente.idCliente,
      monto: this.tiquete.precioTotal,
      metodoPago: this.datosPago.metodo,
      origenPago: 'TIQUETE',
      idOrigen: this.tiquete.idTiquete
    });

    // Simulación: pago siempre aprobado
    this.pago.marcarAprobado('REF-TIQ-' + this.tiquete.idTiquete);
    this.tiquete.marcarComoPagado();
  }

  async generarDocumentoSoporte() {
    const item = new ItemFactura({
      idItem: 1,
      idFactura: 1,
      descripcion: `Tiquete viaje ${this.viaje.idViaje}`,
      cantidad: 1,
      precioUnitario: this.precioBase,
      impuesto: this.impuestos
    });

    this.factura = new Factura({
      idFactura: 1,
      numeroFactura: 'FV-TIQ-' + this.tiquete.idTiquete,
      idCliente: this.cliente.idCliente,
      medioGeneracion: 'WEB'
    });

    this.factura.calcularTotales([item]);
    this.tiquete.idFactura = this.factura.idFactura;
  }

  async notificarCliente() {
    const notif = new Notificacion({
      idNotificacion: Date.now(),
      idUsuarioDestino: this.cliente.idCliente,
      canal: 'EMAIL',
      titulo: 'Compra de tiquete confirmada',
      mensaje: `Tu tiquete #${this.tiquete.idTiquete} ha sido emitido.`,
      referenciaOrigen: 'TIQUETE',
      idOrigen: this.tiquete.idTiquete
    });

    // Simulamos envío correcto
    notif.marcarEnviada();

    // Podrías guardar la notificación si tuvieses repositorio
    this.notificacion = notif;
  }
}
