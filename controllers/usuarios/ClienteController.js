// controllers/usuarios/ClienteController.js
import {
  crearCliente,
  obtenerPorId,
  actualizarModelo,
  bloquearUsuario,
  desbloquearUsuario
} from './UsuarioMemoryStore.js';

export default class ClienteController {
  static async registrarCliente(req, res) {
    const { email, password, ...datos } = req.body || {};

    try {
      const record = crearCliente({ email, password, ...datos });
      return res.status(201).json({ ok: true, cliente: record.model });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }
  }

  static async obtenerCliente(req, res) {
    const id = Number(req.params.id);
    const record = obtenerPorId(id);
    if (!record || record.tipo !== 'CLIENTE') {
      return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    }
    return res.status(200).json({ ok: true, cliente: record.model });
  }

  static async actualizarCliente(req, res) {
    const id = Number(req.params.id);
    const record = obtenerPorId(id);
    if (!record || record.tipo !== 'CLIENTE') {
      return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    }

    const datos = req.body || {};
    const updated = actualizarModelo(id, datos);

    return res.status(200).json({ ok: true, cliente: updated.model });
  }

  static async actualizarDatosContacto(req, res) {
    const id = Number(req.params.id);
    const record = obtenerPorId(id);
    if (!record || record.tipo !== 'CLIENTE') {
      return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    }

    const { telefono, direccion, ciudad, pais } = req.body || {};
    const updated = actualizarModelo(id, {
      telefono,
      direccion,
      ciudad,
      pais
    });

    return res.status(200).json({ ok: true, cliente: updated.model });
  }

  static async actualizarDatosFacturacion(req, res) {
    const id = Number(req.params.id);
    const record = obtenerPorId(id);
    if (!record || record.tipo !== 'CLIENTE') {
      return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    }

    const {
      nit,
      razonSocial,
      direccionFacturacion,
      ciudadFacturacion,
      paisFacturacion
    } = req.body || {};

    const updated = actualizarModelo(id, {
      nit,
      razonSocial,
      direccionFacturacion,
      ciudadFacturacion,
      paisFacturacion
    });

    return res.status(200).json({ ok: true, cliente: updated.model });
  }

  static async bloquearCliente(req, res) {
    const id = Number(req.params.id);
    const record = bloquearUsuario(id);
    if (!record || record.tipo !== 'CLIENTE') {
      return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    }
    return res.status(200).json({ ok: true, cliente: record.model });
  }

  static async desbloquearCliente(req, res) {
    const id = Number(req.params.id);
    const record = desbloquearUsuario(id);
    if (!record || record.tipo !== 'CLIENTE') {
      return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    }
    return res.status(200).json({ ok: true, cliente: record.model });
  }
}
