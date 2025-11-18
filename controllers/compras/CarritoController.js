import db from '../../config/db.js';

// Helper: arma el DTO que espera carrito.html
function armarCarritoDTO(idCarrito, callback) {
  db.get('SELECT * FROM carritos WHERE id = ?', [idCarrito], (err, carrito) => {
    if (err) return callback(err);
    if (!carrito) return callback(new Error('Carrito no encontrado'));

    const sqlTiquetes = `
      SELECT
        ci.id              AS id_item,
        ci.cantidad        AS cantidad,
        v.id               AS id_viaje,
        v.fecha_salida     AS fecha_salida,
        r.origen           AS origen,
        r.destino          AS destino,
        r.precio_base      AS precio_base
      FROM carrito_items ci
      JOIN viajes v ON ci.referencia = v.id
      JOIN rutas  r ON v.id_ruta = r.id
      WHERE ci.id_carrito = ? AND ci.tipo = 'tiquete'
    `;

    db.all(sqlTiquetes, [idCarrito], (err, rowsT = []) => {
      if (err) return callback(err);

      const tiquetesDraft = rowsT.map(row => {
        const cantidad = row.cantidad || 1;
        const precioUnit = row.precio_base || 0;
        const fechaISO = row.fecha_salida
          ? String(row.fecha_salida).replace(' ', 'T')
          : null;

        return {
          idItem: row.id_item,
          viajeId: row.id_viaje,
          origen: row.origen,
          destino: row.destino,
          fechaViaje: fechaISO,
          nombrePasajero: 'Pasajero',
          asiento: null,
          cantidad,
          precio: precioUnit * cantidad
        };
      });

      const sqlEnvios = `
        SELECT
          ci.id              AS id_item,
          ci.cantidad        AS cantidad,
          e.id               AS id_envio,
          e.numero_guia      AS numero_guia,
          e.origen           AS origen,
          e.destino          AS destino,
          e.peso             AS peso,
          e.valor_declarado  AS tarifa,
          e.estado           AS estado
        FROM carrito_items ci
        JOIN envios e ON ci.referencia = e.id
        WHERE ci.id_carrito = ? AND ci.tipo = 'envio'
      `;

      db.all(sqlEnvios, [idCarrito], (err, rowsE = []) => {
        if (err) return callback(err);

        const enviosDraft = rowsE.map(row => ({
          idItem: row.id_item,
          envioId: row.id_envio,
          numeroGuia: row.numero_guia,
          origen: row.origen,
          destino: row.destino,
          peso: row.peso,
          tarifa: row.tarifa || 0,
          estado: row.estado
        }));

        const subtotalTiquetes = tiquetesDraft.reduce((s, t) => s + (t.precio || 0), 0);
        const subtotalEnvios = enviosDraft.reduce((s, e) => s + (e.tarifa || 0), 0);
        const totalGeneral = subtotalTiquetes + subtotalEnvios;

        const carritoDTO = {
          id: carrito.id,
          idCliente: carrito.id_cliente,
          estado: carrito.estado,
          tiquetesDraft,
          enviosDraft,
          descuentoGlobal: 0,
          subtotalTiquetes,
          subtotalEnvios,
          totalGeneral
        };

        callback(null, carritoDTO);
      });
    });
  });
}

