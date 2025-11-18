import db from '../../config/db.js';

export default class BodegaController {
  static crear(req, res) {
    const datos = req.body || {};
    db.run(
      'INSERT INTO bodegas (id_sede, capacidad_max) VALUES (?, ?)',
      [datos.id_sede || null, datos.capacidad_max || 0],
      function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        const id = this.lastID;
        db.get('SELECT * FROM bodegas WHERE id = ?', [id], (err, bodega) => {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });
          return res.status(201).json({ ok: true, bodega });
        });
      }
    );
  }

  static obtener(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM bodegas WHERE id = ?', [id], (err, bodega) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!bodega) return res.status(404).json({ ok: false, mensaje: 'Bodega no encontrada' });
      return res.status(200).json({ ok: true, bodega });
    });
  }

  static ingresoEnvio(req, res) {
    const idBodega = Number(req.params.id);
    const { idEnvio } = req.body || {};

    db.get('SELECT * FROM envios WHERE id = ?', [Number(idEnvio)], (err, envio) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!envio) return res.status(400).json({ ok: false, mensaje: 'Envio no existe' });

      db.run(
        'INSERT INTO bodega_inventario (id_bodega, id_envio, estado) VALUES (?, ?, ?)',
        [idBodega, idEnvio, 'ingreso'],
        function (err) {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });

          db.all('SELECT * FROM bodega_inventario WHERE id_bodega = ?', [idBodega], (err, inventario) => {
            if (err) return res.status(500).json({ ok: false, mensaje: err.message });
            return res.status(200).json({ ok: true, inventario });
          });
        }
      );
    });
  }

  static salidaEnvio(req, res) {
    const idBodega = Number(req.params.id);
    const { idEnvio } = req.body || {};

    db.run(
      'INSERT INTO bodega_inventario (id_bodega, id_envio, estado) VALUES (?, ?, ?)',
      [idBodega, Number(idEnvio), 'salida'],
      function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        db.all('SELECT * FROM bodega_inventario WHERE id_bodega = ?', [idBodega], (err, inventario) => {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });
          return res.status(200).json({ ok: true, inventario });
        });
      }
    );
  }

  static inventario(req, res) {
    const idBodega = Number(req.params.id);

    db.get('SELECT * FROM bodegas WHERE id = ?', [idBodega], (err, bodega) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!bodega) return res.status(404).json({ ok: false, mensaje: 'Bodega no encontrada' });

      db.all('SELECT * FROM bodega_inventario WHERE id_bodega = ?', [idBodega], (err, inventario) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, bodega, inventario });
      });
    });
  }
}