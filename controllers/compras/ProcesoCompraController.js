import db from '../../config/db.js';

export default class ProcesoCompraController {
  static ejecutarCompraTiquete(req, res) {
    const { cliente, viaje, datosPago } = req.body || {};
    if (!cliente?.idCliente) return res.status(400).json({ ok: false, mensaje: 'cliente.idCliente es obligatorio' });
    if (!viaje) return res.status(400).json({ ok: false, mensaje: 'viaje es obligatorio' });

    db.serialize(() => {
      let pagoId, tiqueteId, facturaId;

      db.run('BEGIN TRANSACTION');

      db.run(
        'INSERT INTO pagos (id_cliente, monto, metodo, estado) VALUES (?, ?, ?, ?)',
        [cliente.idCliente, datosPago?.monto || 0, datosPago?.metodo || 'efectivo', 'validado'],
        function (err) {
          if (err) return rollback(err);
          pagoId = this.lastID;

          db.run(
            'INSERT INTO tiquetes (id_reserva, id_cliente, asiento, precio, estado) VALUES (?, ?, ?, ?, ?)',
            [null, cliente.idCliente, viaje.asiento || null, viaje.precio || 0, 'emitido'],
            function (err) {
              if (err) return rollback(err);
              tiqueteId = this.lastID;

              db.run(
                'INSERT INTO facturas (id_cliente, id_pago, tipo, referencia, total, estado) VALUES (?, ?, ?, ?, ?, ?)',
                [cliente.idCliente, pagoId, 'tiquete', tiqueteId, viaje.precio || 0, 'vigente'],
                function (err) {
                  if (err) return rollback(err);
                  facturaId = this.lastID;

                  db.run('COMMIT', (err) => {
                    if (err) return rollback(err);

                    db.get('SELECT * FROM tiquetes WHERE id = ?', [tiqueteId], (err, tiquete) => {
                      if (err) return rollback(err);
                      db.get('SELECT * FROM pagos WHERE id = ?', [pagoId], (err, pago) => {
                        if (err) return rollback(err);
                        db.get('SELECT * FROM facturas WHERE id = ?', [facturaId], (err, factura) => {
                          if (err) return rollback(err);
                          return res.status(200).json({ ok: true, tiquete, pago, factura });
                        });
                      });
                    });
                  });
                }
              );
            }
          );
        }
      );

      function rollback(err) {
        db.run('ROLLBACK');
        console.error(err);
        return res.status(500).json({ ok: false, mensaje: err.message });
      }
    });
  }

  static ejecutarCompraEnvio(req, res) {
    const { cliente, envioDraft, datosPago } = req.body || {};
    if (!cliente?.idCliente) return res.status(400).json({ ok: false, mensaje: 'cliente.idCliente es obligatorio' });
    if (!envioDraft?.origenSedeId || !envioDraft?.destinoSedeId) {
      return res.status(400).json({ ok: false, mensaje: 'envioDraft.origenSedeId y destinoSedeId son obligatorios' });
    }

    db.serialize(() => {
      let envioId, pagoId, facturaId;
      const guia = envioDraft.numero_guia || ('G' + Date.now());

      db.run('BEGIN TRANSACTION');

      db.run(
        `INSERT INTO envios (numero_guia, id_cliente, origen, destino, peso, valor_declarado, estado)
         VALUES (?, ?, ?, ?, ?, ?, 'registrado')`,
        [guia, cliente.idCliente, envioDraft.origen || null, envioDraft.destino || null, envioDraft.pesoKg || 0, envioDraft.valorDeclarado || 0],
        function (err) {
          if (err) return rollback(err);
          envioId = this.lastID;

          db.run(
            'INSERT INTO pagos (id_cliente, monto, metodo, estado) VALUES (?, ?, ?, ?)',
            [cliente.idCliente, datosPago?.monto || 0, datosPago?.metodo || 'efectivo', 'validado'],
            function (err) {
              if (err) return rollback(err);
              pagoId = this.lastID;

              db.run(
                'INSERT INTO facturas (id_cliente, id_pago, tipo, referencia, total, estado) VALUES (?, ?, ?, ?, ?, ?)',
                [cliente.idCliente, pagoId, 'envio', envioId, datosPago?.monto || 0, 'vigente'],
                function (err) {
                  if (err) return rollback(err);
                  facturaId = this.lastID;

                  db.run(
                    'INSERT INTO tracking_envio (id_envio, estado, descripcion) VALUES (?, ?, ?)',
                    [envioId, 'registrado', 'Envio registrado'],
                    function (err) {
                      if (err) return rollback(err);

                      db.run('COMMIT', (err) => {
                        if (err) return rollback(err);

                        db.get('SELECT * FROM envios WHERE id = ?', [envioId], (err, envio) => {
                          if (err) return rollback(err);
                          db.get('SELECT * FROM pagos WHERE id = ?', [pagoId], (err, pago) => {
                            if (err) return rollback(err);
                            db.get('SELECT * FROM facturas WHERE id = ?', [facturaId], (err, factura) => {
                              if (err) return rollback(err);
                              return res.status(200).json({ ok: true, envio, pago, factura });
                            });
                          });
                        });
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );

      function rollback(err) {
        db.run('ROLLBACK');
        console.error(err);
        return res.status(500).json({ ok: false, mensaje: err.message });
      }
    });
  }
}