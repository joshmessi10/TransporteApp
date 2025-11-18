// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar controladores - Usuarios
import AuthController from "./controllers/usuarios/AuthController.js";
import AdminController from "./controllers/usuarios/AdminController.js";
import ClienteController from "./controllers/usuarios/ClienteController.js";

// Importar controladores - Organización
import SedeController from './controllers/organizacion/SedeController.js';
import VehiculoController from './controllers/organizacion/VehiculoController.js';
import ConductorController from './controllers/organizacion/ConductorController.js';
import MantenimientoController from './controllers/organizacion/MantenimientoController.js';

// Importar controladores - Rutas y Viajes
import RutaController from './controllers/rutas-viajes/RutaController.js';
import ViajeController from './controllers/rutas-viajes/ViajeController.js';

// Importar controladores - Envíos
import EnvioController from './controllers/envios/EnvioController.js';
import BodegaController from './controllers/envios/BodegaController.js';
import ManifiestoCargaController from './controllers/envios/ManifiestoCargaController.js';
import TrackingEnvioController from './controllers/envios/TrackingEnvioController.js';

// Importar controladores - Pagos y Facturación
import PagoController from './controllers/pagos-facturacion/PagoController.js';
import FacturaController from './controllers/pagos-facturacion/FacturaController.js';
import SeguroEnvioController from './controllers/pagos-facturacion/SeguroEnvioController.js';

// Importar controladores - Pasajeros
import ReservaTiqueteController from './controllers/pasajeros/ReservaTiqueteController.js';
import TiqueteController from './controllers/pasajeros/TiqueteController.js';
import EquipajeController from './controllers/pasajeros/EquipajeController.js';

// Importar controladores - Atención al Cliente
import PqrsController from './controllers/atencion-cliente/PqrsController.js';
import NotificacionController from './controllers/atencion-cliente/NotificacionController.js';

// Importar controladores - Compras
import CarritoController from './controllers/compras/CarritoController.js';
import ProcesoCompraController from './controllers/compras/ProcesoCompraController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ========== RUTAS DE VISTAS HTML ==========
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'registro.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
});

app.get('/cliente', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cliente-dashboard.html'));
});

app.get('/tiquetes', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'tiquetes.html'));
});

app.get('/envios', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'envios.html'));
});

app.get('/tracking', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'tracking.html'));
});

app.get('/carrito', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'carrito.html'));
});

app.get('/pqrs', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pqrs.html'));
});

app.get('/organizacion', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'organizacion.html'));
});

app.get('/rutas', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'rutas.html'));
});

app.get('/pagos', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pagos.html'));
});

app.get('/envios-admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'envios.admin.html'));
});

app.get('/tiquetes-admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'tiquetes-admin.html'));
});

// Rutas cliente que ya tenías:
app.get('/tiquetes', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'tiquetes.html'));
});

app.get('/envios', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'envios.html'));
});

app.get('/tracking', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'tracking.html'));
});

app.get('/carrito', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'carrito.html'));
});

app.get('/pqrs', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pqrs.html'));
});

// ========== API USUARIOS ==========
// Auth
app.post('/api/auth/login', (req, res) => AuthController.login(req, res));
app.post('/api/auth/logout', (req, res) => AuthController.logout(req, res));
app.post('/api/auth/solicitar-reset', (req, res) => AuthController.solicitarResetPassword(req, res));
app.post('/api/auth/reset', (req, res) => AuthController.resetPassword(req, res));
app.post('/api/auth/cambiar-password', (req, res) => AuthController.cambiarPassword(req, res));

// Clientes
app.post('/api/cliente', (req, res) => ClienteController.registrarCliente(req, res));
app.get('/api/cliente/:id', (req, res) => ClienteController.obtenerCliente(req, res));
app.put('/api/cliente/:id', (req, res) => ClienteController.actualizarCliente(req, res));
app.put('/api/cliente/contacto/:id', (req, res) => ClienteController.actualizarDatosContacto(req, res));
app.put('/api/cliente/facturacion/:id', (req, res) => ClienteController.actualizarDatosFacturacion(req, res));
app.put('/api/cliente/bloquear/:id', (req, res) => ClienteController.bloquearCliente(req, res));
app.put('/api/cliente/desbloquear/:id', (req, res) => ClienteController.desbloquearCliente(req, res));

// Administradores
app.post('/api/admin', (req, res) => AdminController.registrarAdmin(req, res));
app.get('/api/admin/:id', (req, res) => AdminController.obtenerAdmin(req, res));
app.put('/api/admin/:id', (req, res) => AdminController.actualizarAdmin(req, res));
app.put('/api/admin/bloquear/:id', (req, res) => AdminController.bloquearAdmin(req, res));
app.put('/api/admin/desbloquear/:id', (req, res) => AdminController.desbloquearAdmin(req, res));

// ========== API ORGANIZACIÓN ==========
// Sedes
app.post('/api/sedes', (req, res) => SedeController.crear(req, res));
app.get('/api/sedes', (req, res) => SedeController.listar(req, res));
app.get('/api/sedes/:id', (req, res) => SedeController.obtener(req, res));
app.put('/api/sedes/:id', (req, res) => SedeController.actualizar(req, res));
app.delete('/api/sedes/:id', (req, res) => SedeController.eliminar(req, res));

