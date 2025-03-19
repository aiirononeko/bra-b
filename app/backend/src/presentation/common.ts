import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTPException } from "hono/http-exception";
import { getReasonPhrase } from "http-status-codes";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import type * as schema from "../db/schema";
import type { Env } from "../types";

type Variables = {
  db: DrizzleD1Database<typeof schema>;
  user?: { id: string };
};

export const buildHono = () => new Hono<{ Bindings: Env; Variables: Variables }>();

export type ContextVariables = { user: { id: string } };

export const errThrowHelper = (status: number, message: string) => {
  return new HTTPException(status as ContentfulStatusCode, {
    res: Response.json({ code: getReasonPhrase(status), message }, { status }),
  });
};
