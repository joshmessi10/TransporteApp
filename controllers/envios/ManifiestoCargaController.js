import db from '../../config/db.js';

export default class ManifiestoCargaController {
  static crear(req, res) {
    const datos = req.body || {};
    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

    db.run(
      'INSERT INTO manifiestos (id_conductor, id_vehiculo, fecha) VALUES (?, ?, ?)',
      [datos.id_conductor || null, datos.id_vehiculo || null, fecha],
      function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        const id = this.lastID;
        db.get('SELECT * FROM manifiestos WHERE id = ?', [id], (err, manifiesto) => {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });
          return res.status(201).json({ ok: true, manifiesto });
        });
      }
    );
  }

  static obtener(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM manifiestos WHERE id = ?', [id], (err, manifiesto) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!manifiesto) return res.status(404).json({ ok: false, mensaje: 'Manifiesto no encontrado' });
      return res.status(200).json({ ok: true, manifiesto });
    });
  }

  static asociarEnvio(req, res) {
    const id = Number(req.params.id);
    const { idEnvio } = req.body || {};

    db.get('SELECT * FROM manifiestos WHERE id = ?', [id], (err, manifiesto) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!manifiesto) return res.status(404).json({ ok: false, mensaje: 'Manifiesto no encontrado' });

      db.get('SELECT * FROM envios WHERE id = ?', [Number(idEnvio)], (err, envio) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        if (!envio) return res.status(404).json({ ok: false, mensaje: 'Envio no encontrado' });

        db.run(
          'INSERT INTO manifiestos_envios (id_manifiesto, id_envio) VALUES (?, ?)',
          [id, Number(idEnvio)],
          function (err) {
            if (err) return res.status(500).json({ ok: false, mensaje: err.message });

            db.all('SELECT * FROM manifiestos_envios WHERE id_manifiesto = ?', [id], (err, enviosAsociados) => {
              if (err) return res.status(500).json({ ok: false, mensaje: err.message });
              return res.status(200).json({ ok: true, manifiesto, enviosAsociados });
            });
          }
        );
      });
    });
  }

  static desasociarEnvio(req, res) {
    const id = Number(req.params.id);
    const { idEnvio } = req.body || {};

    db.run(
      'DELETE FROM manifiestos_envios WHERE id_manifiesto = ? AND id_envio = ?',
      [id, Number(idEnvio)],
      function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        db.all('SELECT * FROM manifiestos_envios WHERE id_manifiesto = ?', [id], (err, enviosAsociados) => {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });
          return res.status(200).json({ ok: true, enviosAsociados });
        });
      }
    );
  }
}