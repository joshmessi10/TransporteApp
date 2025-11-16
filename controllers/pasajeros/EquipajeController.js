// controllers/pasajeros/EquipajeController.js
import {
  registrarEquipaje,
  listarEquipajesPorTiquete,
  eliminarEquipaje
} from './PasajerosMemoryStore.js';

export default class EquipajeController {
  static async registrarEquipaje(req, res) {
    const idTiquete = Number(req.params.idTiquete);
    const { pesoKg, tipo, descripcion } = req.body || {};

    if (!idTiquete || pesoKg == null) {
      return res.status(400).json({
        ok: false,
        mensaje: 'idTiquete y pesoKg son obligatorios'
      });
    }

    const equipaje = registrarEquipaje({
      idTiquete,
      pesoKg,
      tipo: tipo || 'GENERAL',
      descripcion: descripcion || ''
    });

    return res.status(201).json({ ok: true, equipaje });
  }

  static async listarEquipajes(req, res) {
    const idTiquete = Number(req.params.idTiquete);
    const lista = listarEquipajesPorTiquete(idTiquete);
    return res.status(200).json({ ok: true, equipajes: lista });
  }

  static async eliminarEquipaje(req, res) {
    const idEquipaje = Number(req.params.idEquipaje);
    const ok = eliminarEquipaje(idEquipaje);
    if (!ok) {
      return res.status(404).json({ ok: false, mensaje: 'Equipaje no encontrado' });
    }
    return res.status(200).json({ ok: true });
  }
}
