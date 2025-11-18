import db from '../../config/db.js';

export default class NotificacionController {
  static listarPorUsuario(req, res) {
    const idUsuario = Number(req.params.idUsuario);
    db.all(
      'SELECT * FROM notificaciones WHERE id_usuario = ? ORDER BY fecha DESC',
      [idUsuario],
      (err, notificaciones) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, notificaciones });
      }
    );
  }

  static obtener(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM notificaciones WHERE id = ?', [id], (err, notificacion) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!notificacion) return res.status(404).json({ ok: false, mensaje: 'Notificación no encontrada' });
      return res.status(200).json({ ok: true, notificacion });
    });
  }

  static marcarLeida(req, res) {
    const id = Number(req.params.id);
    db.run('UPDATE notificaciones SET leida = true WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Notificación no encontrada' });

      db.get('SELECT * FROM notificaciones WHERE id = ?', [id], (err, notificacion) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, notificacion });
      });
    });
  }
}