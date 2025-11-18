import db from '../../config/db.js';

export default class EquipajeController {
  static registrarEquipaje(req, res) {
    const idTiquete = Number(req.params.idTiquete);
    const { pesoKg, tipo, descripcion } = req.body || {};

    if (!idTiquete || pesoKg == null) {
      return res.status(400).json({ ok: false, mensaje: 'idTiquete y pesoKg son obligatorios' });
    }

    db.get('SELECT * FROM tiquetes WHERE id = ?', [idTiquete], (err, tiquete) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (!tiquete) return res.status(400).json({ ok: false, mensaje: 'Tiquete no existe' });

      db.run(
        'INSERT INTO equipaje (id_tiquete, peso, descripcion) VALUES (?, ?, ?)',
        [idTiquete, Number(pesoKg), descripcion || null],
        function (err) {
          if (err) return res.status(500).json({ ok: false, mensaje: err.message });

          const id = this.lastID;
          db.get('SELECT * FROM equipaje WHERE id = ?', [id], (err, equipaje) => {
            if (err) return res.status(500).json({ ok: false, mensaje: err.message });
            return res.status(201).json({ ok: true, equipaje });
          });
        }
      );
    });
  }

  static listarEquipajes(req, res) {
    const idTiquete = Number(req.params.idTiquete);
    db.all('SELECT * FROM equipaje WHERE id_tiquete = ?', [idTiquete], (err, equipajes) => {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      return res.status(200).json({ ok: true, equipajes });
    });
  }

  static eliminarEquipaje(req, res) {
    const idEquipaje = Number(req.params.idEquipaje);
    db.run('DELETE FROM equipaje WHERE id = ?', [idEquipaje], function (err) {
      if (err) return res.status(500).json({ ok: false, mensaje: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Equipaje no encontrado' });
      return res.status(200).json({ ok: true });
    });
  }
}