// models/envios/chain/ValidarPesoYDimensionesHandler.js
import EnvioValidationHandler from './EnvioValidationHandler.js';

export default class ValidarPesoYDimensionesHandler extends EnvioValidationHandler {
  doHandle(context) {
    const { dto, errores } = context;

    if (dto.pesoKg == null || dto.pesoKg <= 0) {
      errores.push('El peso debe ser mayor a 0 kg');
    }
    if (dto.altoCm == null || dto.altoCm <= 0 ||
        dto.anchoCm == null || dto.anchoCm <= 0 ||
        dto.largoCm == null || dto.largoCm <= 0) {
      errores.push('Todas las dimensiones (alto, ancho, largo) deben ser > 0');
    }

    return errores.length === 0;
  }
}
