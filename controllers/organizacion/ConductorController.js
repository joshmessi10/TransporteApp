import db from '../../config/db.js';

export default class ConductorController {
  static crear(req, res) {
    const datos = req.body || {};
    const sql = `INSERT INTO conductores (nombre, licencia, categoria, id_sede)
                 VALUES (?, ?, ?, ?)`;

    db.run(sql, [datos.nombre || null, datos.licencia || null, datos.categoria || null, datos.id_sede || null], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });

      const id = this.lastID;
      db.get('SELECT * FROM conductores WHERE id = ?', [id], (err, conductor) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(201).json({ ok: true, conductor });
      });
    });
  }

  static obtener(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM conductores WHERE id = ?', [id], (err, conductor) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!conductor) return res.status(404).json({ ok: false, mensaje: 'Conductor no encontrado' });
      return res.status(200).json({ ok: true, conductor });
    });
  }

  static actualizar(req, res) {
    const id = Number(req.params.id);
    const datos = req.body || {};

    const campos = [];
    const valores = [];

    if (datos.nombre !== undefined) { campos.push('nombre = ?'); valores.push(datos.nombre); }
    if (datos.licencia !== undefined) { campos.push('licencia = ?'); valores.push(datos.licencia); }
    if (datos.categoria !== undefined) { campos.push('categoria = ?'); valores.push(datos.categoria); }
    if (datos.id_sede !== undefined) { campos.push('id_sede = ?'); valores.push(datos.id_sede); }

    if (!campos.length) return res.status(200).json({ ok: true, conductor: null });

    valores.push(id);
    const sql = `UPDATE conductores SET ${campos.join(', ')} WHERE id = ?`;

    db.run(sql, valores, function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Conductor no encontrado' });

      db.get('SELECT * FROM conductores WHERE id = ?', [id], (err, conductor) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, conductor });
      });
    });
  }
  static listar(req, res) {
  const sql = `
    SELECT
      c.id,
      c.nombre,
      c.licencia,
      c.categoria,
      c.id_sede,
      s.nombre AS nombre_sede,
      s.ciudad AS ciudad_sede
    FROM conductores c
    LEFT JOIN sedes s ON c.id_sede = s.id
    ORDER BY c.id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ ok: false, mensaje: err.message });
    }

    const conductores = rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      licencia: row.licencia,
      categoria: row.categoria,
      id_sede: row.id_sede,
      nombreSede: row.nombre_sede || null,
      ciudadSede: row.ciudad_sede || null
    }));

    return res.status(200).json({ ok: true, conductores });
  });
}

}