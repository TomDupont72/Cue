import { PatchScope } from "@/test/bdd/support/patch-scope.js";

export class TmdbDouble {
  readonly calls: URL[] = [];

  private responses = new Map<string, unknown>();

  respond(pathname: string, response: unknown) {
    this.responses.set(pathname, response);
  }

  install(scope: PatchScope) {
    scope.replace(
      globalThis,
      "fetch",
      async (input: string | URL | Request, init?: RequestInit) => {
        const request = input instanceof Request ? input : new Request(input, init);

        const url = new URL(request.url);
        const pathname = url.pathname.replace(/^\/3(?=\/)/, "");

        this.calls.push(url);

        if (!this.responses.has(pathname)) {
          throw new Error(`Unexpected TMDB request: ${url}`);
        }

        return Response.json(this.responses.get(pathname), { status: 200 });
      }
    );
  }
}
