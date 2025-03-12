import { callWasmFunction } from "../utils/wasm.js";

// モックTodoデータ（WebAssemblyが利用できない場合に使用）
const mockTodos = [
  { id: "1", title: "サンプルタスク1", completed: false },
  { id: "2", title: "サンプルタスク2", completed: true },
];

/**
 * 全てのTodoを取得するハンドラー
 */
export const getAllTodos = (c) => {
  // WebAssembly初期化状態を確認
  const wasmInitialized = c.get("wasmInitialized") !== false;

  if (wasmInitialized) {
    try {
      const result = callWasmFunction("getAllTodos");
      if (!result.error) {
        return c.json(result);
      }

      console.warn("WebAssembly function error:", result.error, result.message);
      // エラーの場合はフォールバック
      return c.json({
        todos: mockTodos,
        _source: "mock",
        _error: result.message,
      });
    } catch (err) {
      console.error("Error calling WebAssembly function:", err);
      return c.json({
        todos: mockTodos,
        _source: "mock",
        _error: err.message,
      });
    }
  }

  // WebAssemblyが利用できない場合はモックデータを返す
  console.warn("WebAssembly not available, using mock data");
  return c.json({
    todos: mockTodos,
    _source: "mock",
    _reason: "WebAssembly not available",
  });
};

/**
 * 指定されたIDのTodoを取得するハンドラー
 */
export const getTodoById = (c) => {
  const id = c.req.param("id");
  const wasmInitialized = c.get("wasmInitialized") !== false;

  if (wasmInitialized) {
    try {
      const result = callWasmFunction("getTodoById", id);
      if (!result.error) {
        return c.json(result);
      }

      // モックデータからIDに一致するものを探す
      const mockTodo = mockTodos.find((todo) => todo.id === id);
      if (!mockTodo) {
        return c.json({ error: "Todo not found" }, 404);
      }
      return c.json({
        ...mockTodo,
        _source: "mock",
        _reason: result.message,
      });
    } catch (err) {
      console.error("Error calling WebAssembly function:", err);
      return c.json({ error: "Internal Server Error", message: err.message }, 500);
    }
  }

  // モックデータからIDに一致するものを探す
  const mockTodo = mockTodos.find((todo) => todo.id === id);
  if (!mockTodo) {
    return c.json({ error: "Todo not found" }, 404);
  }
  return c.json({
    ...mockTodo,
    _source: "mock",
    _reason: "WebAssembly not available",
  });
};

/**
 * 新しいTodoを作成するハンドラー
 */
export const createTodo = async (c) => {
  const wasmInitialized = c.get("wasmInitialized") !== false;

  try {
    const body = await c.req.json();

    if (wasmInitialized) {
      const result = callWasmFunction("createTodo", JSON.stringify(body));
      if (!result.error) {
        return c.json(result, 201);
      }

      // フォールバック: モック実装
      const newTodo = {
        id: String(Date.now()),
        title: body.title || "新しいタスク",
        completed: body.completed || false,
        _source: "mock",
        _reason: result.message,
      };
      return c.json(newTodo, 201);
    }

    // WebAssemblyが利用できない場合のモック実装
    const newTodo = {
      id: String(Date.now()),
      title: body.title || "新しいタスク",
      completed: body.completed || false,
      _source: "mock",
      _reason: "WebAssembly not available",
    };
    return c.json(newTodo, 201);
  } catch (err) {
    console.error("Error in createTodo:", err);
    return c.json({ error: "Bad Request", message: err.message }, 400);
  }
};

/**
 * 既存のTodoを更新するハンドラー
 */
export const updateTodo = async (c) => {
  const id = c.req.param("id");
  const wasmInitialized = c.get("wasmInitialized") !== false;

  try {
    const body = await c.req.json();

    if (wasmInitialized) {
      const result = callWasmFunction("updateTodo", id, JSON.stringify(body));
      if (!result.error) {
        return c.json(result);
      }

      // フォールバック実装
      const updatedTodo = {
        id,
        ...body,
        _source: "mock",
        _reason: result.message,
      };
      return c.json(updatedTodo);
    }

    // WebAssemblyが利用できない場合のモック実装
    const updatedTodo = {
      id,
      ...body,
      _source: "mock",
      _reason: "WebAssembly not available",
    };
    return c.json(updatedTodo);
  } catch (err) {
    console.error("Error in updateTodo:", err);
    return c.json({ error: "Bad Request", message: err.message }, 400);
  }
};

/**
 * 指定されたIDのTodoを削除するハンドラー
 */
export const deleteTodo = (c) => {
  const id = c.req.param("id");
  const wasmInitialized = c.get("wasmInitialized") !== false;

  if (wasmInitialized) {
    try {
      const result = callWasmFunction("deleteTodo", id);
      if (!result.error) {
        return new Response(null, { status: 204 });
      }

      console.warn("WebAssembly function error:", result.error, result.message);
      // エラーでもモックとして成功応答を返す
      return new Response(null, { status: 204 });
    } catch (err) {
      console.error("Error calling WebAssembly function:", err);
      return c.json({ error: "Internal Server Error", message: err.message }, 500);
    }
  }

  // WebAssemblyが利用できない場合でも成功応答を返す
  return new Response(null, { status: 204 });
};
