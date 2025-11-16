// controllers/usuarios/UsuarioMemoryStore.js
import { Usuario, Cliente } from '../../models/usuarios/index.js';

let nextId = 1;

// idUsuario -> record
// record = { idUsuario, email, password, rol, tipo, model, bloqueado }
const usuariosPorId = new Map();
// email -> idUsuario
const usuariosPorEmail = new Map();

export function crearCliente({ email, password, ...datos }) {
  if (!email || !password) {
    throw new Error('Email y password son obligatorios para cliente');
  }
  if (usuariosPorEmail.has(email)) {
    throw new Error('Email ya registrado');
  }

  const idUsuario = nextId++;
  const cliente = new Cliente({
    idCliente: idUsuario,
    email,
    activo: true,
    ...datos
  });

  const record = {
    idUsuario,
    email,
    password,
    rol: 'CLIENTE',
    tipo: 'CLIENTE',
    model: cliente,
    bloqueado: false
  };

  usuariosPorId.set(idUsuario, record);
  usuariosPorEmail.set(email, idUsuario);

  return record;
}

export function crearAdmin({ email, password, ...datos }) {
  if (!email || !password) {
    throw new Error('Email y password son obligatorios para admin');
  }
  if (usuariosPorEmail.has(email)) {
    throw new Error('Email ya registrado');
  }

  const idUsuario = nextId++;
  const admin = new Usuario({
    idUsuario,
    email,
    rol: 'ADMIN',
    activo: true,
    ...datos
  });

  const record = {
    idUsuario,
    email,
    password,
    rol: 'ADMIN',
    tipo: 'ADMIN',
    model: admin,
    bloqueado: false
  };

  usuariosPorId.set(idUsuario, record);
  usuariosPorEmail.set(email, idUsuario);

  return record;
}

export function obtenerPorId(idUsuario) {
  return usuariosPorId.get(idUsuario) || null;
}

export function obtenerPorEmail(email) {
  const id = usuariosPorEmail.get(email);
  if (!id) return null;
  return usuariosPorId.get(id) || null;
}

export function actualizarModelo(idUsuario, datosParciales) {
  const record = usuariosPorId.get(idUsuario);
  if (!record) return null;

  Object.assign(record.model, datosParciales);
  return record;
}

export function bloquearUsuario(idUsuario) {
  const record = usuariosPorId.get(idUsuario);
  if (!record) return null;

  record.bloqueado = true;
  record.model.activo = false;
  return record;
}

export function desbloquearUsuario(idUsuario) {
  const record = usuariosPorId.get(idUsuario);
  if (!record) return null;

  record.bloqueado = false;
  record.model.activo = true;
  return record;
}

export function actualizarPassword(idUsuario, nuevaPassword) {
  const record = usuariosPorId.get(idUsuario);
  if (!record) return null;

  record.password = nuevaPassword;
  return record;
}
