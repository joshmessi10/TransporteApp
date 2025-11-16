// controllers/pagos-facturacion/PagosFacturacionMemoryStore.js
import {
  Pago,
  Factura,
  ItemFactura,
  SeguroEnvio
} from '../../models/pagos-facturacion/index.js';

let nextPagoId = 1;
let nextFacturaId = 1;
let nextItemFacturaId = 1;
let nextSeguroId = 1;

const pagos = new Map();        // idPago    -> Pago
const facturas = new Map();     // idFactura -> Factura
const seguros = new Map();      // idSeguro  -> SeguroEnvio

// idCliente -> idFactura[]
const facturasPorCliente = new Map();

/* ========== PAGOS ========== */

export function crearPago(datos) {
  const idPago = nextPagoId++;
  const pago = new Pago({
    idPago,
    estado: 'PENDIENTE', // estado “lógico” que usaremos en controladores/tests
    ...datos
  });
  pagos.set(idPago, pago);
  return pago;
}

export function obtenerPago(idPago) {
  return pagos.get(idPago) || null;
}

export function actualizarEstadoPago(idPago, nuevoEstado) {
  const pago = pagos.get(idPago);
  if (!pago) return null;
  pago.estado = nuevoEstado; // si tu modelo usa estadoPago, puedes sincronizarlo aquí también
  return pago;
}

/* ========== FACTURAS ========== */

export function crearFactura({ idCliente, items = [], ...resto }) {
  const idFactura = nextFacturaId++;

  // Creamos la factura
  const factura = new Factura({
    idFactura,
    idCliente,
    estado: 'VIGENTE',
    fechaEmision: new Date(),
    ...resto
  });

  // Creamos los ítems de la factura
  const itemsFactura = items.map((it) => {
    const idItemFactura = nextItemFacturaId++;
    return new ItemFactura({
      idItemFactura,
      idFactura,
      ...it
    });
  });

  // Por si tu modelo no define explícito un campo, lo colgamos igual:
  factura.items = itemsFactura;

  facturas.set(idFactura, factura);

  if (idCliente != null) {
    if (!facturasPorCliente.has(idCliente)) {
      facturasPorCliente.set(idCliente, []);
    }
    facturasPorCliente.get(idCliente).push(idFactura);
  }

  return factura;
}

export function obtenerFactura(idFactura) {
  return facturas.get(idFactura) || null;
}

export function listarFacturasPorCliente(idCliente) {
  const ids = facturasPorCliente.get(idCliente) || [];
  return ids.map((id) => facturas.get(id)).filter(Boolean);
}

export function anularFactura(idFactura, motivo = 'Sin motivo') {
  const factura = facturas.get(idFactura);
  if (!factura) return null;
  factura.estado = 'ANULADA';
  factura.motivoAnulacion = motivo;
  factura.fechaAnulacion = new Date();
  return factura;
}

/* ========== SEGUROS DE ENVÍO ========== */

export function crearSeguroEnvio(datos) {
  const idSeguro = nextSeguroId++;
  const seguro = new SeguroEnvio({
    idSeguro,
    ...datos
  });
  seguros.set(idSeguro, seguro);
  return seguro;
}

export function obtenerSeguroEnvio(idSeguro) {
  return seguros.get(idSeguro) || null;
}

export function actualizarSeguroEnvio(idSeguro, datos) {
  const seguro = seguros.get(idSeguro);
  if (!seguro) return null;
  Object.assign(seguro, datos);
  return seguro;
}
