// controllers/organizacion/VehiculoController.js
import {
  crearVehiculo,
  obtenerVehiculo,
  actualizarVehiculo,
  cambiarEstadoVehiculo,
  actualizarKilometrajeVehiculo
} from './OrganizacionMemoryStore.js';

export default class VehiculoController {
  static async crear(req, res) {
    try {
      const datos = req.body || {};
      const vehiculo = crearVehiculo(datos);
      return res.status(201).json({ ok: true, vehiculo });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }
  }

  static async obtener(req, res) {
    const placa = req.params.placa;
    const vehiculo = obtenerVehiculo(placa);
    if (!vehiculo) {
      return res.status(404).json({ ok: false, mensaje: 'Vehículo no encontrado' });
    }
    return res.status(200).json({ ok: true, vehiculo });
  }

  static async actualizar(req, res) {
    const placa = req.params.placa;
    const datos = req.body || {};
    const vehiculo = actualizarVehiculo(placa, datos);
    if (!vehiculo) {
      return res.status(404).json({ ok: false, mensaje: 'Vehículo no encontrado' });
    }
    return res.status(200).json({ ok: true, vehiculo });
  }

  static async cambiarEstado(req, res) {
    const placa = req.params.placa;
    const { nuevoEstado } = req.body || {};

    const vehiculo = cambiarEstadoVehiculo(placa, nuevoEstado);
    if (!vehiculo) {
      return res.status(404).json({ ok: false, mensaje: 'Vehículo no encontrado' });
    }

    return res.status(200).json({ ok: true, vehiculo });
  }

  static async actualizarKilometraje(req, res) {
    const placa = req.params.placa;
    const { kilometraje } = req.body || {};

    try {
      const vehiculo = actualizarKilometrajeVehiculo(placa, Number(kilometraje));
      if (!vehiculo) {
        return res.status(404).json({ ok: false, mensaje: 'Vehículo no encontrado' });
      }
      return res.status(200).json({ ok: true, vehiculo });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }
  }
}
