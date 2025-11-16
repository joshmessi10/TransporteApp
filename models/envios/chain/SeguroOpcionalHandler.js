// models/envios/chain/SeguroOpcionalHandler.js
import EnvioValidationHandler from './EnvioValidationHandler.js';

export default class SeguroOpcionalHandler extends EnvioValidationHandler {
  doHandle(context) {
    const { dto } = context;

    // Regla de ejemplo: sugerir seguro si el valor declarado supera cierto umbral
    const UMBRAL_SEGURO = 100000; // por ejemplo
    dto.recomendarSeguro = dto.valorDeclarado >= UMBRAL_SEGURO;

    return true;
  }
}
