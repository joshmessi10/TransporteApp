// controllers/envios/TrackingEnvioController.js
import { obtenerEnvio, obtenerTracking, registrarEventoTracking } from './EnviosMemoryStore.js';

export default class TrackingEnvioController {
  static async obtenerTracking(req, res) {
    const id = Number(req.params.id);
    const envio = obtenerEnvio(id);

    if (!envio) {
      return res.status(404).json({ ok: false, mensaje: 'Envio no encontrado' });
    }

    const tracking = obtenerTracking(id);
    return res.status(200).json({ ok: true, envio, tracking });
  }

  // opcional: registrar eventos manuales (ej. escáner en bodega)
  static async registrarEvento(req, res) {
    const id = Number(req.params.id);
    const envio = obtenerEnvio(id);

    if (!envio) {
      return res.status(404).json({ ok: false, mensaje: 'Envio no encontrado' });
    }

    const { estado, descripcion, ubicacion } = req.body || {};
    const evento = registrarEventoTracking({
      idEnvio: id,
      estado: estado || envio.estado,
      descripcion: descripcion || 'Evento manual',
      ubicacion: ubicacion || null
    });

    return res.status(201).json({ ok: true, evento });
  }
}
