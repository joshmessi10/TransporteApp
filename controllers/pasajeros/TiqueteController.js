import db from '../../config/db.js';

export default class TiqueteController {
  static crearTiquete(req, res) {
    const { idCliente, idViaje, asiento, precio } = req.body || {};

    if (!idCliente || !idViaje || asiento == null) {
      return res.status(400).json({ ok: false, mensaje: 'idCliente, idViaje y asiento son obligatorios' });
    }

    db.run(
      'INSERT INTO tiquetes (id_reserva, id_cliente, asiento, precio, estado) VALUES (?, ?, ?, ?, ?)',
      [null, Number(idCliente), asiento, Number(precio) || 0, 'emitido'],
      function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        const id = this.lastID;
        db.get('SELECT * FROM tiquetes WHERE id = ?', [id], (err, tiquete) => {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });
          return res.status(201).json({ ok: true, tiquete });
        });
      }
    );
  }

  static obtenerTiquete(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM tiquetes WHERE id = ?', [id], (err, tiquete) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!tiquete) return res.status(404).json({ ok: false, mensaje: 'Tiquete no encontrado' });
      return res.status(200).json({ ok: true, tiquete });
    });
  }

  static historialCliente(req, res) {
  const idCliente = Number(req.params.idCliente);

  const sql = `
    SELECT
      t.id AS id_tiquete,
      t.asiento,
      t.precio,
      t.estado,
      r.origen,
      r.destino,
      v.fecha_salida AS fechaViaje
    FROM tiquetes t
    LEFT JOIN reservas_tiquete rt ON t.id_reserva = rt.id
    LEFT JOIN viajes v ON rt.id_viaje = v.id
    LEFT JOIN rutas r ON v.id_ruta = r.id
    WHERE t.id_cliente = ?
    ORDER BY t.id DESC
  `;

  db.all(sql, [idCliente], (err, rows) => {
    if (err) {
      console.error('Error listando tiquetes del cliente:', err);
      return res.status(500).json({ ok: false, mensaje: err.message });
    }

    const tiquetes = rows.map(row => ({
      id: row.id_tiquete,
      numero: row.id_tiquete,             // lo que muestra "#1", "#2", etc.
      origen: row.origen || 'Sin origen',
      destino: row.destino || 'Sin destino',
      fechaViaje: row.fechaViaje,         // '2025-01-20 08:00:00'
      asiento: row.asiento,
      precio: row.precio,
      usado: row.estado === 'usado'
    }));

    return res.status(200).json({ ok: true, tiquetes });
  });
}

  static anularTiquete(req, res) {
    const id = Number(req.params.id);
    const { motivo } = req.body || {};

    db.run("UPDATE tiquetes SET estado = 'anulado' WHERE id = ?", [id], function (err) {
      if (err) return res.status(400).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Tiquete no encontrado' });

      db.get('SELECT * FROM tiquetes WHERE id = ?', [id], (err, tiquete) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        tiquete.motivoAnulacion = motivo || null;
        return res.status(200).json({ ok: true, tiquete });
      });
    });
  }

  static marcarUsado(req, res) {
    const id = Number(req.params.id);

    db.run("UPDATE tiquetes SET estado = 'usado' WHERE id = ?", [id], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Tiquete no encontrado' });

      db.get('SELECT * FROM tiquetes WHERE id = ?', [id], (err, tiquete) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, tiquete });
      });
    });
  }
  static listar(req, res) {
  const idCliente = req.query.idCliente ? Number(req.query.idCliente) : null;

  let sql = `
    SELECT
      t.id AS id_tiquete,
      t.id_cliente,
      t.asiento,
      t.precio,
      t.estado,
      r.origen,
      r.destino,
      v.fecha_salida AS fechaViaje
    FROM tiquetes t
    LEFT JOIN reservas_tiquete rt ON t.id_reserva = rt.id
    LEFT JOIN viajes v ON rt.id_viaje = v.id
    LEFT JOIN rutas r ON v.id_ruta = r.id
  `;

  const params = [];

  if (idCliente) {
    sql += ' WHERE t.id_cliente = ?';
    params.push(idCliente);
  }

  sql += ' ORDER BY t.id DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error listando tiquetes:', err);
      return res.status(500).json({ ok: false, mensaje: 'Error interno' });
    }

    const tiquetes = rows.map(row => ({
      id: row.id_tiquete,
      numero: row.id_tiquete,
      origen: row.origen || 'Sin origen',
      destino: row.destino || 'Sin destino',
      // pasamos a formato ISO para que el front no tenga problemas
      fechaViaje: row.fechaViaje ? row.fechaViaje.replace(' ', 'T') : null,
      asiento: row.asiento,
      precio: row.precio,
      usado: row.estado === 'usado'
    }));

    return res.status(200).json({ ok: true, tiquetes });
  });
}


}