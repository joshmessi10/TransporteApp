import db from '../../config/db.js';

export default class SedeController {
  static crear(req, res) {
    const datos = req.body || {};
    const sql = `INSERT INTO sedes (nombre, direccion, ciudad, telefono) VALUES (?, ?, ?, ?)`;

    db.run(sql, [datos.nombre || null, datos.direccion || null, datos.ciudad || null, datos.telefono || null], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });

      const id = this.lastID;
      db.get('SELECT * FROM sedes WHERE id = ?', [id], (err, sede) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(201).json({ ok: true, sede });
      });
    });
  }

  static obtener(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM sedes WHERE id = ?', [id], (err, sede) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!sede) return res.status(404).json({ ok: false, mensaje: 'Sede no encontrada' });
      return res.status(200).json({ ok: true, sede });
    });
  }

  static actualizar(req, res) {
    const id = Number(req.params.id);
    const datos = req.body || {};

    const campos = [];
    const valores = [];

    if (datos.nombre !== undefined) { campos.push('nombre = ?'); valores.push(datos.nombre); }
    if (datos.direccion !== undefined) { campos.push('direccion = ?'); valores.push(datos.direccion); }
    if (datos.ciudad !== undefined) { campos.push('ciudad = ?'); valores.push(datos.ciudad); }
    if (datos.telefono !== undefined) { campos.push('telefono = ?'); valores.push(datos.telefono); }

    if (!campos.length) return res.status(200).json({ ok: true, sede: null });

    valores.push(id);
    const sql = `UPDATE sedes SET ${campos.join(', ')} WHERE id = ?`;

    db.run(sql, valores, function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Sede no encontrada' });

      db.get('SELECT * FROM sedes WHERE id = ?', [id], (err, sede) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, sede });
      });
    });
  }

  static eliminar(req, res) {
    const id = Number(req.params.id);
    db.run('DELETE FROM sedes WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Sede no encontrada' });
      return res.status(200).json({ ok: true });
    });
  }
  static listar(req, res) {
  const sql = `
    SELECT
      id,
      nombre,
      direccion,
      ciudad,
      telefono
    FROM sedes
    ORDER BY id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ ok: false, mensaje: err.message });
    }

    const sedes = rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      direccion: row.direccion,
      ciudad: row.ciudad,
      telefono: row.telefono
    }));

    return res.status(200).json({ ok: true, sedes });
  });
}
}