// models/envios/ManifiestoCarga.js

export default class ManifiestoCarga {
  constructor({
    idManifiesto,
    idViaje,
    fechaGeneracion = new Date(),
    pesoTotalKg = 0,
    volumenTotalCm3 = 0,
    cantidadEnvios = 0,
    observaciones = '',
    envios = [] // array de ids de envíos
  }) {
    this.idManifiesto = idManifiesto;
    this.idViaje = idViaje;
    this.fechaGeneracion = fechaGeneracion ? new Date(fechaGeneracion) : new Date();
    this.pesoTotalKg = pesoTotalKg;
    this.volumenTotalCm3 = volumenTotalCm3;
    this.cantidadEnvios = cantidadEnvios;
    this.observaciones = observaciones;
    this.envios = envios;
  }

  agregarEnvio(envio) {
    if (!envio || !envio.idEnvio) {
      throw new Error('Envio inválido');
    }
    if (!this.envios.includes(envio.idEnvio)) {
      this.envios.push(envio.idEnvio);
      this.pesoTotalKg += envio.pesoKg || 0;
      this.volumenTotalCm3 += envio.calcularVolumenCm3
        ? envio.calcularVolumenCm3()
        : 0;
      this.cantidadEnvios = this.envios.length;
    }
  }

  eliminarEnvio(envio) {
    if (!envio || !envio.idEnvio) {
      throw new Error('Envio inválido');
    }
    const index = this.envios.indexOf(envio.idEnvio);
    if (index >= 0) {
      this.envios.splice(index, 1);
      this.pesoTotalKg -= envio.pesoKg || 0;
      this.volumenTotalCm3 -= envio.calcularVolumenCm3
        ? envio.calcularVolumenCm3()
        : 0;
      if (this.pesoTotalKg < 0) this.pesoTotalKg = 0;
      if (this.volumenTotalCm3 < 0) this.volumenTotalCm3 = 0;
      this.cantidadEnvios = this.envios.length;
    }
  }

  recalcularTotales(enviosMap) {
    // enviosMap: Map<idEnvio, Envio> o un objeto { id: envio }
    this.pesoTotalKg = 0;
    this.volumenTotalCm3 = 0;
    this.cantidadEnvios = this.envios.length;

    this.envios.forEach((idEnvio) => {
      const envio = enviosMap.get
        ? enviosMap.get(idEnvio)
        : enviosMap[idEnvio];

      if (envio) {
        this.pesoTotalKg += envio.pesoKg || 0;
        this.volumenTotalCm3 += envio.calcularVolumenCm3
          ? envio.calcularVolumenCm3()
          : 0;
      }
    });
  }

  excedeCapacidadVehiculo(capacidadKg) {
    return this.pesoTotalKg > capacidadKg;
  }
}
