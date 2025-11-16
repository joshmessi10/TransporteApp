// controllers/organizacion/MantenimientoController.js
import {
  crearMantenimiento,
  obtenerMantenimiento,
  actualizarMantenimiento,
  obtenerVehiculo
} from './OrganizacionMemoryStore.js';

export default class MantenimientoController {
  static async programar(req, res) {
    const datos = req.body || {};
    const { vehiculoPlaca } = datos;

    if (!vehiculoPlaca) {
      return res.status(400).json({ ok: false, mensaje: 'vehiculoPlaca es obligatorio' });
    }

    const vehiculo = obtenerVehiculo(vehiculoPlaca);
    if (!vehiculo) {
      return res.status(400).json({ ok: false, mensaje: 'Vehículo no existe' });
    }

    const mant = crearMantenimiento({
      ...datos,
      estado: 'PROGRAMADO'
    });

    return res.status(201).json({ ok: true, mantenimiento: mant });
  }

  static async obtener(req, res) {
    const id = Number(req.params.id);
    const mant = obtenerMantenimiento(id);
    if (!mant) {
      return res.status(404).json({ ok: false, mensaje: 'Mantenimiento no encontrado' });
    }
    return res.status(200).json({ ok: true, mantenimiento: mant });
  }

  static async iniciar(req, res) {
    const id = Number(req.params.id);
    const mant = obtenerMantenimiento(id);
    if (!mant) {
      return res.status(404).json({ ok: false, mensaje: 'Mantenimiento no encontrado' });
    }

    // usar método de dominio
    mant.iniciar();
    actualizarMantenimiento(id, mant);

    return res.status(200).json({ ok: true, mantenimiento: mant });
  }

  static async finalizar(req, res) {
    const id = Number(req.params.id);
    const mant = obtenerMantenimiento(id);
    if (!mant) {
      return res.status(404).json({ ok: false, mensaje: 'Mantenimiento no encontrado' });
    }

    const { costoReal } = req.body || {};
    mant.completar(Number(costoReal) || 0, new Date());
    actualizarMantenimiento(id, mant);

    return res.status(200).json({ ok: true, mantenimiento: mant });
  }
}
