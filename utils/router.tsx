import { renderToString } from "preact/render-to-string";

type Routes = [URLPatternInput, RouteModule][];
type RouteModule = {
  default: (props: PageProps) => preact.JSX.Element;
  loader?: (args: LoaderArgs) => Response | Promise<Response>;
  headers?: Record<string, string>;
};
export type LoaderArgs = {
  request: Request;
  params: URLPatternComponentResult["groups"];
};
// deno-lint-ignore no-explicit-any
export interface PageProps<T = any> {
  data: T;
  url: URL;
}

export function router(routes: Routes) {
  Deno.serve((request) => handler(request, routes));
}

async function handler(request: Request, routes: Routes): Promise<Response> {
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
        const loader = await fn?.loader?.({ request, params });
        let data = undefined;
        if (loader) {
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
