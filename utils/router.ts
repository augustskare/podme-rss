import { serve } from "https://deno.land/std@0.159.0/http/server.ts";

export type RouteArgs = { pattern: URLPatternResult; request: Request };
type RouteHandler = (args: RouteArgs) => Promise<Response>;
type Routes = [URLPatternInput, RouteHandler][];

export async function router(routes: Routes) {
  await serve((request) => handler(request, routes));
}

async function handler(request: Request, routes: Routes): Promise<Response> {
  const routingMap: Map<URLPattern, RouteHandler> = new Map();
  routes.forEach(([pattern, fn]) => {
    const compiledPattern = new URLPattern(pattern);
    routingMap.set(compiledPattern, fn);
  });

  try {
    for (const [compiledPattern, fn] of routingMap) {
      const result = compiledPattern.exec(request.url);
      if (result) {
        return await fn({ pattern: result, request });
      }
    }
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    return new Response("Server error", { status: 500 });
  }

  return new Response("Not found", { status: 404 });
}
