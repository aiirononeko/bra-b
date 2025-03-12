#!/bin/bash

# ビルドスクリプト - Goコードを WebAssembly にコンパイル

echo "Building Go code to WebAssembly..."

# 標準のGoコンパイラを使用してWebAssemblyにコンパイル
mkdir -p wasm
GOOS=js GOARCH=wasm go build -o wasm/main.wasm ./src/main_wasm.go

# wasm_exec.jsファイルの検索と配置
GOROOT=$(go env GOROOT)
WASM_EXEC_PATH="${GOROOT}/lib/wasm/wasm_exec.js"

if [ -f "$WASM_EXEC_PATH" ]; then
  echo "Copying wasm_exec.js from ${WASM_EXEC_PATH}"
  cp "$WASM_EXEC_PATH" ./wasm/wasm_exec.js.original
  
  # ファイルをES Module形式に変換
  echo "Converting wasm_exec.js to ES Module format"
  cat > ./wasm/wasm_exec.js << EOF
// Modified version of Go's wasm_exec.js for Cloudflare Workers
// Original source: $WASM_EXEC_PATH

// Globalsの設定
globalThis.global = globalThis;
globalThis.process = { 
  argv: [], env: {}, 
  platform: "cloudflare-worker",
  exit: (code) => { console.log("Exit with code:", code); }
};
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

// Go ランタイムのインポート
$(cat "$WASM_EXEC_PATH")

// ES Moduleとしてエクスポート
export default { Go };
EOF
  
else
  echo "Warning: wasm_exec.js not found at ${WASM_EXEC_PATH}"
  echo "Creating an empty wasm_exec.js file. You may need to manually copy the correct file later."
  touch ./wasm/wasm_exec.js
fi

echo "WebAssembly build complete."
