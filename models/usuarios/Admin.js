// models/usuarios/Admin.js
import Usuario from './Usuario.js';

export default class Admin extends Usuario {
  constructor({
    idAdmin,
    cargo,
    sedeAsignadaId = null,
    activo = true,
    ...usuarioProps
  }) {
    super({
      ...usuarioProps,
      tipoUsuario: 'ADMIN'
    });

    // si no se pasa idAdmin, usamos el idUsuario como base
    this.idAdmin = idAdmin ?? usuarioProps.idUsuario;
    this.cargo = cargo;
    this.sedeAsignadaId = sedeAsignadaId;
    this.activo = activo;
  }

  puedeAdministrarSede(idSede) {
    if (!this.activo) return false;
    // si no tiene sede asignada, asumimos que puede administrar cualquiera (ej. superadmin)
    if (this.sedeAsignadaId == null) return true;
    return this.sedeAsignadaId === idSede;
  }

  asignarSede(idSede) {
    this.sedeAsignadaId = idSede;
  }

  actualizarCargo(nuevoCargo) {
    this.cargo = nuevoCargo;
  }
}
