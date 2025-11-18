import db from '../../config/db.js';

const resetTokens = new Map();

export default class AuthController {
  static login(req, res) {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, mensaje: 'Email y password son obligatorios' });
    }

    db.get(
      'SELECT id, nombre, email, password, rol, estado FROM users WHERE email = ? LIMIT 1',
      [email],
      (err, user) => {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
        if (!user) return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
        if (user.password !== password) return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
        if (user.estado === 'bloqueado') return res.status(403).json({ ok: false, mensaje: 'Usuario bloqueado' });

        const usuarioPublico = {
          idUsuario: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        };

        return res.status(200).json({ ok: true, usuario: usuarioPublico, token: 'FAKE-TOKEN-' + user.id });
      }
    );
  }

  static logout(req, res) {
    return res.status(200).json({ ok: true, mensaje: 'Sesión cerrada' });
  }

  static solicitarResetPassword(req, res) {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, mensaje: 'Email es obligatorio' });

    db.get('SELECT id FROM users WHERE email = ? LIMIT 1', [email], (err, user) => {
      if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });

      if (!user) {
        return res.status(200).json({ ok: true, mensaje: 'Si el email existe, se enviará enlace' });
      }

      const token = 'RESET-' + user.id + '-' + Date.now();
      resetTokens.set(token, user.id);
      return res.status(200).json({ ok: true, mensaje: 'Token generado', token });
    });
  }

  static resetPassword(req, res) {
    const { token, nuevaPassword } = req.body || {};
    if (!token || !nuevaPassword) {
      return res.status(400).json({ ok: false, mensaje: 'Token y nuevaPassword son obligatorios' });
    }

    const idUsuario = resetTokens.get(token);
    if (!idUsuario) {
      return res.status(400).json({ ok: false, mensaje: 'Token inválido o expirado' });
    }

    db.run('UPDATE users SET password = ? WHERE id = ?', [nuevaPassword, idUsuario], function (err) {
      resetTokens.delete(token);
      if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
      if (this.changes === 0) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
      return res.status(200).json({ ok: true, mensaje: 'Contraseña actualizada' });
    });
  }

  static cambiarPassword(req, res) {
    const { idUsuario, oldPassword, nuevaPassword } = req.body || {};
    if (!idUsuario || !oldPassword || !nuevaPassword) {
      return res.status(400).json({ ok: false, mensaje: 'idUsuario, oldPassword y nuevaPassword son obligatorios' });
    }

    db.get('SELECT password FROM users WHERE id = ? LIMIT 1', [idUsuario], (err, user) => {
      if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
      if (!user) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
      if (user.password !== oldPassword) return res.status(401).json({ ok: false, mensaje: 'Contraseña actual incorrecta' });

      db.run('UPDATE users SET password = ? WHERE id = ?', [nuevaPassword, idUsuario], function (err) {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error servidor' });
        return res.status(200).json({ ok: true, mensaje: 'Contraseña cambiada' });
      });
    });
  }
}