import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth.js";
import { userRoutes } from "./routes/user.js";
import { baristaRoutes } from "./routes/barista.js";
import { evaluationRoutes } from "./routes/evaluation.js";
import { tipRoutes } from "./routes/tip.js";
import { favoriteRoutes } from "./routes/favorite.js";

const app = new Hono();

// ミドルウェア
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 86400,
  }),
);

// ルート
app.get("/", (c) => c.json({ message: "Welcome to bra-B API" }));
app.get("/health", (c) => c.json({ status: "ok" }));

// APIルート
app.route("/auth", authRoutes);
app.route("/user", userRoutes);
app.route("/baristas", baristaRoutes);
app.route("/evaluations", evaluationRoutes);
app.route("/tips", tipRoutes);
app.route("/favorites", favoriteRoutes);

const port = process.env.PORT || 3000;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});
