// controllers/pasajeros/TiqueteController.js
import {
  crearTiquete,
  obtenerTiquete,
  listarTiquetesPorCliente,
  anularTiquete,
  marcarTiqueteUsado
} from './PasajerosMemoryStore.js';

export default class TiqueteController {
  static async crearTiquete(req, res) {
    const { idCliente, idViaje, asiento } = req.body || {};

    if (!idCliente || !idViaje || asiento == null) {
      return res.status(400).json({
        ok: false,
        mensaje: 'idCliente, idViaje y asiento son obligatorios'
      });
    }

    const tiquete = crearTiquete({ idCliente, idViaje, asiento });
    return res.status(201).json({ ok: true, tiquete });
  }

  static async obtenerTiquete(req, res) {
    const id = Number(req.params.id);
    const tiquete = obtenerTiquete(id);
    if (!tiquete) {
      return res.status(404).json({ ok: false, mensaje: 'Tiquete no encontrado' });
    }
    return res.status(200).json({ ok: true, tiquete });
  }

  static async historialCliente(req, res) {
    const idCliente = Number(req.params.idCliente);
    const tiqs = listarTiquetesPorCliente(idCliente);
    return res.status(200).json({ ok: true, tiquetes: tiqs });
  }

  static async anularTiquete(req, res) {
    const id = Number(req.params.id);
    const { motivo } = req.body || {};

    try {
      const tiquete = anularTiquete(id, motivo || 'Sin motivo');
      if (!tiquete) {
        return res.status(404).json({ ok: false, mensaje: 'Tiquete no encontrado' });
      }
      return res.status(200).json({ ok: true, tiquete });
    } catch (e) {
      // Aquí respetamos la regla de dominio (modelo lanza error)
      return res.status(400).json({ ok: false, mensaje: e.message });
    }
  }

  static async marcarUsado(req, res) {
    const id = Number(req.params.id);
    const tiquete = marcarTiqueteUsado(id);
    if (!tiquete) {
      return res.status(404).json({ ok: false, mensaje: 'Tiquete no encontrado' });
    }
    return res.status(200).json({ ok: true, tiquete });
  }
}
