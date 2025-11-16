// models/envios/chain/CalcularTarifaHandler.js
import EnvioValidationHandler from './EnvioValidationHandler.js';

export default class CalcularTarifaHandler extends EnvioValidationHandler {
  doHandle(context) {
    const { dto } = context;

    const volumen = dto.altoCm * dto.anchoCm * dto.largoCm; // cm^3
    const factorPeso = dto.pesoKg * 1000;   // ejemplo
    const factorVolumen = volumen * 0.05;   // ejemplo
    const base = 5000;

    dto.tarifaCalculada = base + factorPeso + factorVolumen;
    return true;
  }
}
