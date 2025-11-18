import db from '../../config/db.js';

export default class AdminController {
  static registrarAdmin(req, res) {
    const { nombre, email, password } = req.body || {};
    const sql = `INSERT INTO users (nombre, email, password, rol, estado)
                 VALUES (?, ?, ?, 'admin', 'activo')`;

    db.run(sql, [nombre || null, email, password || null], function (err) {
      if (err) {
        console.error(err);
        return res.status(400).json({ ok: false, mensaje: err.message });
      }

      const id = this.lastID;
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, admin) => {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
        return res.status(201).json({ ok: true, admin });
      });
    });
  }

  static obtenerAdmin(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM users WHERE id = ? AND rol = ?', [id, 'admin'], (err, admin) => {
      if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
      if (!admin) return res.status(404).json({ ok: false, mensaje: 'Admin no encontrado' });
      return res.status(200).json({ ok: true, admin });
    });
  }

  static actualizarAdmin(req, res) {
    const id = Number(req.params.id);
    const datos = req.body || {};

    const campos = [];
    const valores = [];

    if (datos.nombre !== undefined) { campos.push('nombre = ?'); valores.push(datos.nombre); }
    if (datos.email !== undefined) { campos.push('email = ?'); valores.push(datos.email); }
    if (datos.password !== undefined) { campos.push('password = ?'); valores.push(datos.password); }

    if (!campos.length) return res.status(200).json({ ok: true, admin: null });

    valores.push(id);
    const sql = `UPDATE users SET ${campos.join(', ')} WHERE id = ? AND rol = 'admin'`;

    db.run(sql, valores, function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Admin no encontrado' });

      db.get('SELECT * FROM users WHERE id = ?', [id], (err, admin) => {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
        return res.status(200).json({ ok: true, admin });
      });
    });
  }

  static bloquearAdmin(req, res) {
    const id = Number(req.params.id);
    db.run("UPDATE users SET estado = 'bloqueado' WHERE id = ? AND rol = 'admin'", [id], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Admin no encontrado' });

      db.get('SELECT * FROM users WHERE id = ?', [id], (err, admin) => {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
        return res.status(200).json({ ok: true, admin });
      });
    });
  }

  static desbloquearAdmin(req, res) {
    const id = Number(req.params.id);
    db.run("UPDATE users SET estado = 'activo' WHERE id = ? AND rol = 'admin'", [id], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Admin no encontrado' });

      db.get('SELECT * FROM users WHERE id = ?', [id], (err, admin) => {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
        return res.status(200).json({ ok: true, admin });
      });
    });
  }
}