// models/envios/ItemInventarioBodega.js

export default class ItemInventarioBodega {
  constructor({
    idItem,
    idBodega,
    idEnvio,
    ubicacionFisica,
    fechaIngreso = new Date(),
    fechaSalida = null,
    estado = 'ALMACENADO' // 'ALMACENADO' | 'PENDIENTE_DESPACHO' | 'DESPACHADO'
  }) {
    this.idItem = idItem;
    this.idBodega = idBodega;
    this.idEnvio = idEnvio;
    this.ubicacionFisica = ubicacionFisica;
    this.fechaIngreso = fechaIngreso ? new Date(fechaIngreso) : new Date();
    this.fechaSalida = fechaSalida ? new Date(fechaSalida) : null;
    this.estado = estado;
  }

  marcarPendienteDespacho() {
    if (this.estado === 'DESPACHADO') {
      throw new Error('El ítem ya fue despachado');
    }
    this.estado = 'PENDIENTE_DESPACHO';
  }

  marcarDespachado(fechaSalida = new Date()) {
    this.estado = 'DESPACHADO';
    this.fechaSalida = new Date(fechaSalida);
  }

  estaAlmacenado() {
    return this.estado === 'ALMACENADO';
  }
}
