import { type ServerBuild, createRequestHandler } from "@remix-run/cloudflare";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { poweredBy } from "hono/powered-by";
// @ts-ignore This file won’t exist if it hasn’t yet been built
import * as build from "./build/server";
import { getLoadContext } from "./load-context";

// biome-ignore lint/suspicious/noExplicitAny: This is a Cloudflare Worker handler
const handleRemixRequest = createRequestHandler(build as any as ServerBuild);

const app = new Hono<{
  Bindings: {
    ENV_TEST: string;
  };
}>();

app.use(poweredBy());

app.use("*", async (c) => {
  const request = c.req.raw;
  const ctx = c.executionCtx;

  try {
    const loadContext = getLoadContext({
      request,
      context: {
        cloudflare: {
          // This object matches the return value from Wrangler's
          // `getPlatformProxy` used during development via Remix's
          // `cloudflareDevProxyVitePlugin`:
          // https://developers.cloudflare.com/workers/wrangler/api/#getplatformproxy
          cf: request.cf,
          ctx: {
            waitUntil: ctx.waitUntil.bind(ctx),
            passThroughOnException: ctx.passThroughOnException.bind(ctx),
          },
          caches,
          env: env(c),
        },
      },
    });
    return await handleRemixRequest(request, loadContext);
  } catch (error) {
    console.log(error);
    return new Response("An unexpected error occurred", { status: 500 });
  }
});

export default app;
