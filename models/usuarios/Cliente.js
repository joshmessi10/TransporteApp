// models/usuarios/Cliente.js
import Usuario from './Usuario.js';

export default class Cliente extends Usuario {
  constructor({
    idCliente,
    tipoCliente = 'NATURAL', // 'NATURAL' | 'JURIDICO'
    nitEmpresa = null,
    razonSocial = null,
    medioRegistro = 'WEB', // 'WEB' | 'PUNTO_FISICO' | 'CALL_CENTER'
    aceptoTerminos = false,
    fechaAceptacionTerminos = null,
    ...usuarioProps
  }) {
    super({
      ...usuarioProps,
      tipoUsuario: 'CLIENTE'
    });

    this.idCliente = idCliente ?? usuarioProps.idUsuario;
    this.tipoCliente = tipoCliente;
    this.nitEmpresa = nitEmpresa;
    this.razonSocial = razonSocial;
    this.medioRegistro = medioRegistro;
    this.aceptoTerminos = aceptoTerminos;
    this.fechaAceptacionTerminos = fechaAceptacionTerminos;
  }

  aceptarTerminos() {
    this.aceptoTerminos = true;
    this.fechaAceptacionTerminos = new Date();
  }

  actualizarDatosFacturacion(nit, razonSocial) {
    this.nitEmpresa = nit;
    this.razonSocial = razonSocial;
  }

  /**
   * Estos métodos en un backend real delegarían a un repositorio/servicio.
   * Aquí los dejamos como placeholders para no acoplar el modelo a la persistencia.
   */
  obtenerHistorialTiquetes() {
    // TODO: integrar con repositorio de Tiquete
    return [];
  }

  obtenerHistorialEnvios() {
    // TODO: integrar con repositorio de Envio
    return [];
  }
}
