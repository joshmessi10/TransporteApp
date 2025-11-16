// models/pasajeros/Equipaje.js

export default class Equipaje {
  constructor({
    idEquipaje,
    idTiquete,
    pesoKg = 0,
    tipo = 'BODEGA', // 'MANO' | 'BODEGA'
    etiquetaCodigo = '',
    observaciones = ''
  }) {
    this.idEquipaje = idEquipaje;
    this.idTiquete = idTiquete;
    this.pesoKg = pesoKg;
    this.tipo = tipo;
    this.etiquetaCodigo = etiquetaCodigo;
    this.observaciones = observaciones;
  }

  actualizarPeso(nuevoPesoKg) {
    if (nuevoPesoKg < 0) {
      throw new Error('El peso no puede ser negativo');
    }
    this.pesoKg = nuevoPesoKg;
  }

  actualizarObservaciones(obs) {
    this.observaciones = obs;
  }

  excedeLimite(limiteKg) {
    return this.pesoKg > limiteKg;
  }
}
