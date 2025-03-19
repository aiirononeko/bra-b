import { describe, expect, it, vi } from "vitest";

// グローバルに型を定義
global.describe = describe;
global.it = it;
global.expect = expect;
global.vi = vi;

// Cloudflare D1のモック
vi.mock("drizzle-orm/d1", () => {
  return {
    drizzle: vi.fn(() => ({
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => []),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(() => []),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => []),
        })),
      })),
    })),
  };
});
