// controllers/rutas-viajes/ViajeController.js
import {
  crearViaje,
  obtenerViaje,
  actualizarViaje,
  obtenerRuta
} from './RutasViajesMemoryStore.js';

export default class ViajeController {
  static async crear(req, res) {
    const datos = req.body || {};

    if (!datos.idRuta) {
      return res.status(400).json({ ok: false, mensaje: 'idRuta es obligatorio' });
    }
    const ruta = obtenerRuta(datos.idRuta);
    if (!ruta || ruta.activa === false) {
      return res.status(400).json({ ok: false, mensaje: 'Ruta inexistente o inactiva' });
    }

    const viaje = crearViaje({
      ...datos,
      estado: 'PROGRAMADO'
    });

    return res.status(201).json({ ok: true, viaje });
  }

  static async obtener(req, res) {
    const id = Number(req.params.id);
    const viaje = obtenerViaje(id);
    if (!viaje) {
      return res.status(404).json({ ok: false, mensaje: 'Viaje no encontrado' });
    }
    return res.status(200).json({ ok: true, viaje });
  }

  static async actualizar(req, res) {
    const id = Number(req.params.id);
    const datos = req.body || {};
    const viaje = actualizarViaje(id, datos);
    if (!viaje) {
      return res.status(404).json({ ok: false, mensaje: 'Viaje no encontrado' });
    }
    return res.status(200).json({ ok: true, viaje });
  }

  static async iniciar(req, res) {
    const id = Number(req.params.id);
    const viaje = obtenerViaje(id);
    if (!viaje) {
      return res.status(404).json({ ok: false, mensaje: 'Viaje no encontrado' });
    }

    try {
      viaje.iniciarViaje();
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }

    return res.status(200).json({ ok: true, viaje });
  }

  static async finalizar(req, res) {
    const id = Number(req.params.id);
    const viaje = obtenerViaje(id);
    if (!viaje) {
      return res.status(404).json({ ok: false, mensaje: 'Viaje no encontrado' });
    }

    try {
      viaje.finalizarViaje();
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }

    return res.status(200).json({ ok: true, viaje });
  }

  static async cancelar(req, res) {
    const id = Number(req.params.id);
    const viaje = obtenerViaje(id);
    if (!viaje) {
      return res.status(404).json({ ok: false, mensaje: 'Viaje no encontrado' });
    }

    const { motivo } = req.body || {};
    try {
      viaje.cancelar(motivo || 'Sin motivo');
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }

    return res.status(200).json({ ok: true, viaje });
  }
}
