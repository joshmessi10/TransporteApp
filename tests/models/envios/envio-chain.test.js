// tests/models/envios/envio-chain.test.js
import assert from 'assert';
import { Envio } from '../../../models/envios/index.js';
import {
  buildEnvioValidationChain,
  validarYCrearEnvio
} from '../../../models/envios/chain/EnvioValidationPipeline.js';

(function testChainOfResponsibilityEnvio() {
  console.log('=== INICIO TEST Chain of Responsibility Envio ===');

  // --------- Caso 1: DTO válido ---------
  const dtoValido = {
    codigoRastreo: 'ENV-CHAIN-001',
    tipoEnvio: 'PAQUETE',
    idRemitente: 10,
    idDestinatario: 20,
    origenSedeId: 100,
    destinoSedeId: 200,
    pesoKg: 5,
    altoCm: 30,
    anchoCm: 20,
    largoCm: 15,
    valorDeclarado: 150000,
    tipoServicio: 'CONTRAENTREGA'
  };

  console.log('\n--- DTO válido inicial ---');
  console.log(JSON.stringify(dtoValido, null, 2));

  const resultadoValido = validarYCrearEnvio(dtoValido);

  console.log('\n--- Resultado después de validarYCrearEnvio (DTO válido) ---');
  console.log(JSON.stringify(resultadoValido, null, 2));

  assert.strictEqual(resultadoValido.ok, true);
  assert.ok(resultadoValido.dto.tarifaCalculada > 0);
  assert.strictEqual(resultadoValido.dto.coberturaOk, true);
  assert.strictEqual(resultadoValido.dto.recomendarSeguro, true);
  assert.strictEqual(resultadoValido.dto.notificacionProgramada, true);
  assert.ok(resultadoValido.envio instanceof Envio);

  // --------- Caso 2: DTO inválido (sin destinatario, peso <= 0) ---------
  const dtoInvalido = {
    codigoRastreo: 'ENV-CHAIN-002',
    tipoEnvio: 'PAQUETE',
    idRemitente: 10,
    idDestinatario: null,   // error
    origenSedeId: 100,
    destinoSedeId: 100,     // error: misma sede
    pesoKg: 0,              // error
    altoCm: 0,              // error
    anchoCm: -5,            // error
    largoCm: 0,             // error
    valorDeclarado: 50000,
    tipoServicio: 'ESTANDAR'
  };

  console.log('\n--- DTO inválido inicial ---');
  console.log(JSON.stringify(dtoInvalido, null, 2));

  const errores = [];
  const context = { dto: { ...dtoInvalido }, errores, envio: null };

  const chain = buildEnvioValidationChain();
  chain.handle(context);

  console.log('\n--- Context después de ejecutar chain.handle (DTO inválido) ---');
  console.log(JSON.stringify(context, null, 2));

  assert.ok(errores.length > 0);
  assert.strictEqual(context.envio, null);

  const resultadoInvalido = validarYCrearEnvio(dtoInvalido);

  console.log('\n--- Resultado de validarYCrearEnvio (DTO inválido) ---');
  console.log(JSON.stringify(resultadoInvalido, null, 2));

  assert.strictEqual(resultadoInvalido.ok, false);
  assert.ok(resultadoInvalido.errores.length > 0);
  assert.strictEqual(resultadoInvalido.envio, null);

  console.log('\n✔ tests Chain of Responsibility Envio OK');
  console.log('=== FIN TEST Chain of Responsibility Envio ===\n');
})();
