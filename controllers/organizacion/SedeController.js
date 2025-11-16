// controllers/organizacion/SedeController.js
import {
  crearSede,
  obtenerSede,
  actualizarSede,
  eliminarSede
} from './OrganizacionMemoryStore.js';

export default class SedeController {
  static async crear(req, res) {
    const datos = req.body || {};
    const sede = crearSede(datos);
    return res.status(201).json({ ok: true, sede });
  }

  static async obtener(req, res) {
    const id = Number(req.params.id);
    const sede = obtenerSede(id);
    if (!sede) {
      return res.status(404).json({ ok: false, mensaje: 'Sede no encontrada' });
    }
    return res.status(200).json({ ok: true, sede });
  }

  static async actualizar(req, res) {
    const id = Number(req.params.id);
    const datos = req.body || {};
    const sede = actualizarSede(id, datos);
    if (!sede) {
      return res.status(404).json({ ok: false, mensaje: 'Sede no encontrada' });
    }
    return res.status(200).json({ ok: true, sede });
  }

  static async eliminar(req, res) {
    const id = Number(req.params.id);
    const ok = eliminarSede(id);
    if (!ok) {
      return res.status(404).json({ ok: false, mensaje: 'Sede no encontrada' });
    }
    return res.status(200).json({ ok: true });
  }
}
