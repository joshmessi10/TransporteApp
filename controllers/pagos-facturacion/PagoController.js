import db from '../../config/db.js';

export default class PagoController {
  static registrarPago(req, res) {
    const datos = req.body || {};
    const {
      idReferencia,
      tipoReferencia,
      monto,
      moneda,
      metodoPago,
      idCliente
    } = datos;

    if (!idReferencia || !tipoReferencia || monto == null) {
      return res.status(400).json({
        ok: false,
        mensaje: 'idReferencia, tipoReferencia y monto son obligatorios'
      });
    }

    let clienteId = idCliente || null;

    const deducirCliente = (callback) => {
      if (clienteId) return callback();

      const tipo = tipoReferencia.toLowerCase();
      const refId = Number(idReferencia);

      if (tipo === 'tiquete') {
        db.get('SELECT id_cliente FROM tiquetes WHERE id = ?', [refId], (err, row) => {
          if (row) clienteId = row.id_cliente;
          callback();
        });
      } else if (tipo === 'envio') {
        db.get('SELECT id_cliente FROM envios WHERE id = ?', [refId], (err, row) => {
          if (row) clienteId = row.id_cliente;
          callback();
        });
      } else {
        callback();
      }
    };

    deducirCliente(() => {
      if (!clienteId) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No se pudo determinar idCliente (inclúyelo en la petición si aplica)'
        });
      }

      const metodo = metodoPago || (moneda === 'COP' ? 'efectivo' : 'tarjeta');

      db.run(
        'INSERT INTO pagos (id_cliente, monto, metodo, estado) VALUES (?, ?, ?, ?)',
        [clienteId, monto, metodo, 'pendiente'],
        function (err) {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });

          const id = this.lastID;
          db.get('SELECT * FROM pagos WHERE id = ?', [id], (err, pago) => {
            if (err) return res.status(500).json({ ok: false, mensaje: err.message });
            return res.status(201).json({ ok: true, pago });
          });
        }
      );
    });
  }

  static obtenerPago(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM pagos WHERE id = ?', [id], (err, pago) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!pago) return res.status(404).json({ ok: false, mensaje: 'Pago no encontrado' });
      return res.status(200).json({ ok: true, pago });
    });
  }

  static aprobarPago(req, res) {
    const id = Number(req.params.id);

    db.get('SELECT * FROM pagos WHERE id = ?', [id], (err, pago) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!pago) return res.status(404).json({ ok: false, mensaje: 'Pago no encontrado' });

      db.run('UPDATE pagos SET estado = ? WHERE id = ?', ['validado', id], function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        db.get('SELECT * FROM pagos WHERE id = ?', [id], (err, actualizado) => {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });
          return res.status(200).json({ ok: true, pago: actualizado });
        });
      });
    });
  }

  static rechazarPago(req, res) {
    const id = Number(req.params.id);
    const { motivo } = req.body || {};

    db.get('SELECT * FROM pagos WHERE id = ?', [id], (err, pago) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!pago) return res.status(404).json({ ok: false, mensaje: 'Pago no encontrado' });

      db.run('UPDATE pagos SET estado = ? WHERE id = ?', ['rechazado', id], function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        db.get('SELECT * FROM pagos WHERE id = ?', [id], (err, actualizado) => {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });
          actualizado.motivoRechazo = motivo || null;
          return res.status(200).json({ ok: true, pago: actualizado });
        });
      });
    });
  }
}