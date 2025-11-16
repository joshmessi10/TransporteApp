// controllers/envios/EnvioController.js
import { validarYCrearEnvio } from '../../models/envios/chain/EnvioValidationPipeline.js';
import { obtenerEnvio, registrarEnvioEnStore, registrarEventoTracking } from './EnviosMemoryStore.js';

export default class EnvioController {
  static async registrarEnvio(req, res) {
    const dto = req.body || {};

    const resultado = validarYCrearEnvio(dto);

    if (!resultado.ok) {
      return res.status(400).json({
        ok: false,
        errores: resultado.errores,
        dto: resultado.dto
      });
    }

    // si el pipeline ya creó el Envio real, úsalo
    const envioCreado = resultado.envio || resultado.dto;
    const envio = registrarEnvioEnStore(envioCreado);

    // tracking inicial
    registrarEventoTracking({
      idEnvio: envio.idEnvio,
      estado: envio.estado,
      descripcion: 'Envio registrado'
    });

    return res.status(201).json({
      ok: true,
      envio,
      dtoProcesado: resultado.dto
    });
  }

  static async obtenerEnvio(req, res) {
    const id = Number(req.params.id);
    const envio = obtenerEnvio(id);

    if (!envio) {
      return res.status(404).json({ ok: false, mensaje: 'Envio no encontrado' });
    }

    return res.status(200).json({ ok: true, envio });
  }

  static async avanzarEstado(req, res) {
    const id = Number(req.params.id);
    const envio = obtenerEnvio(id);

    if (!envio) {
      return res.status(404).json({ ok: false, mensaje: 'Envio no encontrado' });
    }

    try {
      const estadoAnterior = envio.estado;
      envio.avanzar();
      registrarEventoTracking({
        idEnvio: envio.idEnvio,
        estado: envio.estado,
        descripcion: `Avance de estado desde ${estadoAnterior} a ${envio.estado}`
      });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }

    return res.status(200).json({ ok: true, envio });
  }

  static async marcarDevuelto(req, res) {
    const id = Number(req.params.id);
    const envio = obtenerEnvio(id);

    if (!envio) {
      return res.status(404).json({ ok: false, mensaje: 'Envio no encontrado' });
    }

    try {
      envio.devolver();
      registrarEventoTracking({
        idEnvio: envio.idEnvio,
        estado: envio.estado,
        descripcion: 'Envío marcado como devuelto'
      });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }

    return res.status(200).json({ ok: true, envio });
  }

  static async marcarFallido(req, res) {
    const id = Number(req.params.id);
    const envio = obtenerEnvio(id);

    if (!envio) {
      return res.status(404).json({ ok: false, mensaje: 'Envio no encontrado' });
    }

    const { motivo } = req.body || {};

    envio.marcarFallido(motivo || 'Sin motivo especificado');
    registrarEventoTracking({
      idEnvio: envio.idEnvio,
      estado: envio.estado,
      descripcion: `Envío marcado como fallido: ${motivo || 'Sin motivo'}`
    });

    return res.status(200).json({ ok: true, envio });
  }

  static async asignarSeguro(req, res) {
    const id = Number(req.params.id);
    const envio = obtenerEnvio(id);

    if (!envio) {
      return res.status(404).json({ ok: false, mensaje: 'Envio no encontrado' });
    }

    const { idSeguro } = req.body || {};
    envio.asignarSeguro(idSeguro);

    return res.status(200).json({ ok: true, envio });
  }
}
