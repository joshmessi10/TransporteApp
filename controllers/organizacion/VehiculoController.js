import db from '../../config/db.js';

export default class VehiculoController {
  static crear(req, res) {
    const datos = req.body || {};
    const sql = `INSERT INTO vehiculos (placa, tipo, capacidad, kilometraje, estado, id_sede)
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
      datos.placa,
      datos.tipo || null,
      datos.capacidad || null,
      datos.kilometraje || 0,
      datos.estado || 'activo',
      datos.id_sede || null
    ], function (err) {
      if (err) return res.status(400).json({ ok: false, mensaje: err.message });

      const id = this.lastID;
      db.get('SELECT * FROM vehiculos WHERE id = ?', [id], (err, vehiculo) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(201).json({ ok: true, vehiculo });
      });
    });
  }

  static obtener(req, res) {
    const placa = req.params.placa;
    db.get('SELECT * FROM vehiculos WHERE placa = ?', [placa], (err, vehiculo) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!vehiculo) return res.status(404).json({ ok: false, mensaje: 'Vehículo no encontrado' });
      return res.status(200).json({ ok: true, vehiculo });
    });
  }

  static actualizar(req, res) {
    const placa = req.params.placa;
    const datos = req.body || {};

    const campos = [];
    const valores = [];

    if (datos.tipo !== undefined) { campos.push('tipo = ?'); valores.push(datos.tipo); }
    if (datos.capacidad !== undefined) { campos.push('capacidad = ?'); valores.push(datos.capacidad); }
    if (datos.kilometraje !== undefined) { campos.push('kilometraje = ?'); valores.push(datos.kilometraje); }
    if (datos.estado !== undefined) { campos.push('estado = ?'); valores.push(datos.estado); }
    if (datos.id_sede !== undefined) { campos.push('id_sede = ?'); valores.push(datos.id_sede); }

    if (!campos.length) return res.status(200).json({ ok: true, vehiculo: null });

    valores.push(placa);
    const sql = `UPDATE vehiculos SET ${campos.join(', ')} WHERE placa = ?`;

    db.run(sql, valores, function (err) {
      if (err) return res.status(400).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Vehículo no encontrado' });

      db.get('SELECT * FROM vehiculos WHERE placa = ?', [placa], (err, vehiculo) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, vehiculo });
      });
    });
  }

  static cambiarEstado(req, res) {
    const placa = req.params.placa;
    const { nuevoEstado } = req.body || {};

    db.run('UPDATE vehiculos SET estado = ? WHERE placa = ?', [nuevoEstado, placa], function (err) {
      if (err) return res.status(400).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Vehículo no encontrado' });

      db.get('SELECT * FROM vehiculos WHERE placa = ?', [placa], (err, vehiculo) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, vehiculo });
      });
    });
  }

  static actualizarKilometraje(req, res) {
    const placa = req.params.placa;
    const { kilometraje } = req.body || {};

    db.run('UPDATE vehiculos SET kilometraje = ? WHERE placa = ?', [Number(kilometraje), placa], function (err) {
      if (err) return res.status(400).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Vehículo no encontrado' });

      db.get('SELECT * FROM vehiculos WHERE placa = ?', [placa], (err, vehiculo) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, vehiculo });
      });
    });
  }
  static listar(req, res) {
  const sql = `
    SELECT
      v.id,
      v.placa,
      v.tipo,
      v.capacidad,
      v.kilometraje,
      v.estado,
      v.id_sede,
      s.nombre AS nombre_sede
    FROM vehiculos v
    LEFT JOIN sedes s ON v.id_sede = s.id
    ORDER BY v.id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ ok: false, mensaje: err.message });
    }

    const vehiculos = rows.map(row => ({
      id: row.id,
      placa: row.placa,
      tipo: row.tipo,
      capacidad: row.capacidad,
      kilometraje: row.kilometraje,
      estado: row.estado,
      id_sede: row.id_sede,
      nombreSede: row.nombre_sede || null
    }));

    return res.status(200).json({ ok: true, vehiculos });
  });
}

}