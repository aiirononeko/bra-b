import { callWasmFunction } from "../utils/wasm.js";

/**
 * "Hello, World" メッセージを返すハンドラー
 */
export const getHello = (c) => {
  let message = "Hello, World from Cloudflare Worker!";

  // WebAssembly初期化状態を確認
  const wasmInitialized = c.get("wasmInitialized") !== false;

  if (wasmInitialized) {
    try {
      // WebAssembly関数が利用可能な場合は呼び出す
      const result = callWasmFunction("getHelloMessage");
      if (!result.error) {
        message = result || message;
      } else {
        console.warn("WebAssembly function error:", result.error, result.message);
      }
    } catch (err) {
      console.error("Error calling WebAssembly function:", err);
    }
  } else {
    // WebAssemblyが初期化されていない場合、フォールバックメッセージを使用
    const wasmError = c.get("wasmError") || "WebAssembly not initialized";
    console.warn(`Using fallback message because WebAssembly is not available: ${wasmError}`);
  }

  return c.json({
    message,
    wasmStatus: wasmInitialized ? "available" : "unavailable",
  });
};
