// controllers/envios/ManifiestoCargaController.js
import {
  crearManifiesto,
  obtenerManifiesto,
  asociarEnvioAManifiesto,
  desasociarEnvioDeManifiesto
} from './EnviosMemoryStore.js';

export default class ManifiestoCargaController {
  static async crear(req, res) {
    const datos = req.body || {};
    const mani = crearManifiesto(datos);
    return res.status(201).json({ ok: true, manifiesto: mani });
  }

  static async obtener(req, res) {
    const id = Number(req.params.id);
    const mani = obtenerManifiesto(id);
    if (!mani) {
      return res.status(404).json({ ok: false, mensaje: 'Manifiesto no encontrado' });
    }
    return res.status(200).json({ ok: true, manifiesto: mani });
  }

  static async asociarEnvio(req, res) {
    const id = Number(req.params.id);
    const { idEnvio } = req.body || {};

    try {
      const mani = asociarEnvioAManifiesto(id, Number(idEnvio));
      return res.status(200).json({ ok: true, manifiesto: mani });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }
  }

  static async desasociarEnvio(req, res) {
    const id = Number(req.params.id);
    const { idEnvio } = req.body || {};

    const mani = desasociarEnvioDeManifiesto(id, Number(idEnvio));
    if (!mani) {
      return res.status(404).json({ ok: false, mensaje: 'Manifiesto no encontrado' });
    }
    return res.status(200).json({ ok: true, manifiesto: mani });
  }
}
