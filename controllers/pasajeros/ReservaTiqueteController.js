// controllers/pasajeros/ReservaTiqueteController.js
import {
  crearReserva,
  obtenerReserva,
  cancelarReserva,
  confirmarReserva
} from './PasajerosMemoryStore.js';

export default class ReservaTiqueteController {
  static async crearReserva(req, res) {
    const { idViaje, idCliente, asiento, fechaExpiracion } = req.body || {};

    if (!idViaje || !idCliente || asiento == null) {
      return res.status(400).json({
        ok: false,
        mensaje: 'idViaje, idCliente y asiento son obligatorios'
      });
    }

    const reserva = crearReserva({
      idViaje,
      idCliente,
      asiento,
      fechaExpiracion: fechaExpiracion
        ? new Date(fechaExpiracion)
        : new Date(Date.now() + 15 * 60 * 1000) // 15 min por defecto
    });

    return res.status(201).json({ ok: true, reserva });
  }

  static async obtenerReserva(req, res) {
    const id = Number(req.params.id);
    const reserva = obtenerReserva(id);
    if (!reserva) {
      return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });
    }
    return res.status(200).json({ ok: true, reserva });
  }

  static async cancelarReserva(req, res) {
    const id = Number(req.params.id);
    const reserva = cancelarReserva(id);
    if (!reserva) {
      return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });
    }
    return res.status(200).json({ ok: true, reserva });
  }

  static async confirmarReserva(req, res) {
    const id = Number(req.params.id);
    let resultado;
    try {
      resultado = confirmarReserva(id);
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }

    if (!resultado) {
      return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });
    }

    const { reserva, tiquete } = resultado;
    return res.status(200).json({ ok: true, reserva, tiquete });
  }
}
