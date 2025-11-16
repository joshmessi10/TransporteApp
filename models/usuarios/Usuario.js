// models/usuarios/Usuario.js

export default class Usuario {
  constructor({
    idUsuario,
    tipoUsuario, // 'ADMIN' | 'CLIENTE'
    tipoDocumento,
    numeroDocumento,
    nombreCompleto,
    correo,
    telefono,
    direccion,
    nombreUsuario,
    hashContrasena,
    estadoCuenta = 'ACTIVA', // 'ACTIVA' | 'BLOQUEADA'
    fechaRegistro = new Date(),
    ultimoAcceso = null
  }) {
    this.idUsuario = idUsuario;
    this.tipoUsuario = tipoUsuario;
    this.tipoDocumento = tipoDocumento;
    this.numeroDocumento = numeroDocumento;
    this.nombreCompleto = nombreCompleto;
    this.correo = correo;
    this.telefono = telefono;
    this.direccion = direccion;
    this.nombreUsuario = nombreUsuario;
    this.hashContrasena = hashContrasena;
    this.estadoCuenta = estadoCuenta;
    this.fechaRegistro = fechaRegistro;
    this.ultimoAcceso = ultimoAcceso;
  }

  /**
   * OJO: aquí comparamos en claro para simplificar el modelo.
   * En producción, esto debería delegar a un servicio de hashing.
   */
  autenticar(passwordPlano) {
    return this.hashContrasena === passwordPlano;
  }

  cambiarContrasena(antigua, nueva) {
    if (!this.autenticar(antigua)) {
      throw new Error('La contraseña actual no es correcta');
    }
    this.hashContrasena = nueva; // aquí iría el hash
  }

  bloquearCuenta() {
    this.estadoCuenta = 'BLOQUEADA';
  }

  desbloquearCuenta() {
    this.estadoCuenta = 'ACTIVA';
  }

  actualizarDatosContacto(correo, telefono, direccion) {
    if (correo) this.correo = correo;
    if (telefono) this.telefono = telefono;
    if (direccion) this.direccion = direccion;
  }

  registrarAccesoExitoso() {
    this.ultimoAcceso = new Date();
    if (this.estadoCuenta === 'BLOQUEADA') {
      this.estadoCuenta = 'ACTIVA';
    }
  }
}
