// controllers/usuarios/AuthController.js
import {
  obtenerPorEmail,
  obtenerPorId,
  actualizarPassword
} from './UsuarioMemoryStore.js';

// resetToken -> idUsuario
const resetTokens = new Map();

export default class AuthController {
  static async login(req, res) {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Email y password son obligatorios'
      });
    }

    const record = obtenerPorEmail(email);
    if (!record) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
    }

    if (record.bloqueado || record.model.activo === false) {
      return res.status(403).json({ ok: false, mensaje: 'Usuario bloqueado/inactivo' });
    }

    if (record.password !== password) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
    }

    const usuarioPublico = {
      idUsuario: record.idUsuario,
      email: record.email,
      rol: record.rol,
      tipo: record.tipo
    };

    return res.status(200).json({
      ok: true,
      usuario: usuarioPublico,
      token: 'FAKE-TOKEN-' + record.idUsuario
    });
  }

  static async logout(req, res) {
    // En un sistema real invalidaríamos el token
    return res.status(200).json({ ok: true, mensaje: 'Sesión cerrada' });
  }

  static async solicitarResetPassword(req, res) {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ ok: false, mensaje: 'Email es obligatorio' });
    }

    const record = obtenerPorEmail(email);
    if (!record) {
      // Para no filtrar existencia de usuario, devolvemos ok igual
      return res.status(200).json({
        ok: true,
        mensaje: 'Si el email existe, se enviará un enlace de recuperación'
      });
    }

    const token = 'RESET-' + record.idUsuario + '-' + Date.now();
    resetTokens.set(token, record.idUsuario);

    // En un sistema real aquí enviaríamos email con el token
    return res.status(200).json({
      ok: true,
      mensaje: 'Token de recuperación generado',
      token // para test lo devolvemos
    });
  }

  static async resetPassword(req, res) {
    const { token, nuevaPassword } = req.body || {};
    if (!token || !nuevaPassword) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Token y nuevaPassword son obligatorios'
      });
    }

    const idUsuario = resetTokens.get(token);
    if (!idUsuario) {
      return res.status(400).json({ ok: false, mensaje: 'Token inválido o expirado' });
    }

    const record = actualizarPassword(idUsuario, nuevaPassword);
    resetTokens.delete(token);

    if (!record) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    return res.status(200).json({ ok: true, mensaje: 'Contraseña actualizada' });
  }

  static async cambiarPassword(req, res) {
    const { idUsuario, oldPassword, nuevaPassword } = req.body || {};
    if (!idUsuario || !oldPassword || !nuevaPassword) {
      return res.status(400).json({
        ok: false,
        mensaje: 'idUsuario, oldPassword y nuevaPassword son obligatorios'
      });
    }

    const record = obtenerPorId(Number(idUsuario));
    if (!record) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    if (record.password !== oldPassword) {
      return res.status(401).json({ ok: false, mensaje: 'Contraseña actual incorrecta' });
    }

    actualizarPassword(record.idUsuario, nuevaPassword);

    return res.status(200).json({ ok: true, mensaje: 'Contraseña cambiada' });
  }
}
