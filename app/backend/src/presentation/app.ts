import { timing } from "hono/timing";
import { logger } from "hono/logger";
import { etag } from "hono/etag";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/d1";

import { buildHono } from "./common";
import * as schema from "../db/schema";
import { authMiddleware } from "./middlewares/auth";
import { errorHandler } from "./middlewares/errors";

import baristaRoutes from "./routes/barista-routes";

const app = buildHono().basePath("/");
app.use("*", cors());
app.use("*", logger());
app.use("*", timing());
app.get("/health", (c) => c.json({ status: "UP" }));
app.use("*", authMiddleware);
app.use("*", etag({ weak: true }));

app.use("*", async (c, next) => {
  // DB接続の初期化
  c.set("db", drizzle(c.env.DB, { schema }));

  await next();
});

const routes = app.route("/baristas", baristaRoutes).onError(errorHandler);

export { app, routes };
