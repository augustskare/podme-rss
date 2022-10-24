export type RouteArgs = { pattern: URLPatternResult; request: Request };
type RouteHandler = (args: RouteArgs) => Promise<Response>;
type Routes = Map<URLPatternInput, RouteHandler>;

export async function router(request: Request, routes: Routes) {
  const routingMap: Map<URLPattern, RouteHandler> = new Map();
  for (const [pattern, handler] of routes) {
    const compiledPattern = new URLPattern(pattern);
    routingMap.set(compiledPattern, handler);
  }

  try {
    for (const [compiledPattern, handler] of routingMap) {
      const result = compiledPattern.exec(request.url);
      if (result) {
        return await handler({ pattern: result, request });
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
