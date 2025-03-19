import { hc } from "hono/client";

import type { routes } from "./app";

type AppType = typeof routes;
const client = hc<AppType>("");
export type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client => hc<AppType>(...args);
