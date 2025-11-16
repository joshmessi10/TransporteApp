// models/envios/Envio.js
import EnvioStateFactory from './state/EnvioStateFactory.js';

export default class Envio {
  constructor({
    idEnvio,
    codigoRastreo,
    tipoEnvio, // 'DOCUMENTO' | 'PAQUETE'
    idRemitente,
    idDestinatario,
    origenSedeId,
    destinoSedeId,
    pesoKg = 0,
    altoCm = 0,
    anchoCm = 0,
    largoCm = 0,
    valorDeclarado = 0,
    tipoServicio = 'ESTANDAR', // 'ESTANDAR' | 'EXPRESS' | 'CONTRAENTREGA'
    estado = 'REGISTRADO', // 'REGISTRADO' | 'EN_BODEGA_ORIGEN' | 'EN_TRANSITO' | 'EN_BODEGA_DESTINO' | 'EN_REPARTO' | 'ENTREGADO' | 'DEVUELTO' | 'FALLIDO'
    fechaRegistro = new Date(),
    fechaEntregaEstimada = null,
    fechaEntregaReal = null,
    idSeguro = null,
    idFactura = null,
    observaciones = ''
  }) {
    this.idEnvio = idEnvio;
    this.codigoRastreo = codigoRastreo;
    this.tipoEnvio = tipoEnvio;
    this.idRemitente = idRemitente;
    this.idDestinatario = idDestinatario;
    this.origenSedeId = origenSedeId;
    this.destinoSedeId = destinoSedeId;
    this.pesoKg = pesoKg;
    this.altoCm = altoCm;
    this.anchoCm = anchoCm;
    this.largoCm = largoCm;
    this.valorDeclarado = valorDeclarado;
    this.tipoServicio = tipoServicio;
    this.estado = estado;
    this.fechaRegistro = fechaRegistro ? new Date(fechaRegistro) : new Date();
    this.fechaEntregaEstimada = fechaEntregaEstimada
      ? new Date(fechaEntregaEstimada)
      : null;
    this.fechaEntregaReal = fechaEntregaReal
      ? new Date(fechaEntregaReal)
      : null;
    this.idSeguro = idSeguro;
    this.idFactura = idFactura;
    this.observaciones = observaciones;

    // -------- State pattern --------
    this.stateFactory = new EnvioStateFactory();

    // definimos _estadoObj como NO enumerable para que JSON.stringify no lo recorra
    const initialStateObj = this.stateFactory.create(this.estado);
    Object.defineProperty(this, '_estadoObj', {
      value: initialStateObj,
      enumerable: false,   // <--- clave del fix
      writable: true,
      configurable: true
    });
    this._estadoObj.setContext(this);
  }

  // =======================
  // Soporte para State
  // =======================

  setEstadoObj(estadoObj) {
    // ya existe la propiedad como no-enumerable; solo actualizamos su valor
    this._estadoObj = estadoObj;
    this._estadoObj.setContext(this);
  }

  avanzar() {
    this._estadoObj.avanzar();
  }

  devolver() {
    this._estadoObj.devolver();
  }

  marcarFallido(motivo) {
    this._estadoObj.marcarFallido(motivo);
  }

  // =======================
  // Lógica de dominio existente
  // =======================

  calcularVolumenCm3() {
    return this.altoCm * this.anchoCm * this.largoCm;
  }

  /**
   * Mantengo cambiarEstado por compatibilidad, pero ahora también
   * sincroniza el objeto de estado del patrón State.
   */
  cambiarEstado(nuevoEstado, observaciones = '') {
    this.estado = nuevoEstado;

    if (observaciones) {
      this.observaciones += this.observaciones
        ? ` | ${observaciones}`
        : observaciones;
    }

    // IMPORTANT: sincronizar el State interno
    this.setEstadoObj(this.stateFactory.create(this.estado));
  }

  asignarSeguro(idSeguro) {
    this.idSeguro = idSeguro;
  }

  puedeMarcarseEntregado() {
    return (
      this.estado === 'EN_REPARTO' ||
      this.estado === 'EN_BODEGA_DESTINO' ||
      this.estado === 'EN_TRANSITO'
    );
  }

  /**
   * Aquí podríamos delegar totalmente al State (por ejemplo, desde EN_REPARTO -> ENTREGADO),
   * pero mantengo la lógica original y luego actualizo el Estado interno.
   */
  marcarEntregado(fechaEntrega = new Date()) {
    if (!this.puedeMarcarseEntregado()) {
      throw new Error('El envío no está en un estado apto para ser entregado');
    }
    this.estado = 'ENTREGADO';
    this.fechaEntregaReal = new Date(fechaEntrega);

    // sincronizo el objeto State
    this.setEstadoObj(this.stateFactory.create(this.estado));
  }

  esElegibleContraentrega() {
    if (this.tipoServicio !== 'CONTRAENTREGA') return false;
    if (this.valorDeclarado <= 0) return false;
    return true;
  }
}
