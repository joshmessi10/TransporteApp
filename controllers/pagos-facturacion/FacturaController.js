// controllers/pagos-facturacion/FacturaController.js
import {
  crearFactura,
  obtenerFactura,
  listarFacturasPorCliente,
  anularFactura
} from './PagosFacturacionMemoryStore.js';

export default class FacturaController {
  static async crearFactura(req, res) {
    const body = req.body || {};
    const { idCliente, items } = body;

    if (!idCliente) {
      return res.status(400).json({ ok: false, mensaje: 'idCliente es obligatorio' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'Se requiere al menos un item de factura' });
    }

    const factura = crearFactura(body);

    return res.status(201).json({ ok: true, factura });
  }

  static async obtenerFactura(req, res) {
    const id = Number(req.params.id);
    const factura = obtenerFactura(id);
    if (!factura) {
      return res.status(404).json({ ok: false, mensaje: 'Factura no encontrada' });
    }
    return res.status(200).json({ ok: true, factura });
  }

  static async facturasPorCliente(req, res) {
    const idCliente = Number(req.params.idCliente);
    const lista = listarFacturasPorCliente(idCliente);
    return res.status(200).json({ ok: true, facturas: lista });
  }

  static async anularFactura(req, res) {
    const id = Number(req.params.id);
    const { motivo } = req.body || {};
    const factura = anularFactura(id, motivo || 'Sin motivo');
    if (!factura) {
      return res.status(404).json({ ok: false, mensaje: 'Factura no encontrada' });
    }
    return res.status(200).json({ ok: true, factura });
  }
}
