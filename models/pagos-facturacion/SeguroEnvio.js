// models/pagos-facturacion/SeguroEnvio.js

export default class SeguroEnvio {
  constructor({
    idSeguro,
    idEnvio,
    valorAsegurado = 0,
    prima = 0,
    condiciones = '',
    estado = 'VIGENTE', // 'VIGENTE' | 'RECLAMADO' | 'VENCIDO'
    fechaCreacion = new Date(),
    fechaVencimiento = null
  }) {
    this.idSeguro = idSeguro;
    this.idEnvio = idEnvio;
    this.valorAsegurado = valorAsegurado;
    this.prima = prima;
    this.condiciones = condiciones;
    this.estado = estado;
    this.fechaCreacion = fechaCreacion ? new Date(fechaCreacion) : new Date();
    this.fechaVencimiento = fechaVencimiento
      ? new Date(fechaVencimiento)
      : null;
  }

  calcularPrima(porcentaje) {
    if (porcentaje < 0) {
      throw new Error('El porcentaje de prima no puede ser negativo');
    }
    this.prima = (this.valorAsegurado * porcentaje) / 100;
    return this.prima;
  }

  marcarReclamado() {
    this.estado = 'RECLAMADO';
  }

  marcarVencido() {
    this.estado = 'VENCIDO';
  }

  estaVigente(ahora = new Date()) {
    if (this.estado !== 'VIGENTE') return false;
    if (!this.fechaVencimiento) return true;
    return this.fechaVencimiento >= ahora;
  }
}
