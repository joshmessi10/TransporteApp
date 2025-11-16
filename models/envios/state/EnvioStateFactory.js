// models/envios/state/EnvioStateFactory.js
import EnvioRegistradoState from './EnvioRegistradoState.js';
import EnvioEnBodegaOrigenState from './EnvioEnBodegaOrigenState.js';
import EnvioEnTransitoState from './EnvioEnTransitoState.js';
import EnvioEnBodegaDestinoState from './EnvioEnBodegaDestinoState.js';
import EnvioEnRepartoState from './EnvioEnRepartoState.js';
import EnvioEntregadoState from './EnvioEntregadoState.js';
import EnvioDevueltoState from './EnvioDevueltoState.js';
import EnvioFallidoState from './EnvioFallidoState.js';

export default class EnvioStateFactory {
  create(estado) {
    switch (estado) {
      case 'REGISTRADO':
        return new EnvioRegistradoState();
      case 'EN_BODEGA_ORIGEN':
        return new EnvioEnBodegaOrigenState();
      case 'EN_TRANSITO':
        return new EnvioEnTransitoState();
      case 'EN_BODEGA_DESTINO':
        return new EnvioEnBodegaDestinoState();   // <-- FALTABA ESTE
      case 'EN_REPARTO':
        return new EnvioEnRepartoState();
      case 'ENTREGADO':
        return new EnvioEntregadoState();
      case 'DEVUELTO':
        return new EnvioDevueltoState();
      case 'FALLIDO':
        return new EnvioFallidoState();
      default:
        throw new Error(`Estado de envío no soportado: ${estado}`);
    }
  }
}
