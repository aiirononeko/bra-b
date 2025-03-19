import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTPException } from "hono/http-exception";
import { getReasonPhrase } from "http-status-codes";
import type { PrismaClient } from "@prisma/client";

import type { Env } from "../types";

// better-authの型定義
export type BetterAuthInstance = {
  handler: (request: Request) => Promise<Response>;
  api: {
    getSession: (options: unknown) => Promise<unknown>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type Variables = {
  db: PrismaClient;
  user?: { id: string };
  auth?: BetterAuthInstance;
  env: string;
};

export const buildHono = () => new Hono<{ Bindings: Env; Variables: Variables }>();

export type ContextVariables = { user: { id: string } };

export const errThrowHelper = (status: number, message: string) => {
  return new HTTPException(status as ContentfulStatusCode, {
    res: Response.json({ code: getReasonPhrase(status), message }, { status }),
  });
};
