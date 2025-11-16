// controllers/pagos-facturacion/PagoController.js
import {
  crearPago,
  obtenerPago,
  actualizarEstadoPago
} from './PagosFacturacionMemoryStore.js';

export default class PagoController {
  static async registrarPago(req, res) {
    const datos = req.body || {};
    const {
      idReferencia,
      tipoReferencia, // 'TIQUETE' | 'ENVIO' | etc.
      monto,
      moneda,
      metodoPago
    } = datos;

    if (!idReferencia || !tipoReferencia || !monto) {
      return res.status(400).json({
        ok: false,
        mensaje: 'idReferencia, tipoReferencia y monto son obligatorios'
      });
    }

    const pago = crearPago({
      idReferencia,
      tipoReferencia,
      monto,
      moneda: moneda || 'COP',
      metodoPago: metodoPago || 'EFECTIVO'
    });

    return res.status(201).json({ ok: true, pago });
  }

  static async obtenerPago(req, res) {
    const id = Number(req.params.id);
    const pago = obtenerPago(id);
    if (!pago) {
      return res.status(404).json({ ok: false, mensaje: 'Pago no encontrado' });
    }
    return res.status(200).json({ ok: true, pago });
  }

  static async aprobarPago(req, res) {
    const id = Number(req.params.id);
    const pago = obtenerPago(id);
    if (!pago) {
      return res.status(404).json({ ok: false, mensaje: 'Pago no encontrado' });
    }

    // Aquí podrías validar contra el total esperado
    actualizarEstadoPago(id, 'APROBADO');

    return res.status(200).json({ ok: true, pago });
  }

  static async rechazarPago(req, res) {
    const id = Number(req.params.id);
    const pago = obtenerPago(id);
    if (!pago) {
      return res.status(404).json({ ok: false, mensaje: 'Pago no encontrado' });
    }

    const { motivo } = req.body || {};
    actualizarEstadoPago(id, 'RECHAZADO');
    pago.motivoRechazo = motivo || 'Sin motivo';

    return res.status(200).json({ ok: true, pago });
  }
}
