// models/rutas-viajes/Ruta.js

export default class Ruta {
  constructor({
    idRuta,
    codigoRuta, // ej: 'BOG-MED-001'
    origenSedeId,
    destinoSedeId,
    duracionEstimadaMinutos,
    distanciaKm,
    frecuencia, // texto: 'Cada hora', 'Diario', etc.
    tipoServicio, // 'PASAJEROS' | 'PAQUETERIA' | 'MIXTO'
    activa = true
  }) {
    this.idRuta = idRuta;
    this.codigoRuta = codigoRuta;
    this.origenSedeId = origenSedeId;
    this.destinoSedeId = destinoSedeId;
    this.duracionEstimadaMinutos = duracionEstimadaMinutos;
    this.distanciaKm = distanciaKm;
    this.frecuencia = frecuencia;
    this.tipoServicio = tipoServicio;
    this.activa = activa;
  }

  activar() {
    this.activa = true;
  }

  inactivar() {
    this.activa = false;
  }

  actualizarDuracion(nuevaDuracionMin) {
    if (nuevaDuracionMin <= 0) {
      throw new Error('La duración estimada debe ser mayor a 0 minutos');
    }
    this.duracionEstimadaMinutos = nuevaDuracionMin;
  }

  actualizarFrecuencia(nuevaFrecuencia) {
    this.frecuencia = nuevaFrecuencia;
  }

  esValida() {
    if (!this.origenSedeId || !this.destinoSedeId) return false;
    if (this.origenSedeId === this.destinoSedeId) return false;
    if (this.duracionEstimadaMinutos <= 0) return false;
    if (this.distanciaKm <= 0) return false;
    return true;
  }
}
