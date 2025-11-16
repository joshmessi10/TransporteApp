// models/envios/state/EnvioFallidoState.js
import EstadoEnvio from './EstadoEnvio.js';

export default class EnvioFallidoState extends EstadoEnvio {
  avanzar() {
    throw new Error('Un envío FALLIDO no puede seguir avanzando');
  }

  devolver() {
    throw new Error('Un envío FALLIDO no puede ser devuelto en el flujo normal');
  }

  marcarFallido(motivo) {
    // ya está fallido; solo añadir info
    this._appendObservacion(`FALLIDO (extra): ${motivo}`);
  }
}
