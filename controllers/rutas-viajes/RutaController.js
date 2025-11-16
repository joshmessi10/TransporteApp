// controllers/rutas-viajes/RutaController.js
import {
  crearRuta,
  obtenerRuta,
  actualizarRuta,
  activarRuta,
  inactivarRuta
} from './RutasViajesMemoryStore.js';

export default class RutaController {
  static async crear(req, res) {
    const datos = req.body || {};
    const ruta = crearRuta(datos);
    return res.status(201).json({ ok: true, ruta });
  }

  static async obtener(req, res) {
    const id = Number(req.params.id);
    const ruta = obtenerRuta(id);
    if (!ruta) {
      return res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });
    }
    return res.status(200).json({ ok: true, ruta });
  }

  static async actualizar(req, res) {
    const id = Number(req.params.id);
    const datos = req.body || {};
    const ruta = actualizarRuta(id, datos);
    if (!ruta) {
      return res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });
    }
    return res.status(200).json({ ok: true, ruta });
  }

  static async activar(req, res) {
    const id = Number(req.params.id);
    const ruta = activarRuta(id);
    if (!ruta) {
      return res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });
    }
    return res.status(200).json({ ok: true, ruta });
  }

  static async inactivar(req, res) {
    const id = Number(req.params.id);
    const ruta = inactivarRuta(id);
    if (!ruta) {
      return res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });
    }
    return res.status(200).json({ ok: true, ruta });
  }
}
