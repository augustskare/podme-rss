/** @jsx h */
import { h, renderSSR } from "https://deno.land/x/nano_jsx@v0.0.20/mod.ts";
import { PodcastOverview } from "../podme.ts";

import { request } from "../utils.ts";
import Overview from "../templates/overview.tsx";

export async function index() {
  const data = await request<PodcastOverview>(
    "https://api.podme.com/web/api/v2/podcast/popular?podcastType=1&category=&page=0&pageSize=250",
  );
  return new Response("<!DOCTYPE html>" + renderSSR(<Overview data={data} />), {
    status: 200,
    headers: {
      "content-type": "text/html",
    },
  });
}
