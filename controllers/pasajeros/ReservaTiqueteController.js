import db from '../../config/db.js';

export default class ReservaTiqueteController {
  static crearReserva(req, res) {
    const { idViaje, idCliente, asiento, fechaExpiracion } = req.body || {};

    if (!idViaje || !idCliente || asiento == null) {
      return res.status(400).json({ ok: false, mensaje: 'idViaje, idCliente y asiento son obligatorios' });
    }

    db.get('SELECT * FROM viajes WHERE id = ?', [Number(idViaje)], (err, viaje) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!viaje) return res.status(400).json({ ok: false, mensaje: 'Viaje no existe' });

      const fecha = fechaExpiracion
        ? new Date(fechaExpiracion).toISOString().slice(0, 19).replace('T', ' ')
        : new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

      db.run(
        'INSERT INTO reservas_tiquete (id_cliente, id_viaje, estado, fecha_reserva) VALUES (?, ?, ?, ?)',
        [Number(idCliente), Number(idViaje), 'pendiente', fecha],
        function (err) {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });

          const id = this.lastID;
          db.get('SELECT * FROM reservas_tiquete WHERE id = ?', [id], (err, reserva) => {
            if (err) return res.status(500).json({ ok: false, mensaje: err.message });
            return res.status(201).json({ ok: true, reserva });
          });
        }
      );
    });
  }

  static obtenerReserva(req, res) {
    const id = Number(req.params.id);
    db.get('SELECT * FROM reservas_tiquete WHERE id = ?', [id], (err, reserva) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!reserva) return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });
      return res.status(200).json({ ok: true, reserva });
    });
  }

  static cancelarReserva(req, res) {
    const id = Number(req.params.id);
    db.run("UPDATE reservas_tiquete SET estado = 'cancelada' WHERE id = ?", [id], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });

      db.get('SELECT * FROM reservas_tiquete WHERE id = ?', [id], (err, reserva) => {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });
        return res.status(200).json({ ok: true, reserva });
      });
    });
  }

  static confirmarReserva(req, res) {
    const id = Number(req.params.id);

    db.get('SELECT * FROM reservas_tiquete WHERE id = ?', [id], (err, reserva) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!reserva) return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });

      db.run("UPDATE reservas_tiquete SET estado = 'confirmada' WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: err.message });

        const { asiento, precio } = req.body || {};
        if (asiento === undefined) {
          db.get('SELECT * FROM reservas_tiquete WHERE id = ?', [id], (err, updated) => {
            if (err) return res.status(500).json({ ok: false, mensaje: err.message });
            return res.status(200).json({ ok: true, reserva: updated });
          });
        } else {
          db.run(
            'INSERT INTO tiquetes (id_reserva, id_cliente, asiento, precio, estado) VALUES (?, ?, ?, ?, ?)',
            [id, reserva.id_cliente, asiento, Number(precio) || 0, 'emitido'],
            function (err) {
              if (err) return res.status(500).json({ ok: false, mensaje: err.message });

              const idTiquete = this.lastID;
              db.get('SELECT * FROM tiquetes WHERE id = ?', [idTiquete], (err, tiquete) => {
                if (err) return res.status(500).json({ ok: false, mensaje: err.message });

                db.get('SELECT * FROM reservas_tiquete WHERE id = ?', [id], (err, updated) => {
                  if (err) return res.status(500).json({ ok: false, mensaje: err.message });
                  return res.status(200).json({ ok: true, reserva: updated, tiquete });
                });
              });
            }
          );
        }
      });
    });
  }
}