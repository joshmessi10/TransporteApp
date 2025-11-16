// models/organizacion/Sede.js

export default class Sede {
  constructor({
    idSede,
    nombreSede,
    ciudad,
    direccion,
    telefonoContacto,
    tipoSede, // 'TERMINAL' | 'OFICINA' | 'BODEGA' | 'PUNTO_RECAUDO'
    activo = true
  }) {
    this.idSede = idSede;
    this.nombreSede = nombreSede;
    this.ciudad = ciudad;
    this.direccion = direccion;
    this.telefonoContacto = telefonoContacto;
    this.tipoSede = tipoSede;
    this.activo = activo;
  }

  activar() {
    this.activo = true;
  }

  desactivar() {
    this.activo = false;
  }

  obtenerDireccionCompleta() {
    return `${this.direccion}, ${this.ciudad}`;
  }
}
