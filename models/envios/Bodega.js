// models/envios/Bodega.js

export default class Bodega {
  constructor({
    idBodega,
    sedeId,
    nombreBodega,
    capacidadMaximaKg = 0,
    capacidadUtilizadaKg = 0,
    activa = true
  }) {
    this.idBodega = idBodega;
    this.sedeId = sedeId;
    this.nombreBodega = nombreBodega;
    this.capacidadMaximaKg = capacidadMaximaKg;
    this.capacidadUtilizadaKg = capacidadUtilizadaKg;
    this.activa = activa;
  }

  capacidadDisponibleKg() {
    return this.capacidadMaximaKg - this.capacidadUtilizadaKg;
  }

  tieneCapacidadPara(pesoKg) {
    return this.capacidadDisponibleKg() >= pesoKg;
  }

  registrarIngreso(pesoKg) {
    if (!this.tieneCapacidadPara(pesoKg)) {
      throw new Error('La bodega no tiene capacidad suficiente');
    }
    this.capacidadUtilizadaKg += pesoKg;
  }

  registrarSalida(pesoKg) {
    if (this.capacidadUtilizadaKg - pesoKg < 0) {
      throw new Error('No se puede dejar la capacidad utilizada en negativo');
    }
    this.capacidadUtilizadaKg -= pesoKg;
  }

  activar() {
    this.activa = true;
  }

  desactivar() {
    this.activa = false;
  }
}
