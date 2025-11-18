import db from '../../config/db.js';

// =======================
// Función utilitaria
// =======================
function crearNotificacionSimple({ idUsuario, titulo, mensaje }) {
  if (!idUsuario) return;
  db.run(
    `INSERT INTO notificaciones (id_usuario, mensaje, leida)
     VALUES (?, ?, ?)`,
    [idUsuario, `${titulo}: ${mensaje}`, false]
  );
}

export default class PqrsController {
  static registrarPQRS(req, res) {
    const { idCliente, tipo, descripcion } = req.body || {};

    if (!idCliente || !tipo || !descripcion) {
      return res.status(400).json({
        ok: false,
        mensaje: 'idCliente, tipo y descripcion son obligatorios'
      });
    }

    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

    db.run(
      `INSERT INTO pqrs (id_cliente, tipo, mensaje, estado, fecha_creacion)
       VALUES (?, ?, ?, 'abierto', ?)`,
      [idCliente, tipo, descripcion, fecha],
      function (err) {
        if (err) {
          console.error('Error registrarPQRS:', err);
          return res.status(500).json({ ok: false, mensaje: 'Error interno' });
        }

        const idPQRS = this.lastID;
        crearNotificacionSimple({
          idUsuario: idCliente,
          titulo: 'PQRS registrada',
          mensaje: `Tu PQRS #${idPQRS} ha sido registrada`
        });

        db.get('SELECT * FROM pqrs WHERE id = ?', [idPQRS], (err, pqrs) => {
          if (err) return res.status(500).json({ ok: false, mensaje: 'Error interno' });
          return res.status(201).json({ ok: true, pqrs });
        });
      }
    );
  }

  static obtenerPQRS(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM pqrs WHERE id = ?', [id], (err, pqrs) => {
      if (err) return res.status(500).json({ ok: false, mensaje: 'Error interno' });
      if (!pqrs) return res.status(404).json({ ok: false, mensaje: 'PQRS no encontrada' });
      return res.status(200).json({ ok: true, pqrs });
    });
  }

  static asignarArea(req, res) {
    const id = Number(req.params.id);
    const { areaResponsable } = req.body || {};

    if (!areaResponsable) {
      return res.status(400).json({ ok: false, mensaje: 'areaResponsable es obligatoria' });
    }

    db.run(
      'UPDATE pqrs SET area_responsable = ? WHERE id = ?',
      [areaResponsable, id],
      function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error interno' });
        if (this.changes === 0)
          return res.status(404).json({ ok: false, mensaje: 'PQRS no encontrada' });

        db.get('SELECT * FROM pqrs WHERE id = ?', [id], (err, pqrs) => {
          if (err) return res.status(500).json({ ok: false, mensaje: 'Error interno' });
          return res.status(200).json({ ok: true, pqrs });
        });
      }
    );
  }

  static registrarRespuesta(req, res) {
    const id = Number(req.params.id);
    const { respuesta } = req.body || {};

    if (!respuesta) {
      return res.status(400).json({ ok: false, mensaje: 'respuesta es obligatoria' });
    }

    db.run(
      'UPDATE pqrs SET respuesta = ?, estado = ? WHERE id = ?',
      [respuesta, 'respondido', id],
      function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error interno' });
        if (this.changes === 0)
          return res.status(404).json({ ok: false, mensaje: 'PQRS no encontrada' });

        db.get('SELECT * FROM pqrs WHERE id = ?', [id], (err, pqrs) => {
          if (err) return res.status(500).json({ ok: false, mensaje: 'Error interno' });
          return res.status(200).json({ ok: true, pqrs });
        });
      }
    );
  }

  static cerrarPQRS(req, res) {
    const id = Number(req.params.id);
    const { respuestaFinal } = req.body || {};

    if (!respuestaFinal) {
      return res.status(400).json({ ok: false, mensaje: 'respuestaFinal es obligatoria' });
    }

    db.run(
      'UPDATE pqrs SET respuesta = ?, estado = ? WHERE id = ?',
      [respuestaFinal, 'cerrado', id],
      function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error interno' });
        if (this.changes === 0)
          return res.status(404).json({ ok: false, mensaje: 'PQRS no encontrada' });

        db.get('SELECT * FROM pqrs WHERE id = ?', [id], (err, pqrs) => {
          if (err) return res.status(500).json({ ok: false, mensaje: 'Error interno' });

          crearNotificacionSimple({
            idUsuario: pqrs.id_cliente,
            titulo: 'PQRS cerrada',
            mensaje: `Tu PQRS #${id} ha sido cerrada`
          });

          return res.status(200).json({ ok: true, pqrs });
        });
      }
    );
  }
    static listar(req, res) {
    const idCliente = req.query.idCliente ? Number(req.query.idCliente) : null;

    let sql = `
      SELECT
        id,
        id_cliente,
        tipo,
        mensaje,
        respuesta,
        estado,
        fecha_creacion
      FROM pqrs
    `;
    const params = [];

    if (idCliente) {
      sql += ' WHERE id_cliente = ?';
      params.push(idCliente);
    }

    sql += ' ORDER BY fecha_creacion DESC';

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error listando PQRS:', err);
        return res.status(500).json({ ok: false, mensaje: 'Error interno' });
      }

      const pqrs = rows.map(row => {
        const base = row.mensaje || '';
        const asunto = base.length > 60 ? base.slice(0, 57) + '...' : base;

        return {
          id: row.id,
          tipo: row.tipo,
          estado: row.estado,
          asunto,
          descripcion: row.mensaje,
          fecha: row.fecha_creacion,
          respuesta: row.respuesta,
          // Campos que usa pqrs.html pero no existen en la tabla
          relacionadoCon: null,
          numeroReferencia: null
        };
      });

      return res.status(200).json({ ok: true, pqrs });
    });
  }

}