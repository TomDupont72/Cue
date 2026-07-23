import fp from "fastify-plugin";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../shared/lib/auth.js";
import { unauthorized } from "../../shared/errors/errors.helpers.js";
async function authGuardPlugin(app) {
    app.decorate("requireAuth", async (request) => {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(request.headers)
        });
        if (!session?.session?.userId) {
            throw unauthorized("You must be logged in");
        }
        request.user = {
            id: session.session.userId
        };
    });
}
export const authGuard = fp(authGuardPlugin, {
    name: "auth-guard"
});
