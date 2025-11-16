// controllers/compras/CarritoController.js
import {
  crearCarrito,
  obtenerCarrito,
  agregarTiqueteACarrito,
  agregarEnvioACarrito,
  snapshotCarrito,
  undoCarrito,
  redoCarrito,
  listarSnapshotsCarrito
} from './ComprasMemoryStore.js';

export default class CarritoController {
  static async crearCarrito(req, res) {
    const { idCliente } = req.body || {};
    const carrito = crearCarrito({ idCliente: idCliente || null });

    const snapshots = listarSnapshotsCarrito(carrito.idCarrito);

    return res.status(201).json({ ok: true, carrito, snapshots });
  }

  static async obtenerCarrito(req, res) {
    const idCarrito = Number(req.params.id);
    const carrito = obtenerCarrito(idCarrito);
    if (!carrito) {
      return res.status(404).json({ ok: false, mensaje: 'Carrito no encontrado' });
    }

    const snapshots = listarSnapshotsCarrito(idCarrito);
    return res.status(200).json({ ok: true, carrito, snapshots });
  }

  static async agregarTiquete(req, res) {
    const idCarrito = Number(req.params.id);
    const { viajeId, asiento, precio } = req.body || {};

    if (!viajeId || asiento == null) {
      return res.status(400).json({
        ok: false,
        mensaje: 'viajeId y asiento son obligatorios'
      });
    }

    try {
      const carrito = agregarTiqueteACarrito(idCarrito, {
        viajeId,
        asiento,
        precio: precio || 0
      });

      if (!carrito) {
        return res.status(404).json({ ok: false, mensaje: 'Carrito no encontrado' });
      }

      return res.status(200).json({ ok: true, carrito });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }
  }

  static async agregarEnvio(req, res) {
    const idCarrito = Number(req.params.id);
    const {
      origenSedeId,
      destinoSedeId,
      pesoKg,
      valorDeclarado,
      tipoServicio,
      precio
    } = req.body || {};

    if (!origenSedeId || !destinoSedeId || pesoKg == null) {
      return res.status(400).json({
        ok: false,
        mensaje: 'origenSedeId, destinoSedeId y pesoKg son obligatorios'
      });
    }

    const dto = {
      origenSedeId,
      destinoSedeId,
      pesoKg,
      valorDeclarado: valorDeclarado || 0,
      tipoServicio: tipoServicio || 'ESTANDAR'
    };

    try {
      const carrito = agregarEnvioACarrito(idCarrito, {
        dto,
        precio: precio || 0
      });

      if (!carrito) {
        return res.status(404).json({ ok: false, mensaje: 'Carrito no encontrado' });
      }

      return res.status(200).json({ ok: true, carrito });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }
  }

  static async guardarSnapshot(req, res) {
    const idCarrito = Number(req.params.id);
    try {
      const carrito = snapshotCarrito(idCarrito);
      if (!carrito) {
        return res.status(404).json({ ok: false, mensaje: 'Carrito no encontrado' });
      }
      const snapshots = listarSnapshotsCarrito(idCarrito);
      return res.status(200).json({ ok: true, carrito, snapshots });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }
  }

  static async deshacer(req, res) {
    const idCarrito = Number(req.params.id);
    try {
      const carrito = undoCarrito(idCarrito);
      if (!carrito) {
        return res.status(404).json({ ok: false, mensaje: 'Carrito no encontrado' });
      }
      const snapshots = listarSnapshotsCarrito(idCarrito);
      return res.status(200).json({ ok: true, carrito, snapshots });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }
  }

  static async rehacer(req, res) {
    const idCarrito = Number(req.params.id);
    try {
      const carrito = redoCarrito(idCarrito);
      if (!carrito) {
        return res.status(404).json({ ok: false, mensaje: 'Carrito no encontrado' });
      }
      const snapshots = listarSnapshotsCarrito(idCarrito);
      return res.status(200).json({ ok: true, carrito, snapshots });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }
  }
}
