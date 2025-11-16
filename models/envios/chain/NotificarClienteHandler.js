// models/envios/chain/NotificarClienteHandler.js
import EnvioValidationHandler from './EnvioValidationHandler.js';

export default class NotificarClienteHandler extends EnvioValidationHandler {
  doHandle(context) {
    const { dto } = context;

    // Aquí no enviamos realmente nada, solo marcamos bandera para el test
    dto.notificacionProgramada = true;

    return true;
  }
}
