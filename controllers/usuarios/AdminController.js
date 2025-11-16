// controllers/usuarios/AdminController.js
import {
  crearAdmin,
  obtenerPorId,
  actualizarModelo,
  bloquearUsuario,
  desbloquearUsuario
} from './UsuarioMemoryStore.js';

export default class AdminController {
  static async registrarAdmin(req, res) {
    const { email, password, ...datos } = req.body || {};

    try {
      const record = crearAdmin({ email, password, ...datos });
      return res.status(201).json({ ok: true, admin: record.model });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }
  }

  static async obtenerAdmin(req, res) {
    const id = Number(req.params.id);
    const record = obtenerPorId(id);
    if (!record || record.tipo !== 'ADMIN') {
      return res.status(404).json({ ok: false, mensaje: 'Admin no encontrado' });
    }
    return res.status(200).json({ ok: true, admin: record.model });
  }

  static async actualizarAdmin(req, res) {
    const id = Number(req.params.id);
    const record = obtenerPorId(id);
    if (!record || record.tipo !== 'ADMIN') {
      return res.status(404).json({ ok: false, mensaje: 'Admin no encontrado' });
    }

    const datos = req.body || {};
    const updated = actualizarModelo(id, datos);

    return res.status(200).json({ ok: true, admin: updated.model });
  }

  static async bloquearAdmin(req, res) {
    const id = Number(req.params.id);
    const record = bloquearUsuario(id);
    if (!record || record.tipo !== 'ADMIN') {
      return res.status(404).json({ ok: false, mensaje: 'Admin no encontrado' });
    }
    return res.status(200).json({ ok: true, admin: record.model });
  }

  static async desbloquearAdmin(req, res) {
    const id = Number(req.params.id);
    const record = desbloquearUsuario(id);
    if (!record || record.tipo !== 'ADMIN') {
      return res.status(404).json({ ok: false, mensaje: 'Admin no encontrado' });
    }
    return res.status(200).json({ ok: true, admin: record.model });
  }
}
