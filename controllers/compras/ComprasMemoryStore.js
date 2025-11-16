// controllers/compras/ComprasMemoryStore.js
import {
  CarritoCompra,
  CarritoHistory
} from '../../models/carrito/index.js';

let nextCarritoId = 1;

// idCarrito -> { carrito, history }
const carritos = new Map();

/* ========== CARRITO ========== */

export function crearCarrito({ idCliente }) {
  const idCarrito = nextCarritoId++;

  const carrito = new CarritoCompra({ idCliente });
  // le colgamos el id para poder verlo desde afuera
  carrito.idCarrito = idCarrito;

  const history = new CarritoHistory(carrito);
  history.snapshot(); // snapshot inicial

  carritos.set(idCarrito, { carrito, history });

  return carrito;
}

export function obtenerCarrito(idCarrito) {
  const entry = carritos.get(idCarrito);
  return entry ? entry.carrito : null;
}

export function snapshotCarrito(idCarrito) {
  const entry = carritos.get(idCarrito);
  if (!entry) return null;
  entry.history.snapshot();
  return entry.carrito;
}

export function undoCarrito(idCarrito) {
  const entry = carritos.get(idCarrito);
  if (!entry) return null;
  entry.history.undo();
  return entry.carrito;
}

export function redoCarrito(idCarrito) {
  const entry = carritos.get(idCarrito);
  if (!entry) return null;
  entry.history.redo();
  return entry.carrito;
}

export function listarSnapshotsCarrito(idCarrito) {
  const entry = carritos.get(idCarrito);
  if (!entry) return [];
  return entry.history.listarSnapshots();
}

/* ========== OPERACIONES DE NEGOCIO SOBRE EL CARRITO ========== */

export function agregarTiqueteACarrito(idCarrito, { viajeId, asiento, precio }) {
  const carrito = obtenerCarrito(idCarrito);
  if (!carrito) return null;

  carrito.agregarTiquete({ viajeId, asiento, precio });
  return carrito;
}

export function agregarEnvioACarrito(idCarrito, { dto, precio }) {
  const carrito = obtenerCarrito(idCarrito);
  if (!carrito) return null;

  const idTemporal = Date.now();
  carrito.agregarEnvio({ idTemporal, dto, precio });
  return carrito;
}
