import fp from "fastify-plugin";
import bearerAuth from "@fastify/bearer-auth";
import { env } from "../../shared/config/env.js";
async function workerGuardPlugin(app) {
    const workerToken = env.WORKER_TOKEN;
    if (!workerToken) {
        throw new Error("WORKER_TOKEN is required");
    }
    await app.register(bearerAuth, {
        addHook: false,
        keys: new Set([workerToken])
    });
    app.decorate("requireWorker", async (request, reply) => {
        await new Promise((resolve, reject) => {
            app.verifyBearerAuth(request, reply, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
        request.worker = { isWorker: true };
    });
}
export const workerGuard = fp(workerGuardPlugin, {
    name: "worker-guard"
});
