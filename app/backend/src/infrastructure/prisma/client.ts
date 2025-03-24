import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

import type { Env } from "../../types";

export const getPrismaClient = (env: Env) => {
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
};
