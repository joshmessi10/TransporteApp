// controllers/envios/EnviosMemoryStore.js
import {
  Envio,
  TrackingEnvio,
  Bodega,
  ItemInventarioBodega,
  ManifiestoCarga
} from '../../models/envios/index.js';

let nextEnvioId = 1;
let nextBodegaId = 1;
let nextItemInventarioId = 1;
let nextManifiestoId = 1;

const envios = new Map();          // idEnvio -> Envio
const trackingPorEnvio = new Map(); // idEnvio -> TrackingEnvio[]
const bodegas = new Map();         // idBodega -> Bodega
const inventarioPorBodega = new Map(); // idBodega -> ItemInventarioBodega[]
const manifiestos = new Map();     // idManifiesto -> ManifiestoCarga

/* ========== ENVIOS ========== */

export function registrarEnvioEnStore(dtoCreado) {
  // si el pipeline ya creó un Envio con idEnvio, lo respetamos
  const idEnvio = dtoCreado.idEnvio || nextEnvioId++;
  const envio =
    dtoCreado instanceof Envio
      ? dtoCreado
      : new Envio({ idEnvio, ...dtoCreado });

  envios.set(envio.idEnvio, envio);
  if (!trackingPorEnvio.has(envio.idEnvio)) {
    trackingPorEnvio.set(envio.idEnvio, []);
  }
  return envio;
}

export function obtenerEnvio(idEnvio) {
  return envios.get(idEnvio) || null;
}

/* ========== TRACKING ========== */

export function registrarEventoTracking({
  idEnvio,
  estado,
  descripcion = '',
  ubicacion = null
}) {
  if (!envios.has(idEnvio)) {
    throw new Error('No existe envío para registrar tracking');
  }

  const evento = new TrackingEnvio({
    idEnvio,
    estado,
    descripcion,
    ubicacion,
    fechaEvento: new Date()
  });

  if (!trackingPorEnvio.has(idEnvio)) {
    trackingPorEnvio.set(idEnvio, []);
  }
  trackingPorEnvio.get(idEnvio).push(evento);
  return evento;
}

export function obtenerTracking(idEnvio) {
  return trackingPorEnvio.get(idEnvio) || [];
}

/* ========== BODEGAS ========== */

export function crearBodega(datos) {
  const idBodega = nextBodegaId++;
  const bodega = new Bodega({ idBodega, ...datos });
  bodegas.set(idBodega, bodega);
  inventarioPorBodega.set(idBodega, []);
  return bodega;
}

export function obtenerBodega(idBodega) {
  return bodegas.get(idBodega) || null;
}

export function ingresarEnvioABodega(idBodega, idEnvio) {
  const bodega = bodegas.get(idBodega);
  const envio = envios.get(idEnvio);

  if (!bodega) throw new Error('Bodega no existe');
  if (!envio) throw new Error('Envio no existe');

  const items = inventarioPorBodega.get(idBodega) || [];
  const yaExiste = items.some((it) => it.idEnvio === idEnvio);
  if (yaExiste) return bodega;

  const idItem = nextItemInventarioId++;
  const item = new ItemInventarioBodega({
    idItemInventario: idItem,
    idEnvio,
    idBodega,
    fechaIngreso: new Date()
  });

  items.push(item);
  inventarioPorBodega.set(idBodega, items);

  return bodega;
}

export function sacarEnvioDeBodega(idBodega, idEnvio) {
  const items = inventarioPorBodega.get(idBodega);
  if (!items) return;

  const filtrados = items.filter((it) => it.idEnvio !== idEnvio);
  inventarioPorBodega.set(idBodega, filtrados);
}

export function obtenerInventarioBodega(idBodega) {
  return inventarioPorBodega.get(idBodega) || [];
}

/* ========== MANIFIESTOS DE CARGA ========== */

export function crearManifiesto(datos) {
  const idManifiesto = nextManifiestoId++;
  const mani = new ManifiestoCarga({
    idManifiesto,
    fechaCreacion: new Date(),
    ...datos
  });
  manifiestos.set(idManifiesto, mani);
  return mani;
}

export function obtenerManifiesto(idManifiesto) {
  return manifiestos.get(idManifiesto) || null;
}

export function asociarEnvioAManifiesto(idManifiesto, idEnvio) {
  const mani = manifiestos.get(idManifiesto);
  const envio = envios.get(idEnvio);
  if (!mani) throw new Error('Manifiesto no existe');
  if (!envio) throw new Error('Envio no existe');

  // asumo que ManifiestoCarga tiene un arreglo enviosIds o similar
  if (!Array.isArray(mani.enviosIds)) {
    mani.enviosIds = [];
  }
  if (!mani.enviosIds.includes(idEnvio)) {
    mani.enviosIds.push(idEnvio);
  }
  // recalcular totales aquí si tu modelo lo soporta
  return mani;
}

export function desasociarEnvioDeManifiesto(idManifiesto, idEnvio) {
  const mani = manifiestos.get(idManifiesto);
  if (!mani || !Array.isArray(mani.enviosIds)) return mani;

  mani.enviosIds = mani.enviosIds.filter((eid) => eid !== idEnvio);
  return mani;
}

export function listarEnvios() {
  return Array.from(envios.values());
}
