// models/procesos-compra/ProcesoCompra.js

export default class ProcesoCompra {
  async ejecutarCompra() {
    await this.validarDatosEntrada();
    await this.calcularPrecio();
    await this.registrarTransaccion();
    await this.procesarPago();
    await this.generarDocumentoSoporte();
    await this.notificarCliente();
  }

  // Métodos a implementar por las subclases:

  async validarDatosEntrada() {
    throw new Error('validarDatosEntrada() debe implementarse en la subclase');
  }

  async calcularPrecio() {
    throw new Error('calcularPrecio() debe implementarse en la subclase');
  }

  async registrarTransaccion() {
    throw new Error('registrarTransaccion() debe implementarse en la subclase');
  }

  async procesarPago() {
    throw new Error('procesarPago() debe implementarse en la subclase');
  }

  async generarDocumentoSoporte() {
    throw new Error('generarDocumentoSoporte() debe implementarse en la subclase');
  }

  // Hook con implementación por defecto (opcional)
  async notificarCliente() {
    // por defecto no hace nada; subclases pueden overridear
  }
}