// Vehículos
app.post('/api/vehiculos', (req, res) => VehiculoController.crear(req, res));
app.get('/api/vehiculos', (req, res) => VehiculoController.listar(req, res));
app.get('/api/vehiculos/:id', (req, res) => VehiculoController.obtener(req, res));
app.put('/api/vehiculos/:id', (req, res) => VehiculoController.actualizar(req, res));
app.put('/api/vehiculos/:id/estado', (req, res) => VehiculoController.cambiarEstado(req, res));
app.put('/api/vehiculos/:id/kilometraje', (req, res) => VehiculoController.actualizarKilometraje(req, res));
app.delete('/api/vehiculos/:id', (req, res) => VehiculoController.eliminar(req, res));

// Conductores
app.post('/api/conductores', (req, res) => ConductorController.crear(req, res));
app.get('/api/conductores', (req, res) => ConductorController.listar(req, res));
app.get('/api/conductores/:id', (req, res) => ConductorController.obtener(req, res));
app.put('/api/conductores/:id', (req, res) => ConductorController.actualizar(req, res));
app.delete('/api/conductores/:id', (req, res) => ConductorController.eliminar(req, res));

// Mantenimientos
app.post('/api/mantenimientos', (req, res) => MantenimientoController.programar(req, res));
app.get('/api/mantenimientos', (req, res) => MantenimientoController.listar(req, res));
app.get('/api/mantenimientos/:id', (req, res) => MantenimientoController.obtener(req, res));
app.put('/api/mantenimientos/:id/iniciar', (req, res) => MantenimientoController.iniciar(req, res));
app.put('/api/mantenimientos/:id/finalizar', (req, res) => MantenimientoController.finalizar(req, res));

// ========== API RUTAS Y VIAJES ==========
// Rutas
app.post('/api/rutas', (req, res) => RutaController.crear(req, res));
app.get('/api/rutas', (req, res) => RutaController.listar(req, res));
app.get('/api/rutas/:id', (req, res) => RutaController.obtener(req, res));
app.put('/api/rutas/:id', (req, res) => RutaController.actualizar(req, res));
app.put('/api/rutas/:id/activar', (req, res) => RutaController.activar(req, res));
app.put('/api/rutas/:id/inactivar', (req, res) => RutaController.inactivar(req, res));
app.delete('/api/rutas/:id', (req, res) => RutaController.eliminar(req, res));

// Viajes
app.post('/api/viajes', (req, res) => ViajeController.crear(req, res));
app.get('/api/viajes', (req, res) => ViajeController.listar(req, res));
app.get('/api/viajes/:id', (req, res) => ViajeController.obtener(req, res));
app.put('/api/viajes/:id/iniciar', (req, res) => ViajeController.iniciar(req, res));
app.put('/api/viajes/:id/finalizar', (req, res) => ViajeController.finalizar(req, res));
app.put('/api/viajes/:id/cancelar', (req, res) => ViajeController.cancelar(req, res));

// ========== API ENVÍOS ==========
app.post('/api/envios', (req, res) => EnvioController.registrarEnvio(req, res));
app.get('/api/envios', (req, res) => EnvioController.listar(req, res));
app.get('/api/envios/:id', (req, res) => EnvioController.obtenerEnvio(req, res));
app.put('/api/envios/:id/avanzar', (req, res) => EnvioController.avanzarEstado(req, res));
app.put('/api/envios/:id/devolver', (req, res) => EnvioController.devolverEstado(req, res));
app.put('/api/envios/:id/marcar-fallido', (req, res) => EnvioController.marcarFallido(req, res));

// Tracking
app.get('/api/tracking/:id', (req, res) => TrackingEnvioController.obtenerTracking(req, res));
app.post('/api/tracking/:id/evento', (req, res) => TrackingEnvioController.registrarEvento(req, res));

// Bodegas
app.post('/api/bodegas', (req, res) => BodegaController.crear(req, res));
app.get('/api/bodegas', (req, res) => BodegaController.listar(req, res));
app.get('/api/bodegas/:id', (req, res) => BodegaController.obtener(req, res));
app.post('/api/bodegas/:id/ingreso', (req, res) => BodegaController.ingresoEnvio(req, res));
app.post('/api/bodegas/:id/salida', (req, res) => BodegaController.salidaEnvio(req, res));
app.get('/api/bodegas/:id/inventario', (req, res) => BodegaController.inventario(req, res));

// Manifiestos
app.post('/api/manifiestos', (req, res) => ManifiestoCargaController.crear(req, res));
app.get('/api/manifiestos', (req, res) => ManifiestoCargaController.listar(req, res));
app.get('/api/manifiestos/:id', (req, res) => ManifiestoCargaController.obtener(req, res));
app.post('/api/manifiestos/:id/asociar', (req, res) => ManifiestoCargaController.asociarEnvio(req, res));
app.post('/api/manifiestos/:id/desasociar', (req, res) => ManifiestoCargaController.desasociarEnvio(req, res));

