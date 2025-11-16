// controllers/atencion-cliente/PqrsController.js
import {
  crearPQRS,
  obtenerPQRS,
  asignarAreaPQRS,
  registrarRespuestaPQRS,
  cerrarPQRS,
  crearNotificacion
} from './AtencionClienteMemoryStore.js';

export default class PqrsController {
  static async registrarPQRS(req, res) {
    const {
      idCliente,
      tipo, // 'P' | 'Q' | 'R' | 'S'
      descripcion,
      canal, // 'WEB', 'PRESENCIAL', etc.
      idTiquete,
      idEnvio
    } = req.body || {};

    if (!idCliente || !tipo || !descripcion) {
      return res.status(400).json({
        ok: false,
        mensaje: 'idCliente, tipo y descripcion son obligatorios'
      });
    }

    const pqrs = crearPQRS({
      idCliente,
      tipo,
      descripcion,
      canal: canal || 'WEB',
      idTiquete: idTiquete || null,
      idEnvio: idEnvio || null
    });

    // Notificación automática al cliente
    crearNotificacion({
      idUsuario: idCliente,
      tipo: 'PQRS_REGISTRADA',
      titulo: 'PQRS registrada',
      mensaje: `Tu PQRS #${pqrs.idPQRS} ha sido registrada.`
    });

    return res.status(201).json({ ok: true, pqrs });
  }

  static async obtenerPQRS(req, res) {
    const id = Number(req.params.id);
    const pqrs = obtenerPQRS(id);
    if (!pqrs) {
      return res.status(404).json({ ok: false, mensaje: 'PQRS no encontrada' });
    }
    return res.status(200).json({ ok: true, pqrs });
  }

  static async asignarArea(req, res) {
    const id = Number(req.params.id);
    const { areaResponsable } = req.body || {};
    if (!areaResponsable) {
      return res.status(400).json({ ok: false, mensaje: 'areaResponsable es obligatoria' });
    }

    const pqrs = asignarAreaPQRS(id, areaResponsable);
    if (!pqrs) {
      return res.status(404).json({ ok: false, mensaje: 'PQRS no encontrada' });
    }

    return res.status(200).json({ ok: true, pqrs });
  }

  static async registrarRespuesta(req, res) {
    const id = Number(req.params.id);
    const { respuesta, usuarioResponsable } = req.body || {};
    if (!respuesta) {
      return res.status(400).json({ ok: false, mensaje: 'respuesta es obligatoria' });
    }

    const pqrs = registrarRespuestaPQRS(id, respuesta, usuarioResponsable || 'AGENTE');
    if (!pqrs) {
      return res.status(404).json({ ok: false, mensaje: 'PQRS no encontrada' });
    }

    return res.status(200).json({ ok: true, pqrs });
  }

  static async cerrarPQRS(req, res) {
    const id = Number(req.params.id);
    const { respuestaFinal, usuarioResponsable } = req.body || {};
    if (!respuestaFinal) {
      return res.status(400).json({ ok: false, mensaje: 'respuestaFinal es obligatoria' });
    }

    const pqrs = cerrarPQRS(id, respuestaFinal, usuarioResponsable || 'AGENTE');
    if (!pqrs) {
      return res.status(404).json({ ok: false, mensaje: 'PQRS no encontrada' });
    }

    // Notificación automática de cierre
    if (pqrs.idCliente != null) {
      crearNotificacion({
        idUsuario: pqrs.idCliente,
        tipo: 'PQRS_CERRADA',
        titulo: 'PQRS cerrada',
        mensaje: `Tu PQRS #${pqrs.idPQRS} ha sido cerrada.`
      });
    }

    return res.status(200).json({ ok: true, pqrs });
  }
}
