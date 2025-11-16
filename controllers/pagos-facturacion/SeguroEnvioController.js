// controllers/pagos-facturacion/SeguroEnvioController.js
import {
  crearSeguroEnvio,
  obtenerSeguroEnvio,
  actualizarSeguroEnvio
} from './PagosFacturacionMemoryStore.js';

export default class SeguroEnvioController {
  static async crear(req, res) {
    const datos = req.body || {};
    const seguro = crearSeguroEnvio(datos);
    return res.status(201).json({ ok: true, seguro });
  }

  static async obtener(req, res) {
    const id = Number(req.params.id);
    const seguro = obtenerSeguroEnvio(id);
    if (!seguro) {
      return res.status(404).json({ ok: false, mensaje: 'Seguro no encontrado' });
    }
    return res.status(200).json({ ok: true, seguro });
  }

  static async actualizar(req, res) {
    const id = Number(req.params.id);
    const datos = req.body || {};
    const seguro = actualizarSeguroEnvio(id, datos);
    if (!seguro) {
      return res.status(404).json({ ok: false, mensaje: 'Seguro no encontrado' });
    }
    return res.status(200).json({ ok: true, seguro });
  }
}
