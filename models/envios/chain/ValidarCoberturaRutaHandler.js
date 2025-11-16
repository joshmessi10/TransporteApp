// models/envios/chain/ValidarCoberturaRutaHandler.js
import EnvioValidationHandler from './EnvioValidationHandler.js';

export default class ValidarCoberturaRutaHandler extends EnvioValidationHandler {
  doHandle(context) {
    const { dto, errores } = context;

    // Stub simple: asumimos que si origen y destino existen, hay cobertura
    if (!dto.origenSedeId || !dto.destinoSedeId) {
      errores.push('No se puede validar cobertura sin origen y destino');
      return false;
    }

    dto.coberturaOk = true; // marca de que pasó esta validación
    return errores.length === 0;
  }
}
