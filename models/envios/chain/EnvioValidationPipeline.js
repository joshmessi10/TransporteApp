// models/envios/chain/EnvioValidationPipeline.js
import ValidarDatosBasicosHandler from './ValidarDatosBasicosHandler.js';
import ValidarPesoYDimensionesHandler from './ValidarPesoYDimensionesHandler.js';
import CalcularTarifaHandler from './CalcularTarifaHandler.js';
import ValidarCoberturaRutaHandler from './ValidarCoberturaRutaHandler.js';
import SeguroOpcionalHandler from './SeguroOpcionalHandler.js';
import NotificarClienteHandler from './NotificarClienteHandler.js';
import Envio from '../Envio.js';

export function buildEnvioValidationChain() {
  const h1 = new ValidarDatosBasicosHandler();
  const h2 = new ValidarPesoYDimensionesHandler();
  const h3 = new CalcularTarifaHandler();
  const h4 = new ValidarCoberturaRutaHandler();
  const h5 = new SeguroOpcionalHandler();
  const h6 = new NotificarClienteHandler();

  h1.setNext(h2).setNext(h3).setNext(h4).setNext(h5).setNext(h6);
  return h1; // head de la cadena
}

/**
 * Helper de alto nivel:
 * - Ejecuta la cadena de validación
 * - Si no hay errores, instancia un Envio
 */
export function validarYCrearEnvio(envioDTO) {
  const errores = [];
  const context = { dto: { ...envioDTO }, errores, envio: null };

  const chain = buildEnvioValidationChain();
  chain.handle(context);

  if (errores.length > 0) {
    return { ok: false, errores, dto: context.dto, envio: null };
  }

  const envio = new Envio({
    ...context.dto,
    idEnvio: context.dto.idEnvio ?? Date.now(),
    estado: 'REGISTRADO'
  });

  context.envio = envio;
  return { ok: true, errores: [], dto: context.dto, envio };
}
