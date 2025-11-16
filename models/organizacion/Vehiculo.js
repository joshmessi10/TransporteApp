// models/organizacion/Vehiculo.js

export default class Vehiculo {
  constructor({
    placa,
    tipoVehiculo, // 'BUS' | 'FURGON' | 'CAMIONETA'
    marca,
    modelo,
    anio,
    capacidadPasajeros = 0,
    capacidadCargaKg = 0,
    estadoOperativo = 'ACTIVO', // 'ACTIVO' | 'MANTENIMIENTO' | 'FUERA_SERVICIO'
    kilometrajeActual = 0,
    sedeActualId = null
  }) {
    this.placa = placa;
    this.tipoVehiculo = tipoVehiculo;
    this.marca = marca;
    this.modelo = modelo;
    this.anio = anio;
    this.capacidadPasajeros = capacidadPasajeros;
    this.capacidadCargaKg = capacidadCargaKg;
    this.estadoOperativo = estadoOperativo;
    this.kilometrajeActual = kilometrajeActual;
    this.sedeActualId = sedeActualId;
  }

  asignarSede(idSede) {
    this.sedeActualId = idSede;
  }

  actualizarKilometraje(nuevoKm) {
    if (nuevoKm < this.kilometrajeActual) {
      throw new Error('El kilometraje no puede disminuir');
    }
    this.kilometrajeActual = nuevoKm;
  }

  cambiarEstado(nuevoEstado) {
    this.estadoOperativo = nuevoEstado;
  }

  tieneCapacidadCarga(pesoKg) {
    return pesoKg <= this.capacidadCargaKg;
  }

  /**
   * stub simple: en una implementación real, recibiría Ruta y revisaría
   * restricciones de tipo de servicio, distancia, etc.
   */
  puedeOperarRuta(ruta) {
    if (!ruta) return true;
    if (ruta.tipoServicio === 'PASAJEROS') {
      return this.capacidadPasajeros > 0;
    }
    if (ruta.tipoServicio === 'PAQUETERIA') {
      return this.capacidadCargaKg > 0;
    }
    // MIXTO
    return this.capacidadPasajeros > 0 && this.capacidadCargaKg > 0;
  }
}
