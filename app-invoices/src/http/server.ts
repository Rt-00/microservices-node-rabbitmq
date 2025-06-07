import "../broker/subscriber.ts"

import { fastifyCors } from "@fastify/cors";
import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifyCors, { origin: "*" });

// Escalonamento horizontal
// Vai criando novas máquinas de acordo com a necessidade.

// Deploy: Blue-green deployment
// V1 no ar
// Deploy da Ver2 não posso matar a 1 pra subir a 2
// Ao fazer o deploy da Ver2 a estratégia de Blue-green
// vai bater na rota V1 até a V2 ficar operavel e ai sim começa a redirecional
// o trafego.

// Preciso de uma rota de Health cecker
app.get("/health", () => {
  return "OK";
});

app.listen({ host: "0.0.0.0", port: 3334 }).then(() => {
  console.log("[INVOICES] HTTP Server running!");
});
