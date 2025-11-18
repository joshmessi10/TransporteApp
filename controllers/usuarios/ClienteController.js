import db from '../../config/db.js';

export default class ClienteController {
  static registrarCliente(req, res) {
    const { nombre, email, password } = req.body || {};
    const sql = `INSERT INTO users (nombre, email, password, rol, estado)
                 VALUES (?, ?, ?, 'cliente', 'activo')`;

    db.run(sql, [nombre || null, email, password || null], function (err) {
      if (err) return res.status(400).json({ ok: false, mensaje: err.message });

      const id = this.lastID;
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, cliente) => {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
        return res.status(201).json({ ok: true, cliente });
      });
    });
  }

  static obtenerCliente(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM users WHERE id = ? AND rol = ?', [id, 'cliente'], (err, cliente) => {
      if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
      if (!cliente) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
      return res.status(200).json({ ok: true, cliente });
    });
  }

  static actualizarCliente(req, res) {
    const id = Number(req.params.id);
    const datos = req.body || {};

    const campos = [];
    const valores = [];

    if (datos.nombre !== undefined) { campos.push('nombre = ?'); valores.push(datos.nombre); }
    if (datos.email !== undefined) { campos.push('email = ?'); valores.push(datos.email); }
    if (datos.password !== undefined) { campos.push('password = ?'); valores.push(datos.password); }

    if (!campos.length) return res.status(200).json({ ok: true, cliente: null });

    valores.push(id);
    const sql = `UPDATE users SET ${campos.join(', ')} WHERE id = ? AND rol = 'cliente'`;

    db.run(sql, valores, function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });

      db.get('SELECT * FROM users WHERE id = ?', [id], (err, cliente) => {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
        return res.status(200).json({ ok: true, cliente });
      });
    });
  }

  static actualizarDatosContacto(req, res) {
    const id = Number(req.params.id);
    const { telefono, direccion, ciudad, pais } = req.body || {};

    const campos = [];
    const valores = [];

    if (telefono !== undefined) { campos.push('telefono = ?'); valores.push(telefono); }
    if (direccion !== undefined) { campos.push('direccion = ?'); valores.push(direccion); }
    if (ciudad !== undefined) { campos.push('ciudad = ?'); valores.push(ciudad); }
    if (pais !== undefined) { campos.push('pais = ?'); valores.push(pais); }

    if (!campos.length) return res.status(200).json({ ok: true, cliente: null });

    valores.push(id);
    const sql = `UPDATE users SET ${campos.join(', ')} WHERE id = ? AND rol = 'cliente'`;

    db.run(sql, valores, function (err) {
      if (err) return res.status(400).json({ ok: false, mensaje: 'Error actualizando datos de contacto: ' + err.message });

      db.get('SELECT * FROM users WHERE id = ?', [id], (err, cliente) => {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
        return res.status(200).json({ ok: true, cliente });
      });
    });
  }

  static actualizarDatosFacturacion(req, res) {
    const id = Number(req.params.id);
    const { nit, razonSocial, direccionFacturacion, ciudadFacturacion, paisFacturacion } = req.body || {};

    const campos = [];
    const valores = [];

    if (nit !== undefined) { campos.push('nit = ?'); valores.push(nit); }
    if (razonSocial !== undefined) { campos.push('razonSocial = ?'); valores.push(razonSocial); }
    if (direccionFacturacion !== undefined) { campos.push('direccionFacturacion = ?'); valores.push(direccionFacturacion); }
    if (ciudadFacturacion !== undefined) { campos.push('ciudadFacturacion = ?'); valores.push(ciudadFacturacion); }
    if (paisFacturacion !== undefined) { campos.push('paisFacturacion = ?'); valores.push(paisFacturacion); }

    if (!campos.length) return res.status(200).json({ ok: true, cliente: null });

    valores.push(id);
    const sql = `UPDATE users SET ${campos.join(', ')} WHERE id = ? AND rol = 'cliente'`;

    db.run(sql, valores, function (err) {
      if (err) return res.status(400).json({ ok: false, mensaje: 'Error actualizando facturación: ' + err.message });

      db.get('SELECT * FROM users WHERE id = ?', [id], (err, cliente) => {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
        return res.status(200).json({ ok: true, cliente });
      });
    });
  }

  static bloquearCliente(req, res) {
    const id = Number(req.params.id);
    db.run("UPDATE users SET estado = 'bloqueado' WHERE id = ? AND rol = 'cliente'", [id], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });

      db.get('SELECT * FROM users WHERE id = ?', [id], (err, cliente) => {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
        return res.status(200).json({ ok: true, cliente });
      });
    });
  }

  static desbloquearCliente(req, res) {
    const id = Number(req.params.id);
    db.run("UPDATE users SET estado = 'activo' WHERE id = ? AND rol = 'cliente'", [id], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });

      db.get('SELECT * FROM users WHERE id = ?', [id], (err, cliente) => {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
        return res.status(200).json({ ok: true, cliente });
      });
    });
  }
}