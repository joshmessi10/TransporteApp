import db from '../../config/db.js';

export default class FacturaController {
  static crearFactura(req, res) {
    const body = req.body || {};
    const { idCliente, items } = body;

    if (!idCliente) {
      return res.status(400).json({ ok: false, mensaje: 'idCliente es obligatorio' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'Se requiere al menos un item de factura' });
    }

    const total = items.reduce((s, it) => {
      const cantidad = Number(it.cantidad || 1);
      const precio = Number(it.precioUnitario || it.precio || 0);
      return s + cantidad * precio;
    }, 0.0);

    db.run(
      `INSERT INTO facturas (id_cliente, id_pago, tipo, referencia, total, estado)
       VALUES (?, NULL, 'tiquete', NULL, ?, 'vigente')`,
      [idCliente, total],
      function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        const id = this.lastID;
        db.get('SELECT * FROM facturas WHERE id = ?', [id], (err, factura) => {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });
          return res.status(201).json({
            ok: true,
            factura,
            aviso: 'Items calculados pero no almacenados individualmente (sin tabla factura_items)'
          });
        });
      }
    );
  }

  static obtenerFactura(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM facturas WHERE id = ?', [id], (err, factura) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!factura) return res.status(404).json({ ok: false, mensaje: 'Factura no encontrada' });
      return res.status(200).json({ ok: true, factura });
    });
  }

  static facturasPorCliente(req, res) {
    const idCliente = Number(req.params.idCliente);
    db.all('SELECT * FROM facturas WHERE id_cliente = ? ORDER BY id DESC', [idCliente], (err, facturas) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      return res.status(200).json({ ok: true, facturas });
    });
  }

  static anularFactura(req, res) {
    const id = Number(req.params.id);
    const { motivo } = req.body || {};

    db.run('UPDATE facturas SET estado = ? WHERE id = ?', ['anulada', id], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Factura no encontrada' });

      db.get('SELECT * FROM facturas WHERE id = ?', [id], (err, factura) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, factura, motivo: motivo || null });
      });
    });
  }
}