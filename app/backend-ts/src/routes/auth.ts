import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createAuthService } from "../factories/service-factory.js";

const authRoutes = new Hono();
const authService = createAuthService();

// メールリンク認証
const magicLinkSchema = z.object({
  email: z.string().email(),
});

authRoutes.post("/magic-link", zValidator("json", magicLinkSchema), async (c) => {
  const { email } = c.req.valid("json");

  await authService.registerWithEmail(email);

  return c.json({ message: "Magic link sent successfully" }, 200);
});

// Google認証
const googleAuthSchema = z.object({
  token: z.string(),
});

authRoutes.post("/google", zValidator("json", googleAuthSchema), async (c) => {
  const { token } = c.req.valid("json");

  const jwtToken = await authService.authenticateWithGoogle(token);

  return c.json({ token: jwtToken }, 200);
});

export { authRoutes };
