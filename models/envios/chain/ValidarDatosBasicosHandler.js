// models/envios/chain/ValidarDatosBasicosHandler.js
import EnvioValidationHandler from './EnvioValidationHandler.js';

export default class ValidarDatosBasicosHandler extends EnvioValidationHandler {
  doHandle(context) {
    const { dto, errores } = context;

    if (!dto.idRemitente) {
      errores.push('El remitente es obligatorio');
    }
    if (!dto.idDestinatario) {
      errores.push('El destinatario es obligatorio');
    }
    if (!dto.origenSedeId) {
      errores.push('La sede de origen es obligatoria');
    }
    if (!dto.destinoSedeId) {
      errores.push('La sede de destino es obligatoria');
    }
    if (dto.origenSedeId && dto.destinoSedeId &&
        dto.origenSedeId === dto.destinoSedeId) {
      errores.push('Origen y destino no pueden ser la misma sede');
    }

    return errores.length === 0;
  }
}