export default class CarritoController {
  // POST /api/carrito
  static crearCarrito(req, res) {
    const { idCliente } = req.body || {};
    db.run(
      'INSERT INTO carritos (id_cliente, estado) VALUES (?, ?)',
      [idCliente || null, 'activo'],
      function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        const idCarrito = this.lastID;
        const snapshot = JSON.stringify([]); // carrito vacío
        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

        db.run(
          'INSERT INTO carrito_snapshots (id_carrito, snapshot, es_actual, created_at) VALUES (?, ?, 1, ?)',
          [idCarrito, snapshot, fecha],
          function (err2) {
            if (err2) return res.status(500).json({ ok: false, mensaje: err2.message });

            armarCarritoDTO(idCarrito, (err3, carritoDTO) => {
              if (err3) return res.status(500).json({ ok: false, mensaje: err3.message });
              return res.status(201).json({ ok: true, carrito: carritoDTO });
            });
          }
        );
      }
    );
  }

  // GET /api/carrito/:id
  static obtenerCarrito(req, res) {
    const idCarrito = Number(req.params.id);
    armarCarritoDTO(idCarrito, (err, carritoDTO) => {
      if (err) {
        if (String(err.message).includes('Carrito no encontrado')) {
          return res.status(404).json({ ok: false, mensaje: 'Carrito no encontrado' });
        }
        return res.status(500).json({ ok: false, mensaje: err.message });
      }
      return res.status(200).json({ ok: true, carrito: carritoDTO });
    });
  }

  // POST /api/carrito/:id/agregar-tiquete
  static agregarTiquete(req, res) {
    const idCarrito = Number(req.params.id);
    const { viajeId, cantidad } = req.body || {};

    if (!viajeId) {
      return res.status(400).json({ ok: false, mensaje: 'viajeId es obligatorio' });
    }

    const cant = Number(cantidad) > 0 ? Number(cantidad) : 1;

    db.get('SELECT * FROM carritos WHERE id = ?', [idCarrito], (err, carrito) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!carrito) return res.status(404).json({ ok: false, mensaje: 'Carrito no encontrado' });

      db.run(
        'INSERT INTO carrito_items (id_carrito, tipo, referencia, cantidad) VALUES (?, ?, ?, ?)',
        [idCarrito, 'tiquete', viajeId, cant],
        function (err2) {
          if (err2) return res.status(500).json({ ok: false, mensaje: err2.message });

          // Cada cambio genera nuevo memento
          return CarritoController.guardarSnapshotInterno(idCarrito, (err3, carritoDTO) => {
            if (err3) return res.status(500).json({ ok: false, mensaje: err3.message });
            return res.status(200).json({ ok: true, carrito: carritoDTO });
          });
        }
      );
    });
  }

  // POST /api/carrito/:id/agregar-envio (si lo usas)
  static agregarEnvio(req, res) {
    const idCarrito = Number(req.params.id);
    const { envioId, cantidad } = req.body || {};

    if (!envioId) {
      return res.status(400).json({ ok: false, mensaje: 'envioId es obligatorio' });
    }

    const cant = Number(cantidad) > 0 ? Number(cantidad) : 1;

    db.get('SELECT * FROM carritos WHERE id = ?', [idCarrito], (err, carrito) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!carrito) return res.status(404).json({ ok: false, mensaje: 'Carrito no encontrado' });

      db.run(
        'INSERT INTO carrito_items (id_carrito, tipo, referencia, cantidad) VALUES (?, ?, ?, ?)',
        [idCarrito, 'envio', envioId, cant],
        function (err2) {
          if (err2) return res.status(500).json({ ok: false, mensaje: err2.message });

          return CarritoController.guardarSnapshotInterno(idCarrito, (err3, carritoDTO) => {
            if (err3) return res.status(500).json({ ok: false, mensaje: err3.message });
            return res.status(200).json({ ok: true, carrito: carritoDTO });
          });
        }
      );
    });
  }

  // POST /api/carrito/:id/guardar — botón 💾 del frontend
  static guardarSnapshot(req, res) {
    const idCarrito = Number(req.params.id);
    CarritoController.guardarSnapshotInterno(idCarrito, (err, carritoDTO) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      return res.status(200).json({ ok: true, carrito: carritoDTO });
    });
  }

  // Utilidad interna: crear memento y marcarlo como actual
  static guardarSnapshotInterno(idCarrito, callback) {
    db.get('SELECT * FROM carritos WHERE id = ?', [idCarrito], (err, carrito) => {
      if (err) return callback(err);
      if (!carrito) return callback(new Error('Carrito no encontrado'));

      db.all('SELECT * FROM carrito_items WHERE id_carrito = ?', [idCarrito], (err2, items) => {
        if (err2) return callback(err2);

        const snapshot = JSON.stringify(items || []);
        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Marcamos todos como no actuales
        db.run(
          'UPDATE carrito_snapshots SET es_actual = 0 WHERE id_carrito = ?',
          [idCarrito],
          function (err3) {
            if (err3) return callback(err3);

            db.run(
              'INSERT INTO carrito_snapshots (id_carrito, snapshot, es_actual, created_at) VALUES (?, ?, 1, ?)',
              [idCarrito, snapshot, fecha],
              function (err4) {
                if (err4) return callback(err4);

                armarCarritoDTO(idCarrito, callback);
              }
            );
          }
        );
      });
    });
  }

  // POST /api/carrito/:id/undo
  static deshacer(req, res) {
    const idCarrito = Number(req.params.id);

    db.all(
      'SELECT * FROM carrito_snapshots WHERE id_carrito = ? ORDER BY id ASC',
      [idCarrito],
      (err, snapshots = []) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        if (!snapshots.length) {
          return res.status(404).json({ ok: false, mensaje: 'No hay snapshots para este carrito' });
        }

        const idxActual = snapshots.findIndex(s => s.es_actual === 1);
        if (idxActual <= 0) {
          return res.status(400).json({ ok: false, mensaje: 'No hay más cambios para deshacer' });
        }

        const snapshotObjetivo = snapshots[idxActual - 1];
        const itemsSnapshot = JSON.parse(snapshotObjetivo.snapshot || '[]');

        db.run('DELETE FROM carrito_items WHERE id_carrito = ?', [idCarrito], err2 => {
          if (err2) return res.status(500).json({ ok: false, mensaje: err2.message });

          const insertNext = index => {
            if (index >= itemsSnapshot.length) {
              db.run(
                'UPDATE carrito_snapshots SET es_actual = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE id_carrito = ?',
                [snapshotObjetivo.id, idCarrito],
                err3 => {
                  if (err3) return res.status(500).json({ ok: false, mensaje: err3.message });

                  armarCarritoDTO(idCarrito, (err4, carritoDTO) => {
                    if (err4) return res.status(500).json({ ok: false, mensaje: err4.message });
                    return res.status(200).json({ ok: true, carrito: carritoDTO });
                  });
                }
              );
              return;
            }

            const it = itemsSnapshot[index];
            db.run(
              'INSERT INTO carrito_items (id_carrito, tipo, referencia, cantidad) VALUES (?, ?, ?, ?)',
              [idCarrito, it.tipo, it.referencia, it.cantidad],
              () => insertNext(index + 1)
            );
          };

          insertNext(0);
        });
      }
    );
  }

  // POST /api/carrito/:id/redo
  static rehacer(req, res) {
    const idCarrito = Number(req.params.id);

    db.all(
      'SELECT * FROM carrito_snapshots WHERE id_carrito = ? ORDER BY id ASC',
      [idCarrito],
      (err, snapshots = []) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        if (!snapshots.length) {
          return res.status(404).json({ ok: false, mensaje: 'No hay snapshots para este carrito' });
        }

        const idxActual = snapshots.findIndex(s => s.es_actual === 1);
        if (idxActual === -1 || idxActual >= snapshots.length - 1) {
          return res.status(400).json({ ok: false, mensaje: 'No hay más cambios para rehacer' });
        }

        const snapshotObjetivo = snapshots[idxActual + 1];
        const itemsSnapshot = JSON.parse(snapshotObjetivo.snapshot || '[]');

        db.run('DELETE FROM carrito_items WHERE id_carrito = ?', [idCarrito], err2 => {
          if (err2) return res.status(500).json({ ok: false, mensaje: err2.message });

          const insertNext = index => {
            if (index >= itemsSnapshot.length) {
              db.run(
                'UPDATE carrito_snapshots SET es_actual = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE id_carrito = ?',
                [snapshotObjetivo.id, idCarrito],
                err3 => {
                  if (err3) return res.status(500).json({ ok: false, mensaje: err3.message });

                  armarCarritoDTO(idCarrito, (err4, carritoDTO) => {
                    if (err4) return res.status(500).json({ ok: false, mensaje: err4.message });
                    return res.status(200).json({ ok: true, carrito: carritoDTO });
                  });
                }
              );
              return;
            }

            const it = itemsSnapshot[index];
            db.run(
              'INSERT INTO carrito_items (id_carrito, tipo, referencia, cantidad) VALUES (?, ?, ?, ?)',
              [idCarrito, it.tipo, it.referencia, it.cantidad],
              () => insertNext(index + 1)
            );
          };

          insertNext(0);
        });
      }
    );
  }
}
