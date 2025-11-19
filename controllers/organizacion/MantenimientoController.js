import db from '../../config/db.js';

export default class MantenimientoController {
  static programar(req, res) {
    const datos = req.body || {};
    const { vehiculoPlaca, tipo, fecha_programado } = datos;
    if (!vehiculoPlaca) return res.status(400).json({ ok: false, mensaje: 'vehiculoPlaca es obligatorio' });

    db.get('SELECT id FROM vehiculos WHERE placa = ?', [vehiculoPlaca], (err, vehiculo) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!vehiculo) return res.status(400).json({ ok: false, mensaje: 'Vehículo no existe' });

      const sql = `INSERT INTO mantenimientos (id_vehiculo, tipo, estado, fecha_programado)
                   VALUES (?, ?, 'pendiente', ?)`;

      db.run(sql, [vehiculo.id, tipo || null, fecha_programado || null], function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        const id = this.lastID;
        db.get('SELECT * FROM mantenimientos WHERE id = ?', [id], (err, mantenimiento) => {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });
          return res.status(201).json({ ok: true, mantenimiento });
        });
      });
    });
  }

  static obtener(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM mantenimientos WHERE id = ?', [id], (err, mantenimiento) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!mantenimiento) return res.status(404).json({ ok: false, mensaje: 'Mantenimiento no encontrado' });
      return res.status(200).json({ ok: true, mantenimiento });
    });
  }

  static eliminar(req, res) {
    const id = Number(req.params.id);
    db.run('DELETE FROM mantenimientos WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Mantenimiento no encontrado' });
      return res.status(200).json({ ok: true });
    });
  }

  static iniciar(req, res) {
    const id = Number(req.params.id);
    const fechaInicio = new Date().toISOString().slice(0, 19).replace('T', ' ');

    db.get('SELECT * FROM mantenimientos WHERE id = ?', [id], (err, mantenimiento) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!mantenimiento) return res.status(404).json({ ok: false, mensaje: 'Mantenimiento no encontrado' });

      db.run("UPDATE mantenimientos SET estado = 'en-proceso', fecha_inicio = ? WHERE id = ?", [fechaInicio, id], function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        db.get('SELECT * FROM mantenimientos WHERE id = ?', [id], (err, actualizado) => {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });
          return res.status(200).json({ ok: true, mantenimiento: actualizado });
        });
      });
    });
  }

  static finalizar(req, res) {
    const id = Number(req.params.id);
    const { costoReal } = req.body || {};
    const fechaFin = new Date().toISOString().slice(0, 19).replace('T', ' ');

    db.get('SELECT * FROM mantenimientos WHERE id = ?', [id], (err, mantenimiento) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!mantenimiento) return res.status(404).json({ ok: false, mensaje: 'Mantenimiento no encontrado' });

      db.run(
        'UPDATE mantenimientos SET estado = ?, fecha_fin = ?, costo = ? WHERE id = ?',
        ['finalizado', fechaFin, Number(costoReal) || 0, id],
        function (err) {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });

          db.get('SELECT * FROM mantenimientos WHERE id = ?', [id], (err, actualizado) => {
            if (err) return res.status(500).json({ ok: false, mensaje: err.message });
            return res.status(200).json({ ok: true, mantenimiento: actualizado });
          });
        }
      );
    });
  }
  static listar(req, res) {
  const sql = `
    SELECT
      m.id,
      m.id_vehiculo,
      m.tipo,
      m.estado,
      m.fecha_programado,
      m.fecha_inicio,
      m.fecha_fin,
      v.placa
    FROM mantenimientos m
    LEFT JOIN vehiculos v ON m.id_vehiculo = v.id
    ORDER BY
      m.fecha_programado DESC,
      m.id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ ok: false, mensaje: err.message });
    }

    const mantenimientos = rows.map(row => ({
      id: row.id,
      id_vehiculo: row.id_vehiculo,
      placa: row.placa || null,
      tipo: row.tipo,
      estado: row.estado,
      fecha_programado: row.fecha_programado,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin
    }));

    return res.status(200).json({ ok: true, mantenimientos });
  });
}

}