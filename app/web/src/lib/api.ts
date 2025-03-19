import { hc } from "hono/client";
import type { AppType } from "../../../backend/src/presentation/app";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";
export const apiClient = hc<AppType>(baseUrl);
