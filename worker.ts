import handle from "hono-remix-adapter/cloudflare-workers";
// @ts-ignore This file won’t exist if it hasn’t yet been built
import * as build from "./build/server";
import { getLoadContext } from "./load-context";
import server from "./server";

export default handle(build, server, { getLoadContext });
