// Cloudflare Workers エントリーポイント
import wasm_exec from "./wasm/wasm_exec.js";
const { Go } = wasm_exec;

// WebAssemblyモジュールをグローバル変数として初期化
let wasmInstance;

async function initWasm() {
  if (wasmInstance) return;

  try {
    // WebAssemblyモジュールを取得
    const wasmResponse = await fetch(new URL("./wasm/main.wasm", import.meta.url));
    const wasmBytes = await wasmResponse.arrayBuffer();

    // Goランタイムを初期化
    const go = new Go();

    // WebAssemblyモジュールをインスタンス化
    const { instance } = await WebAssembly.instantiate(wasmBytes, go.importObject);
    wasmInstance = instance;

    // Goプログラムを実行
    go.run(instance);
    console.log("WebAssembly module initialized");
  } catch (err) {
    console.error("Failed to initialize WebAssembly:", err);
  }
}

export default {
  async fetch(request, env, ctx) {
    // WebAssemblyモジュールを初期化試行
    try {
      await initWasm();
    } catch (err) {
      console.warn("Failed to initialize WebAssembly, falling back to JS implementation:", err);
    }

    // リクエストURLのパスを取得
    const url = new URL(request.url);
    const path = url.pathname;

    // Hello World エンドポイント
    if (path === "/" || path === "/api/hello") {
      // WebAssemblyが初期化されていればそちらを使用する
      let message = "Hello, World from Cloudflare Worker!";

      if (wasmInstance && typeof getHelloMessage === "function") {
        try {
          const result = getHelloMessage();
          message = result.message || message;
        } catch (err) {
          console.error("Error calling WebAssembly function:", err);
        }
      }

      // レスポンスを返す
      return new Response(JSON.stringify({ message }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // 404 Not Found
    return new Response("Not Found", { status: 404 });
  },
};
