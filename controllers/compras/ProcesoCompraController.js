// controllers/compras/ProcesoCompraController.js
import {
  ProcesoCompraTiquete,
  ProcesoCompraEnvio
} from '../../models/procesos-compra/index.js';

export default class ProcesoCompraController {
  // Compra de tiquete usando Template Method
  static async comprarTiquete(req, res) {
    const { cliente, viaje, datosPago } = req.body || {};

    if (!cliente || !cliente.idCliente) {
      return res.status(400).json({ ok: false, mensaje: 'cliente.idCliente es obligatorio' });
    }
    if (!viaje) {
      return res.status(400).json({ ok: false, mensaje: 'viaje es obligatorio' });
    }

    try {
      const proceso = new ProcesoCompraTiquete({
        cliente,
        viaje,
        datosPago: datosPago || { metodo: 'EFECTIVO' }
      });

      await proceso.ejecutarCompra(); // Template Method

      return res.status(200).json({
        ok: true,
        tiquete: proceso.tiquete,
        pago: proceso.pago,
        factura: proceso.factura
      });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }
  }

  // Compra de envío usando Template Method
  static async comprarEnvio(req, res) {
    const { cliente, envioDraft, datosPago } = req.body || {};

    if (!cliente || !cliente.idCliente) {
      return res.status(400).json({ ok: false, mensaje: 'cliente.idCliente es obligatorio' });
    }
    if (!envioDraft || !envioDraft.origenSedeId || !envioDraft.destinoSedeId) {
      return res.status(400).json({
        ok: false,
        mensaje: 'envioDraft.origenSedeId y destinoSedeId son obligatorios'
      });
    }

    try {
      const proceso = new ProcesoCompraEnvio({
        cliente,
        envioDraft,
        datosPago: datosPago || { metodo: 'EFECTIVO' }
      });

      await proceso.ejecutarCompra(); // Template Method

      return res.status(200).json({
        ok: true,
        envio: proceso.envio,
        pago: proceso.pago,
        factura: proceso.factura
      });
    } catch (e) {
      return res.status(400).json({ ok: false, mensaje: e.message });
    }
  }
}
