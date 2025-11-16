// controllers/organizacion/ConductorController.js
import {
  crearConductor,
  obtenerConductor,
  actualizarConductor
} from './OrganizacionMemoryStore.js';

export default class ConductorController {
  static async crear(req, res) {
    const datos = req.body || {};
    const conductor = crearConductor(datos);
    return res.status(201).json({ ok: true, conductor });
  }

  static async obtener(req, res) {
    const id = Number(req.params.id);
    const conductor = obtenerConductor(id);
    if (!conductor) {
      return res.status(404).json({ ok: false, mensaje: 'Conductor no encontrado' });
    }
    return res.status(200).json({ ok: true, conductor });
  }

  static async actualizar(req, res) {
    const id = Number(req.params.id);
    const datos = req.body || {};
    const conductor = actualizarConductor(id, datos);
    if (!conductor) {
      return res.status(404).json({ ok: false, mensaje: 'Conductor no encontrado' });
    }
    return res.status(200).json({ ok: true, conductor });
  }
}