// ========== API PAGOS Y FACTURACIÓN ==========
app.post('/api/pagos', (req, res) => PagoController.registrarPago(req, res));
app.get('/api/pagos/:id', (req, res) => PagoController.obtenerPago(req, res));
app.put('/api/pagos/:id/validar', (req, res) => PagoController.aprobarPago(req, res));
app.put('/api/pagos/:id/rechazar', (req, res) => PagoController.rechazarPago(req, res));
app.get('/api/pagos', (req, res) => PagoController.listar(req, res));

app.post('/api/facturas', (req, res) => FacturaController.crearFactura(req, res));
app.get('/api/facturas/cliente/:idCliente', (req, res) => FacturaController.facturasPorCliente(req, res));
app.get('/api/facturas/:id', (req, res) => FacturaController.obtenerFactura(req, res));
app.put('/api/facturas/:id/anular', (req, res) => FacturaController.anularFactura(req, res));

app.post('/api/seguros', (req, res) => SeguroEnvioController.crear(req, res));
app.get('/api/seguros/:id', (req, res) => SeguroEnvioController.obtener(req, res));
app.put('/api/seguros/:id', (req, res) => SeguroEnvioController.actualizar(req, res));

// ========== API PASAJEROS ==========
// Reservas
app.post('/api/reservas', (req, res) => ReservaTiqueteController.crearReserva(req, res));
app.get('/api/reservas/:id', (req, res) => ReservaTiqueteController.obtenerReserva(req, res));
app.post('/api/reservas/:id/confirmar', (req, res) => ReservaTiqueteController.confirmarReserva(req, res));
app.delete('/api/reservas/:id', (req, res) => ReservaTiqueteController.cancelarReserva(req, res));
app.get('/api/reservas', (req, res) => ReservaTiqueteController.listar(req, res));

// Tiquetes
app.post('/api/tiquetes', (req, res) => TiqueteController.crearTiquete(req, res));
app.get('/api/tiquetes/cliente/:idCliente', (req, res) => TiqueteController.historialCliente(req, res));
app.get('/api/tiquetes/:id', (req, res) => TiqueteController.obtenerTiquete(req, res));
app.put('/api/tiquetes/:id/anular', (req, res) => TiqueteController.anularTiquete(req, res));
app.put('/api/tiquetes/:id/usar', (req, res) => TiqueteController.marcarUsado(req, res));
app.get('/api/tiquetes', (req, res) => TiqueteController.listar(req, res));

// Equipaje
app.post('/api/equipaje/:idTiquete', (req, res) => EquipajeController.registrarEquipaje(req, res));
app.get('/api/equipaje/tiquete/:idTiquete', (req, res) => EquipajeController.listarEquipajes(req, res));
app.delete('/api/equipaje/:idEquipaje', (req, res) => EquipajeController.eliminarEquipaje(req, res));

// ========== API ATENCIÓN AL CLIENTE ==========
app.post('/api/pqrs', (req, res) => PqrsController.registrarPQRS(req, res));
app.get('/api/pqrs', (req, res) => PqrsController.listar(req, res));
app.get('/api/pqrs/:id', (req, res) => PqrsController.obtenerPQRS(req, res));
app.post('/api/pqrs/:id/responder', (req, res) => PqrsController.registrarRespuesta(req, res));
app.put('/api/pqrs/:id/cerrar', (req, res) => PqrsController.cerrarPQRS(req, res));

app.get('/api/notificaciones/usuario/:idUsuario', (req, res) => NotificacionController.listarPorUsuario(req, res));
app.get('/api/notificaciones/:id', (req, res) => NotificacionController.obtener(req, res));
app.put('/api/notificaciones/:id/leer', (req, res) => NotificacionController.marcarLeida(req, res));

// ========== API CARRITO Y COMPRAS ==========
app.post('/api/carrito', (req, res) => CarritoController.crearCarrito(req, res));
app.get('/api/carrito/:id', (req, res) => CarritoController.obtenerCarrito(req, res));
app.post('/api/carrito/:id/agregar-tiquete', (req, res) => CarritoController.agregarTiquete(req, res));
app.post('/api/carrito/:id/agregar-envio', (req, res) => CarritoController.agregarEnvio(req, res));
app.post('/api/carrito/:id/guardar', (req, res) => CarritoController.guardarSnapshot(req, res));
app.post('/api/carrito/:id/undo', (req, res) => CarritoController.deshacer(req, res));
app.post('/api/carrito/:id/redo', (req, res) => CarritoController.rehacer(req, res));

app.post('/api/compras/ejecutar-tiquete', (req, res) => ProcesoCompraController.ejecutarCompraTiquete(req, res));
app.post('/api/compras/ejecutar-envio', (req, res) => ProcesoCompraController.ejecutarCompraEnvio(req, res));

// ========== MANEJO DE ERRORES ==========
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Sirviendo archivos estáticos desde: ${path.join(__dirname, 'public')}`);
});

export default app;