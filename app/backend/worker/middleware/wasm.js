import { initWasm } from "../utils/wasm.js";

/**
 * WebAssembly初期化ミドルウェア
 * リクエスト処理前にWebAssemblyを初期化します
 */
export const wasmMiddleware = async (c, next) => {
  try {
    const initialized = await initWasm();
    if (!initialized) {
      console.warn("WebAssembly initialization failed, continuing without WebAssembly support");
      // Contextオブジェクトに初期化状態を設定
      c.set("wasmInitialized", false);
    } else {
      c.set("wasmInitialized", true);
    }
  } catch (err) {
    console.error("Failed to initialize WebAssembly:", err);
    // エラーが発生しても処理を続行
    c.set("wasmInitialized", false);
    c.set("wasmError", err.message);
  }

  // 常に次のミドルウェアへ処理を渡す
  await next();
};
