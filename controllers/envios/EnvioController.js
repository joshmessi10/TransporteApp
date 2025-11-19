import db from '../../config/db.js';

import { validarYCrearEnvio } from '../../models/envios/chain/EnvioValidationPipeline.js';

export default class EnvioController {
   static registrarEnvio(req, res) {
    const body = req.body || {};

    // Normalizador de ciudad (el front manda "bogota", "medellin", etc.)
    const normalizarCiudad = (valor) => {
      if (!valor) return null;
      const v = valor.toLowerCase();
      switch (v) {
        case 'bogota':
        case 'bogotá':
          return 'Bogotá';
        case 'medellin':
        case 'medellín':
          return 'Medellín';
        case 'cali':
          return 'Cali';
        case 'barranquilla':
          return 'Barranquilla';
        case 'cartagena':
          return 'Cartagena';
        default:
          return valor;
      }
    };

    // Soportar formato "viejo" (plano) y "nuevo" (envios.html)
    let numeroGuia = body.numero_guia || body.numeroGuia || null;
    let idCliente  = body.id_cliente  || body.idCliente  || null;
    let origen     = body.origen || null;
    let destino    = body.destino || null;
    let peso       = body.peso;
    let valorDeclarado = body.valor_declarado ?? body.valorDeclarado;

    // Formato nuevo: remitente/destinatario/paquete
    if (body.remitente && body.destinatario && body.paquete) {
      origen = normalizarCiudad(body.remitente.ciudad);
      destino = normalizarCiudad(body.destinatario.ciudad);
      peso = Number(body.paquete.peso) || 0;
      valorDeclarado = Number(body.paquete.valorDeclarado || 0);

      // Generar número de guía si no viene
      if (!numeroGuia) {
        const random = Math.floor(Math.random() * 900000) + 100000; // 6 dígitos
        numeroGuia = `GUIA${random}`;
      }
    }

    if (!numeroGuia) {
      return res.status(400).json({ ok: false, error: 'No se pudo generar número de guía' });
    }

    const sql = `
      INSERT INTO envios (numero_guia, id_cliente, origen, destino, peso, valor_declarado, estado)
      VALUES (?, ?, ?, ?, ?, ?, 'registrado')
    `;

    db.run(
      sql,
      [numeroGuia, idCliente, origen || null, destino || null, peso || 0, valorDeclarado || 0],
      function (err) {
        if (err) {
          console.error('Error insertando envío:', err);
          return res.status(500).json({ ok: false, error: err.message });
        }

        const idEnvio = this.lastID;

        // Crear tracking inicial (no obligatorio, pero útil para tracking.html)
        db.run(
          'INSERT INTO tracking_envio (id_envio, estado, descripcion) VALUES (?, ?, ?)',
          [idEnvio, 'registrado', 'El envío fue registrado en el sistema'],
          (trackErr) => {
            if (trackErr) {
              console.error('Error insertando tracking inicial:', trackErr);
              // No rompemos la respuesta principal
            }

            // Responder en el formato que espera envios.html
            return res.status(201).json({
              ok: true,
              envio: {
                id: idEnvio,
                numeroGuia,
                origen,
                destino,
                peso,
                valorDeclarado,
                estado: 'REGISTRADO'
              }
            });
          }
        );
      }
    );
  }

