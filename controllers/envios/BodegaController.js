// controllers/envios/BodegaController.js
import {
  crearBodega,
  obtenerBodega,
  ingresarEnvioABodega,
  sacarEnvioDeBodega,
  obtenerInventarioBodega,
  obtenerEnvio
} from './EnviosMemoryStore.js';

export default class BodegaController {
  static async crear(req, res) {
    const datos = req.body || {};
    const bodega = crearBodega(datos);
    return res.status(201).json({ ok: true, bodega });
  }

  static async obtener(req, res) {
    const id = Number(req.params.id);
    const bodega = obtenerBodega(id);
    if (!bodega) {
      return res.status(404).json({ ok: false, mensaje: 'Bodega no encontrada' });
    }
    return res.status(200).json({ ok: true, bodega });
  }

  static async ingresoEnvio(req, res) {
    const idBodega = Number(req.params.id);
    const { idEnvio } = req.body || {};

    const envio = obtenerEnvio(Number(idEnvio));
    if (!envio) {
      return res.status(400).json({ ok: false, mensaje: 'Envio no existe' });
    }

    try {
      const bodega = ingresarEnvioABodega(idBodega, envio.idEnvio);
      return res.status(200).json({ ok: true, bodega, inventario: obtenerInventarioBodega(idBodega) });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }
  }

  static async salidaEnvio(req, res) {
    const idBodega = Number(req.params.id);
    const { idEnvio } = req.body || {};

    sacarEnvioDeBodega(idBodega, Number(idEnvio));

    return res.status(200).json({
      ok: true,
      inventario: obtenerInventarioBodega(idBodega)
    });
  }

  static async inventario(req, res) {
    const idBodega = Number(req.params.id);
    const bodega = obtenerBodega(idBodega);
    if (!bodega) {
      return res.status(404).json({ ok: false, mensaje: 'Bodega no encontrada' });
    }

    const inventario = obtenerInventarioBodega(idBodega);
    return res.status(200).json({ ok: true, bodega, inventario });
  }
}
