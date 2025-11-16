// models/envios/chain/EnvioValidationHandler.js

export default class EnvioValidationHandler {
  constructor() {
    this.next = null;
  }

  setNext(handler) {
    this.next = handler;
    return handler; // para hacer chain.setNext(a).setNext(b)...
  }

  handle(context) {
    // context = { dto, errores, envio? }
    const seguir = this.doHandle(context);
    if (seguir === false) {
      return context;
    }
    if (this.next) {
      return this.next.handle(context);
    }
    return context;
  }

  // A implementar por subclases
  // Debe devolver:
  //  - false para cortar cadena
  //  - true o undefined para continuar
  // eslint-disable-next-line no-unused-vars
  doHandle(context) {
    throw new Error('doHandle() debe implementarse en el handler concreto');
  }
}
