import db from '../../config/db.js';

export default class TrackingEnvioController {
  static obtenerTracking(req, res) {
    // Lo que viene en la URL es el número de guía, ej: GUIA001
    const numeroGuia = req.params.id; // /api/tracking/GUIA001

    // Buscar el envío por numero_guia
    const sqlEnvio = `
      SELECT 
        e.*,
        u.nombre AS nombre_cliente
      FROM envios e
      LEFT JOIN users u ON e.id_cliente = u.id
      WHERE e.numero_guia = ?
      LIMIT 1
    `;

    db.get(sqlEnvio, [numeroGuia], (err, envioRow) => {
      if (err) {
        console.error('Error buscando envío para tracking:', err);
        return res.status(500).json({ ok: false, error: 'Error interno' });
      }

      if (!envioRow) {
        return res.status(404).json({ ok: false, error: 'Envío no encontrado' });
      }

      // Traer eventos de tracking por id_envio
      db.all(
        'SELECT * FROM tracking_envio WHERE id_envio = ? ORDER BY fecha ASC',
        [envioRow.id],
        (err, trackingRows) => {
          if (err) {
            console.error('Error buscando tracking:', err);
            return res.status(500).json({ ok: false, error: 'Error interno' });
          }

          // Mapear estados backend -> labels del front
          const mapEstado = (estado) => {
            const m = {
              'registrado': 'REGISTRADO',
              'en-bodega': 'EN_BODEGA_ORIGEN',
              'en-ruta': 'EN_TRANSITO',
              'entregado': 'ENTREGADO',
              'devuelto': 'DEVUELTO',
              'fallido': 'FALLIDO'
            };
            return m[estado] || (estado ? estado.toUpperCase() : '');
          };

          // Ubicación "actual" básica según estado
          let ubicacionActual = 'En tránsito';
          if (trackingRows.length > 0) {
            const last = trackingRows[trackingRows.length - 1];
            if (last.estado === 'en-bodega') {
              ubicacionActual = envioRow.origen;
            } else if (last.estado === 'entregado') {
              ubicacionActual = envioRow.destino;
            }
          }

          const envio = {
            numeroGuia: envioRow.numero_guia,
            estado: mapEstado(envioRow.estado),
            ubicacionActual,

            remitente: {
              nombre: envioRow.nombre_cliente || `Cliente #${envioRow.id_cliente}`,
              ciudad: envioRow.origen,
              direccion: 'No registrada'
            },
            destinatario: {
              nombre: 'Destinatario',
              ciudad: envioRow.destino,
              direccion: 'No registrada'
            },

            peso: envioRow.peso,
            tipoContenido: 'Mercancía general',
            tarifa: envioRow.valor_declarado || 0
          };

          const tracking = trackingRows.map((row) => ({
            fecha: row.fecha,
            estado: mapEstado(row.estado),
            ubicacion: '',              // no tenemos campo de ubicación
            observaciones: row.descripcion
          }));

          return res.status(200).json({ ok: true, envio, tracking });
        }
      );
    });
  }

  static registrarEvento(req, res) {
    const id = Number(req.params.id);
    const { estado, descripcion } = req.body || {};

    db.get('SELECT * FROM envios WHERE id = ?', [id], (err, envio) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!envio) return res.status(404).json({ ok: false, mensaje: 'Envio no encontrado' });

      const eventoEstado = estado || envio.estado;
      const eventoDescripcion = descripcion || 'Evento manual';

      db.run(
        'INSERT INTO tracking_envio (id_envio, estado, descripcion) VALUES (?, ?, ?)',
        [id, eventoEstado, eventoDescripcion],
        function (err) {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });

          const eventoId = this.lastID;
          db.get('SELECT * FROM tracking_envio WHERE id = ?', [eventoId], (err, evento) => {
            if (err) return res.status(500).json({ ok: false, mensaje: err.message });
            return res.status(201).json({ ok: true, evento });
          });
        }
      );
    });
  }
}