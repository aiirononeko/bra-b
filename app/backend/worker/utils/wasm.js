import wasm_exec from "../../wasm/wasm_exec.js";
const { Go } = wasm_exec;

// WebAssemblyのバイナリを直接インポート
import wasmModule from "../../wasm/main.wasm";

let wasmInstance;

export async function initWasm() {
  if (wasmInstance) return true;

  try {
    console.log("Initializing WebAssembly from imported module");

    const go = new Go();

    // インポートしたバイナリを直接使用
    const { instance } = await WebAssembly.instantiate(wasmModule, go.importObject);
    wasmInstance = instance;
    go.run(instance);
    console.log("WebAssembly module initialized successfully");
    return true;
  } catch (err) {
    console.error("Failed to initialize WebAssembly:", err);

    // 失敗した場合は、以前のfetchメソッドを代替として使用
    try {
      // 直接パスを指定してロード
      const wasmPath = "../../wasm/main.wasm";
      console.log(`Trying to load WebAssembly directly from: ${wasmPath}`);

      // Goオブジェクトを再作成
      const go = new Go();
      const { instance } = await WebAssembly.instantiate(wasmModule, go.importObject);
      wasmInstance = instance;
      go.run(instance);
      console.log("WebAssembly module initialized successfully via fallback method");
      return true;
    } catch (fallbackErr) {
      console.error("Fallback method also failed:", fallbackErr);
      return false;
    }
  }
}

export function callWasmFunction(funcName, ...args) {
  // WebAssemblyが初期化されていない場合は早期リターン
  if (!wasmInstance) {
    console.warn(`WebAssembly is not initialized, function ${funcName} cannot be called`);
    return {
      error: "WebAssembly not initialized",
      message: `Function ${funcName} is not available because WebAssembly module is not initialized`,
    };
  }

  // グローバルとselfの両方をチェック
  const func = global[funcName] || self[funcName];
  if (!func || typeof func !== "function") {
    console.warn(`WebAssembly function ${funcName} is not available`);
    return {
      error: "Function not available",
      message: `WebAssembly function ${funcName} is not available in the current context`,
    };
  }

  try {
    return func(...args);
  } catch (err) {
    console.error(`Error calling WebAssembly function ${funcName}:`, err);
    return {
      error: "Function execution failed",
      message: err.message,
    };
  }
}
