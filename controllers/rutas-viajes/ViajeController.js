import db from '../../config/db.js';

export default class ViajeController {
  static crear(req, res) {
    const datos = req.body || {};
    if (!datos.idRuta) {
      return res.status(400).json({ ok: false, mensaje: 'idRuta es obligatorio' });
    }

    db.get('SELECT * FROM rutas WHERE id = ? AND estado = ?', [Number(datos.idRuta), 'activa'], (err, ruta) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!ruta) return res.status(400).json({ ok: false, mensaje: 'Ruta inexistente o inactiva' });

      const sql = `INSERT INTO viajes (id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada, estado)
                   VALUES (?, ?, ?, ?, ?, ?)`;

      db.run(sql, [
        Number(datos.idRuta),
        datos.idVehiculo || null,
        datos.idConductor || null,
        datos.fecha_salida || null,
        datos.fecha_llegada || null,
        datos.estado || 'programado'
      ], function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        const id = this.lastID;
        db.get('SELECT * FROM viajes WHERE id = ?', [id], (err, viaje) => {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });
          return res.status(201).json({ ok: true, viaje });
        });
      });
    });
  }

  static obtener(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM viajes WHERE id = ?', [id], (err, viaje) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!viaje) return res.status(404).json({ ok: false, mensaje: 'Viaje no encontrado' });
      return res.status(200).json({ ok: true, viaje });
    });
  }

  static actualizar(req, res) {
    const id = Number(req.params.id);
    const datos = req.body || {};

    const campos = [];
    const valores = [];

    if (datos.id_ruta !== undefined) { campos.push('id_ruta = ?'); valores.push(datos.id_ruta); }
    if (datos.id_vehiculo !== undefined) { campos.push('id_vehiculo = ?'); valores.push(datos.id_vehiculo); }
    if (datos.id_conductor !== undefined) { campos.push('id_conductor = ?'); valores.push(datos.id_conductor); }
    if (datos.fecha_salida !== undefined) { campos.push('fecha_salida = ?'); valores.push(datos.fecha_salida || null); }
    if (datos.fecha_llegada !== undefined) { campos.push('fecha_llegada = ?'); valores.push(datos.fecha_llegada || null); }
    if (datos.estado !== undefined) { campos.push('estado = ?'); valores.push(datos.estado); }

    if (!campos.length) return res.status(200).json({ ok: true, viaje: null });

    valores.push(id);
    const sql = `UPDATE viajes SET ${campos.join(', ')} WHERE id = ?`;

    db.run(sql, valores, function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Viaje no encontrado' });

      db.get('SELECT * FROM viajes WHERE id = ?', [id], (err, viaje) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, viaje });
      });
    });
  }

  static iniciar(req, res) {
    const id = Number(req.params.id);
    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

    db.get('SELECT * FROM viajes WHERE id = ?', [id], (err, viaje) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!viaje) return res.status(404).json({ ok: false, mensaje: 'Viaje no encontrado' });

      db.run("UPDATE viajes SET estado = 'en-curso', fecha_salida = ? WHERE id = ?", [fecha, id], function (err) {
        if (err) return res.status(400).json({ ok: false, mensaje: err.message });

        db.get('SELECT * FROM viajes WHERE id = ?', [id], (err, actualizado) => {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });
          return res.status(200).json({ ok: true, viaje: actualizado });
        });
      });
    });
  }

  static finalizar(req, res) {
    const id = Number(req.params.id);
    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

    db.get('SELECT * FROM viajes WHERE id = ?', [id], (err, viaje) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!viaje) return res.status(404).json({ ok: false, mensaje: 'Viaje no encontrado' });

      db.run("UPDATE viajes SET estado = 'finalizado', fecha_llegada = ? WHERE id = ?", [fecha, id], function (err) {
        if (err) return res.status(400).json({ ok: false, mensaje: err.message });

        db.get('SELECT * FROM viajes WHERE id = ?', [id], (err, actualizado) => {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });
          return res.status(200).json({ ok: true, viaje: actualizado });
        });
      });
    });
  }

  static cancelar(req, res) {
    const id = Number(req.params.id);
    const { motivo } = req.body || {};

    db.get('SELECT * FROM viajes WHERE id = ?', [id], (err, viaje) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!viaje) return res.status(404).json({ ok: false, mensaje: 'Viaje no encontrado' });

      db.run("UPDATE viajes SET estado = 'cancelado' WHERE id = ?", [id], function (err) {
        if (err) return res.status(400).json({ ok: false, mensaje: err.message });

        db.get('SELECT * FROM viajes WHERE id = ?', [id], (err, actualizado) => {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });
          return res.status(200).json({ ok: true, viaje: actualizado, motivo: motivo || null });
        });
      });
    });
  }
  static listar(req, res) {
  const { origen, destino, fecha } = req.query || {};

  // Normalizar valores que vienen del front (bogota, medellin, etc.)
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
        return valor; // por si en el futuro agregas más ciudades
    }
  };

  const origenFiltro = normalizarCiudad(origen);
  const destinoFiltro = normalizarCiudad(destino);

  let sql = `
    SELECT
      v.id AS id_viaje,
      v.fecha_salida,
      v.fecha_llegada,
      v.estado,
      r.id AS id_ruta,
      r.origen,
      r.destino,
      r.distancia_km,
      r.precio_base,
      ve.id AS id_vehiculo,
      ve.placa,
      ve.tipo,
      ve.capacidad,
      c.id AS id_conductor,
      c.nombre AS nombre_conductor,
      COALESCE(used.total_tiquetes, 0) AS total_tiquetes
    FROM viajes v
    JOIN rutas r ON v.id_ruta = r.id
    LEFT JOIN vehiculos ve ON v.id_vehiculo = ve.id
    LEFT JOIN conductores c ON v.id_conductor = c.id
    LEFT JOIN (
      SELECT rt.id_viaje, COUNT(t.id) AS total_tiquetes
      FROM reservas_tiquete rt
      LEFT JOIN tiquetes t ON t.id_reserva = rt.id
      GROUP BY rt.id_viaje
    ) used ON used.id_viaje = v.id
    WHERE 1 = 1
  `;

  const params = [];

  if (origenFiltro) {
    sql += ' AND r.origen = ?';
    params.push(origenFiltro);
  }

  if (destinoFiltro) {
    sql += ' AND r.destino = ?';
    params.push(destinoFiltro);
  }

  if (fecha) {
    // el front envía 'YYYY-MM-DD' desde <input type="date">
    sql += ' AND DATE(v.fecha_salida) = ?';
    params.push(fecha);
  }

  sql += ' ORDER BY v.fecha_salida ASC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error listando viajes:', err);
      return res.status(500).json({ ok: false, mensaje: 'Error interno' });
    }

    const viajes = rows.map(row => {
      const vendidos = row.total_tiquetes || 0;
      const capacidad = row.capacidad || 0;

      return {
        id: row.id_viaje,
        fechaSalida: row.fecha_salida ? row.fecha_salida.replace(' ', 'T') : null,
        precio: row.precio_base,
        asientosDisponibles: Math.max(capacidad - vendidos, 0),
        ruta: {
          id: row.id_ruta,
          origen: row.origen,
          destino: row.destino,
          distanciaKm: row.distancia_km
        },
        vehiculo: {
          id: row.id_vehiculo,
          placa: row.placa,
          tipo: row.tipo,
          capacidad: row.capacidad
        },
        conductor: {
          id: row.id_conductor,
          nombre: row.nombre_conductor
        }
      };
    });

    return res.status(200).json({ ok: true, viajes });
  });
}


}