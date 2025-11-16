// controllers/atencion-cliente/NotificacionController.js
import {
  listarNotificacionesUsuario,
  obtenerNotificacion,
  marcarNotificacionLeida
} from './AtencionClienteMemoryStore.js';

export default class NotificacionController {
  static async listarPorUsuario(req, res) {
    const idUsuario = Number(req.params.idUsuario);
    const notifs = listarNotificacionesUsuario(idUsuario);
    return res.status(200).json({ ok: true, notificaciones: notifs });
  }

  static async obtener(req, res) {
    const id = Number(req.params.id);
    const notif = obtenerNotificacion(id);
    if (!notif) {
      return res.status(404).json({ ok: false, mensaje: 'Notificación no encontrada' });
    }
    return res.status(200).json({ ok: true, notificacion: notif });
  }

  static async marcarLeida(req, res) {
    const id = Number(req.params.id);
    const notif = marcarNotificacionLeida(id);
    if (!notif) {
      return res.status(404).json({ ok: false, mensaje: 'Notificación no encontrada' });
    }
    return res.status(200).json({ ok: true, notificacion: notif });
  }
}
