import db from '../../config/db.js';

export default class RutaController {
  static crear(req, res) {
    const datos = req.body || {};
    const sql = `INSERT INTO rutas (origen, destino, distancia_km, precio_base, estado)
                 VALUES (?, ?, ?, ?, 'activa')`;

    db.run(sql, [
      datos.origen || null,
      datos.destino || null,
      datos.distancia_km || 0,
      datos.precio_base || 0
    ], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });

      const id = this.lastID;
      db.get('SELECT * FROM rutas WHERE id = ?', [id], (err, ruta) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(201).json({ ok: true, ruta });
      });
    });
  }

  static obtener(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM rutas WHERE id = ?', [id], (err, ruta) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!ruta) return res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });
      return res.status(200).json({ ok: true, ruta });
    });
  }

  static actualizar(req, res) {
    const id = Number(req.params.id);
    const datos = req.body || {};

    const campos = [];
    const valores = [];

    if (datos.origen !== undefined) { campos.push('origen = ?'); valores.push(datos.origen); }
    if (datos.destino !== undefined) { campos.push('destino = ?'); valores.push(datos.destino); }
    if (datos.distancia_km !== undefined) { campos.push('distancia_km = ?'); valores.push(datos.distancia_km); }
    if (datos.precio_base !== undefined) { campos.push('precio_base = ?'); valores.push(datos.precio_base); }

    if (!campos.length) return res.status(200).json({ ok: true, ruta: null });

    valores.push(id);
    const sql = `UPDATE rutas SET ${campos.join(', ')} WHERE id = ?`;

    db.run(sql, valores, function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });

      db.get('SELECT * FROM rutas WHERE id = ?', [id], (err, ruta) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, ruta });
      });
    });
  }

  static activar(req, res) {
    const id = Number(req.params.id);
    db.run("UPDATE rutas SET estado = 'activa' WHERE id = ?", [id], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });

      db.get('SELECT * FROM rutas WHERE id = ?', [id], (err, ruta) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, ruta });
      });
    });
  }

  static inactivar(req, res) {
    const id = Number(req.params.id);
    db.run("UPDATE rutas SET estado = 'inactiva' WHERE id = ?", [id], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });

      db.get('SELECT * FROM rutas WHERE id = ?', [id], (err, ruta) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, ruta });
      });
    });
  }
}