import { describe, it, expect } from "vitest";
import app from "../index";

// レスポンスデータの型を定義
interface HelloResponse {
  message: string;
  timestamp: string;
}

interface User {
  id: number;
  name: string;
  role: string;
  email?: string;
}

interface ErrorResponse {
  error: string;
  message?: string;
}

// テスト用のリクエストベース設定
const requestInit = {
  headers: {
    "host": "localhost",
  }
};

describe("API Routes", () => {
  // 環境変数が必要なルートエンドポイントのテストはスキップ
  // it.skip("should return welcome message with API version", async () => {});

  describe("GET /api/hello", () => {
    it("should return default hello message", async () => {
      const res = await app.request("/api/hello", requestInit);
      expect(res.status).toBe(200);
      
      const data = await res.json() as HelloResponse;
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("Hello, World!");
      expect(data).toHaveProperty("timestamp");
    });

    it("should return personalized hello message when name is provided", async () => {
      const res = await app.request("/api/hello?name=Vitest", requestInit);
      expect(res.status).toBe(200);
      
      const data = await res.json() as HelloResponse;
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("Hello, Vitest!");
      expect(data).toHaveProperty("timestamp");
    });
  });

  describe("GET /api/users", () => {
    it("should return list of users", async () => {
      const res = await app.request("/api/users", requestInit);
      expect(res.status).toBe(200);
      
      const data = await res.json() as User[];
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty("id");
      expect(data[0]).toHaveProperty("name");
      expect(data[0]).toHaveProperty("role");
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return user details for valid user id", async () => {
      const res = await app.request("/api/users/1", requestInit);
      expect(res.status).toBe(200);
      
      const data = await res.json() as User;
      expect(data).toHaveProperty("id", 1);
      expect(data).toHaveProperty("name");
      expect(data).toHaveProperty("email");
      expect(data).toHaveProperty("role");
    });

    it("should return 404 for invalid user id", async () => {
      const res = await app.request("/api/users/999", requestInit);
      expect(res.status).toBe(404);
      
      const data = await res.json() as ErrorResponse;
      expect(data).toHaveProperty("error");
      expect(data.error).toBe("User not found");
    });
  });

  describe("404 handler", () => {
    it("should return 404 for non-existent routes", async () => {
      const res = await app.request("/non-existent-route", requestInit);
      expect(res.status).toBe(404);
      
      const data = await res.json() as ErrorResponse;
      expect(data).toHaveProperty("error");
      expect(data.error).toBe("Not Found");
      expect(data).toHaveProperty("message");
    });
  });
});