  static obtenerEnvio(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM envios WHERE id = ?', [id], (err, envio) => {
      if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
      if (!envio) return res.status(404).json({ ok: false, mensaje: 'Envio no encontrado' });
      return res.status(200).json({ ok: true, envio });
    });
  }

  static avanzarEstado(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM envios WHERE id = ?', [id], (err, envio) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!envio) return res.status(404).json({ ok: false, mensaje: 'Envio no encontrado' });

      const mapa = {
        'registrado': 'en-bodega',
        'en-bodega': 'en-ruta',
        'en-ruta': 'entregado'
      };
      const siguiente = mapa[envio.estado] || envio.estado;

      db.run('UPDATE envios SET estado = ? WHERE id = ?', [siguiente, id], function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        db.run('INSERT INTO tracking_envio (id_envio, estado, descripcion) VALUES (?, ?, ?)',
          [id, siguiente, `Avance desde ${envio.estado} a ${siguiente}`], function (err) {
            if (err) return res.status(500).json({ ok: false, mensaje: err.message });

            db.get('SELECT * FROM envios WHERE id = ?', [id], (err, actualizado) => {
              if (err) return res.status(500).json({ ok: false, mensaje: err.message });
              return res.status(200).json({ ok: true, envio: actualizado });
            });
          });
      });
    });
  }

  static devolverEstado(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM envios WHERE id = ?', [id], (err, envio) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!envio) return res.status(404).json({ ok: false, mensaje: 'Envio no encontrado' });

      db.run('UPDATE envios SET estado = ? WHERE id = ?', ['devuelto', id], function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        db.run('INSERT INTO tracking_envio (id_envio, estado, descripcion) VALUES (?, ?, ?)',
          [id, 'devuelto', 'Envio devuelto'], function (err) {
            if (err) return res.status(500).json({ ok: false, mensaje: err.message });

            db.get('SELECT * FROM envios WHERE id = ?', [id], (err, actualizado) => {
              if (err) return res.status(500).json({ ok: false, mensaje: err.message });
              return res.status(200).json({ ok: true, envio: actualizado });
            });
          });
      });
    });
  }

  static marcarFallido(req, res) {
    const id = Number(req.params.id);
    const { motivo } = req.body || {};

    db.get('SELECT * FROM envios WHERE id = ?', [id], (err, envio) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!envio) return res.status(404).json({ ok: false, mensaje: 'Envio no encontrado' });

      db.run('UPDATE envios SET estado = ? WHERE id = ?', ['fallido', id], function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        db.run('INSERT INTO tracking_envio (id_envio, estado, descripcion) VALUES (?, ?, ?)',
          [id, 'fallido', `Envio marcado como fallido: ${motivo || 'Sin motivo'}`], function (err) {
            if (err) return res.status(500).json({ ok: false, mensaje: err.message });

            db.get('SELECT * FROM envios WHERE id = ?', [id], (err, actualizado) => {
              if (err) return res.status(500).json({ ok: false, mensaje: err.message });
              return res.status(200).json({ ok: true, envio: actualizado });
            });
          });
      });
    });
  }

  static asignarSeguro(req, res) {
    const id = Number(req.params.id);
    const { idSeguro } = req.body || {};

    db.get('SELECT * FROM envios WHERE id = ?', [id], (err, envio) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!envio) return res.status(404).json({ ok: false, mensaje: 'Envio no encontrado' });

      db.run('INSERT INTO seguros_envio (id_envio, costo, cobertura) VALUES (?, ?, ?)',
        [id, 0, `Seguro ${idSeguro || ''}`], function (err) {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });

          db.get('SELECT * FROM envios WHERE id = ?', [id], (err, actualizado) => {
            if (err) return res.status(500).json({ ok: false, mensaje: err.message });
            return res.status(200).json({ ok: true, envio: actualizado });
          });
        });
    });
  }
    static listar(req, res) {
    const idCliente = req.query.idCliente ? Number(req.query.idCliente) : null;

    let sql = `
      SELECT
        id,
        numero_guia,
        id_cliente,
        origen,
        destino,
        peso,
        valor_declarado,
        estado,
        fecha_registro
      FROM envios
    `;
    const params = [];

    if (idCliente) {
      sql += ' WHERE id_cliente = ?';
      params.push(idCliente);
    }

    sql += ' ORDER BY fecha_registro DESC';

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error listando envíos:', err);
        return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
      }

      const envios = rows.map(row => ({
        id: row.id,
        numeroGuia: row.numero_guia,
        estado: (row.estado || 'registrado').toUpperCase(),
        peso: row.peso,
        tarifa: row.valor_declarado || 0,
        origen: row.origen,
        destino: row.destino,
        fechaRegistro: row.fecha_registro,
        // El front espera un objeto destinatario con al menos nombre y ciudad
        destinatario: {
          nombre: 'Destinatario',
          ciudad: row.destino
        }
      }));

      return res.status(200).json({ ok: true, envios });
    });
  }

}