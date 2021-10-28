import type { AuthResponse } from "./podme.ts";

async function request<ReqResponse>(
  path: string,
  options?: RequestInit,
  auth?: AuthResponse,
): Promise<ReqResponse> {
  const url = new URL(path, "https://api.podme.com/");
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (auth !== undefined) {
    headers.set("Authorization", `${auth.token_type} ${auth.access_token}`);
  }

  const response = await fetch(url, { ...options, headers });
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

function authorization(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization !== null) {
    const basicauth = authorization.match(/^Basic\s+(.*)$/);
    if (basicauth) {
      const [email, password] = atob(basicauth[1]).split(":");
      return { email, password };
    }
  }

  throw new Response("", { status: 401 });
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

export { authorization, errorHandler, request, router };
