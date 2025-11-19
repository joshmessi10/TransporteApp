import db from '../../config/db.js';
import { ProcesoCompraTiquete, ProcesoCompraEnvio } from '../../models/procesos-compra/index.js';
import { Viaje } from '../../models/rutas-viajes/index.js';

export default class ProcesoCompraController {
  static ejecutarCompraTiquete(req, res) {
    const { cliente, viaje, datosPago = {} } = req.body || {};
    if (!cliente?.idCliente) {
      return res.status(400).json({ ok: false, mensaje: 'cliente.idCliente es obligatorio' });
    }
    if (!viaje) {
      return res.status(400).json({ ok: false, mensaje: 'viaje es obligatorio' });
    }

    // Adaptar el DTO de viaje (que viene del front o de la BD) al modelo de dominio Viaje
    const viajeDomain = new Viaje({
      idViaje: viaje.idViaje || viaje.id || null,
      idRuta: viaje.idRuta || viaje.id_ruta || null,
      fechaHoraSalidaProgramada: viaje.fecha_salida || viaje.fechaHoraSalidaProgramada || null,
      fechaHoraLlegadaProgramada: viaje.fecha_llegada || viaje.fechaHoraLlegadaProgramada || null,
      vehiculoPlaca: viaje.vehiculoPlaca || null,
      idConductor: viaje.idConductor || null,
      // Estos campos no están en la tabla, pero los usamos a nivel de dominio
      capacidadAsientos: viaje.capacidadAsientos || 40,
      asientosOcupados: viaje.asientosOcupados || 0
    });

    // Aquí entra el Template Method para TIQUETES
    const proceso = new ProcesoCompraTiquete({ cliente, viaje: viajeDomain, datosPago });

    proceso.ejecutarCompra()
      .then(() => {
        // Valores de negocio calculados por el template
        const montoPago = proceso.pago?.monto ?? datosPago.monto ?? 0;
        const metodoPago = datosPago.metodo || 'efectivo';
        const asiento = proceso.tiquete?.numeroAsiento ?? viaje.asiento ?? null;
        const precioTiquete = proceso.tiquete?.precioTotal ?? viaje.precio ?? montoPago;

        db.serialize(() => {
          let pagoId, tiqueteId, facturaId;
          db.run('BEGIN TRANSACTION');

          db.run(
            'INSERT INTO pagos (id_cliente, monto, metodo, estado) VALUES (?, ?, ?, ?)',
            [cliente.idCliente, montoPago, metodoPago, 'validado'],
            function (err) {
              if (err) return rollback(err);
              pagoId = this.lastID;

              db.run(
                'INSERT INTO tiquetes (id_reserva, id_cliente, asiento, precio, estado) VALUES (?, ?, ?, ?, ?)',
                [null, cliente.idCliente, asiento, precioTiquete, 'emitido'],
                function (err) {
                  if (err) return rollback(err);
                  tiqueteId = this.lastID;

                  db.run(
                    'INSERT INTO facturas (id_cliente, id_pago, tipo, referencia, total, estado) VALUES (?, ?, ?, ?, ?, ?)',
                    [cliente.idCliente, pagoId, 'tiquete', tiqueteId, precioTiquete, 'vigente'],
                    function (err) {
                      if (err) return rollback(err);
                      facturaId = this.lastID;

                      db.run('COMMIT', (err) => {
                        if (err) return rollback(err);

                        db.get('SELECT * FROM tiquetes WHERE id = ?', [tiqueteId], (err, tiqueteRow) => {
                          if (err) return rollback(err);
                          db.get('SELECT * FROM pagos WHERE id = ?', [pagoId], (err, pagoRow) => {
                            if (err) return rollback(err);
                            db.get('SELECT * FROM facturas WHERE id = ?', [facturaId], (err, facturaRow) => {
                              if (err) return rollback(err);
                              return res.status(200).json({
                                ok: true,
                                tiquete: tiqueteRow,
                                pago: pagoRow,
                                factura: facturaRow
                              });
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
      })
      .catch((err) => {
        console.error(err);
        return res.status(400).json({ ok: false, mensaje: err.message });
      });
  }

  static ejecutarCompraEnvio(req, res) {
    const { cliente, envioDraft, datosPago = {} } = req.body || {};
    if (!cliente?.idCliente) {
      return res.status(400).json({ ok: false, mensaje: 'cliente.idCliente es obligatorio' });
    }
    if (!envioDraft?.origenSedeId || !envioDraft?.destinoSedeId) {
      return res.status(400).json({ ok: false, mensaje: 'envioDraft.origenSedeId y destinoSedeId son obligatorios' });
    }

    // Aquí entra el Template Method para ENVIOS
    const proceso = new ProcesoCompraEnvio({ cliente, envioDraft, datosPago });

    proceso.ejecutarCompra()
      .then(() => {
        const guia = envioDraft.numero_guia || ('G' + Date.now());
        const montoPago = proceso.pago?.monto ?? datosPago.monto ?? 0;
        const metodoPago = datosPago.metodo || 'efectivo';
        const totalFactura = proceso.factura?.total ?? montoPago;

        db.serialize(() => {
          let envioId, pagoId, facturaId;

          db.run('BEGIN TRANSACTION');

          db.run(
            `INSERT INTO envios (numero_guia, id_cliente, origen, destino, peso, valor_declarado, estado)
             VALUES (?, ?, ?, ?, ?, ?, 'registrado')`,
            [
              guia,
              cliente.idCliente,
              envioDraft.origen || null,
              envioDraft.destino || null,
              envioDraft.pesoKg || 0,
              envioDraft.valorDeclarado || 0
            ],
            function (err) {
              if (err) return rollback(err);
              envioId = this.lastID;

              db.run(
                'INSERT INTO pagos (id_cliente, monto, metodo, estado) VALUES (?, ?, ?, ?)',
                [cliente.idCliente, montoPago, metodoPago, 'validado'],
                function (err) {
                  if (err) return rollback(err);
                  pagoId = this.lastID;

                  db.run(
                    'INSERT INTO facturas (id_cliente, id_pago, tipo, referencia, total, estado) VALUES (?, ?, ?, ?, ?, ?)',
                    [cliente.idCliente, pagoId, 'envio', envioId, totalFactura, 'vigente'],
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

                            db.get('SELECT * FROM envios WHERE id = ?', [envioId], (err, envioRow) => {
                              if (err) return rollback(err);
                              db.get('SELECT * FROM pagos WHERE id = ?', [pagoId], (err, pagoRow) => {
                                if (err) return rollback(err);
                                db.get('SELECT * FROM facturas WHERE id = ?', [facturaId], (err, facturaRow) => {
                                  if (err) return rollback(err);
                                  return res.status(200).json({
                                    ok: true,
                                    envio: envioRow,
                                    pago: pagoRow,
                                    factura: facturaRow
                                  });
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
      })
      .catch((err) => {
        console.error(err);
        return res.status(400).json({ ok: false, mensaje: err.message });
      });
  }
}
