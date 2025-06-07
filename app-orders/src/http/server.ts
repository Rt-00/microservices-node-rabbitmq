import { fastifyCors } from "@fastify/cors";
import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { channels } from "../broker/channels/index.ts";
import { db } from "../db/client.ts";
import { schema } from "../db/schema/index.ts";
import { dispatchOrderCreated } from "../broker/messages/order-created.ts";

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

app.post(
  "/orders",
  {
    schema: {
      body: z.object({
        amount: z.coerce.number(),
      }),
    },
  },
  async (request, reply) => {
    const { amount } = request.body;

    console.log(`Creating an Order with amount: ${amount}`);

    const orderId = randomUUID();

    dispatchOrderCreated({
      orderId,
      amount,
      customer: {
        id: "2b530602-e2f5-4fe3-97e6-4495afb7028a",
      },
    });

    try {
      await db.insert(schema.orders).values({
        id: orderId,
        customerId: "2b530602-e2f5-4fe3-97e6-4495afb7028a",
        amount,
      });
    } catch (error) {
      console.log(error);
    }

    return reply.status(201).send();
  }
);

app.listen({ host: "0.0.0.0", port: 3333 }).then(() => {
  console.log("[ORDERS] HTTP Server running!");
});
