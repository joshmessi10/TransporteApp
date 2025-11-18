import db from '../../config/db.js';

export default class SeguroEnvioController {
  static crear(req, res) {
    const datos = req.body || {};
    const { idEnvio, costo, cobertura } = datos;

    if (!idEnvio) {
      return res.status(400).json({ ok: false, mensaje: 'idEnvio es obligatorio' });
    }

    db.get('SELECT id FROM envios WHERE id = ?', [Number(idEnvio)], (err, envio) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!envio) return res.status(400).json({ ok: false, mensaje: 'Envio no existe' });

      db.run(
        'INSERT INTO seguros_envio (id_envio, costo, cobertura) VALUES (?, ?, ?)',
        [Number(idEnvio), Number(costo) || 0, cobertura || null],
        function (err) {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });

          const id = this.lastID;
          db.get('SELECT * FROM seguros_envio WHERE id = ?', [id], (err, seguro) => {
            if (err) return res.status(500).json({ ok: false, mensaje: err.message });
            return res.status(201).json({ ok: true, seguro });
          });
        }
      );
    });
  }

  static obtener(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM seguros_envio WHERE id = ?', [id], (err, seguro) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!seguro) return res.status(404).json({ ok: false, mensaje: 'Seguro no encontrado' });
      return res.status(200).json({ ok: true, seguro });
    });
  }

  static actualizar(req, res) {
    const id = Number(req.params.id);
    const datos = req.body || {};

    const campos = [];
    const valores = [];

    if (datos.costo !== undefined) {
      campos.push('costo = ?');
      valores.push(Number(datos.costo));
    }
    if (datos.cobertura !== undefined) {
      campos.push('cobertura = ?');
      valores.push(datos.cobertura);
    }

    if (!campos.length) return res.status(200).json({ ok: true, seguro: null });

    valores.push(id);
    const sql = `UPDATE seguros_envio SET ${campos.join(', ')} WHERE id = ?`;

    db.run(sql, valores, function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Seguro no encontrado' });

      db.get('SELECT * FROM seguros_envio WHERE id = ?', [id], (err, seguro) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, seguro });
      });
    });
  }
}