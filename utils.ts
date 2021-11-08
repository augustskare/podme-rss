async function request<ReqResponse>(
  path: string,
  options?: RequestInit,
): Promise<ReqResponse> {
  const url = new URL(path, "https://api.podme.com/");

  const response = await fetch(url, options);
  if (response.ok) {
    return response.json();
  }
  throw response;
}

function errorHandler(status?: number) {
  if (status === 404) {
    return new Response("Not found", {
      status: 404,
      statusText: "Not found",
    });
  }

  return new Response("401 Unauthorized", {
    status: 401,
    statusText: "Unauthorized",
    headers: {
      "www-authenticate": `Basic realm="podme-rss"`,
    },
  });
}

type RouteHandler = (
  pattern: URLPatternResult,
  req: Request,
) => Promise<Response>;
type Routes = Map<URLPatternInput, RouteHandler>;

function router(request: Request, routes: Routes) {
  const routingMap = new Map();
  for (const [pattern, handler] of routes) {
    const compiledPattern = new URLPattern(pattern);
    routingMap.set(compiledPattern, handler);
  }

  for (const [compiledPattern, handler] of routingMap) {
    const result = compiledPattern.exec(request.url);
    if (result) {
      return handler(result, request);
    }
  }
  return errorHandler(404);
}

export { errorHandler, request, router };
