import { renderToString } from "preact/render-to-string";

type Routes = [URLPatternInput, RouteModule][];
type RouteModule = {
  default: (props: PageProps) => preact.JSX.Element;
  loader?: (
    args: LoaderArgs,
  ) => Response | Promise<Response> | object | Promise<object>;
  headers?: Record<string, string>;
};
export type LoaderArgs = {
  request: Request;
  params: URLPatternComponentResult["groups"];
  context: { db: Deno.Kv };
};
// deno-lint-ignore no-explicit-any
export interface PageProps<T = any> {
  data: T;
  url: URL;
}

export async function router(routes: Routes) {
  const db = await Deno.openKv();
  const server = Deno.serve((request) => handler(request, routes, db));
  server.finished.then(() => db.close());
}

async function handler(
  request: Request,
  routes: Routes,
  db: Deno.Kv,
): Promise<Response> {
  const routingMap: Map<URLPattern, RouteModule> = new Map();
  routes.forEach(([pattern, fn]) => {
    const compiledPattern = new URLPattern(pattern);
    routingMap.set(compiledPattern, fn);
  });

  try {
    for (const [compiledPattern, fn] of routingMap) {
      const result = compiledPattern.exec(request.url);
      if (result) {
        const params = result.pathname.groups;
        const loader = await fn?.loader?.({ request, params, context: { db } });
        let data = loader;
        if (loader instanceof Response) {
          data = await loader.json();
        }

        const View = fn.default;
        const document = renderToString(
          <View data={data} url={new URL(request.url)} />,
        );
        const headers = new Headers(
          fn.headers || { "content-type": "text/html" },
        );

        let doctype = "<!DOCTYPE html>";
        if (headers.get("content-type") === "application/rss+xml") {
          doctype = '<?xml version="1.0" encoding="UTF-8"?>';
        }

        return new Response(doctype + document, {
          status: 200,
          headers,
        });
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
