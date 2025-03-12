package presentations

import (
	"net/http"

	"github.com/aiirononeko/bra-b/app/backend/src/queries"
	"github.com/aiirononeko/bra-b/app/backend/src/workflows"
	"github.com/labstack/echo/v4"
)

// TodoHandler はTodoに関するHTTPリクエストを処理するハンドラーです
type TodoHandler struct {
	todoQuery    *queries.TodoQuery
	todoWorkflow *workflows.TodoWorkflow
}

// NewTodoHandler は新しいTodoHandlerを作成します
func NewTodoHandler(todoQuery *queries.TodoQuery, todoWorkflow *workflows.TodoWorkflow) *TodoHandler {
	return &TodoHandler{
		todoQuery:    todoQuery,
		todoWorkflow: todoWorkflow,
	}
}

// RegisterRoutes はルートを登録します
func (h *TodoHandler) RegisterRoutes(e *echo.Echo) {
	e.GET("/api/todos", h.GetAllTodos)
	e.GET("/api/todos/:id", h.GetTodoByID)
	e.POST("/api/todos", h.CreateTodo)
	e.PUT("/api/todos/:id", h.UpdateTodo)
	e.DELETE("/api/todos/:id", h.DeleteTodo)
}

// GetAllTodos は全てのTodoを取得します
func (h *TodoHandler) GetAllTodos(c echo.Context) error {
	todos, err := h.todoQuery.GetAllTodos(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, todos)
}

// GetTodoByID は指定されたIDのTodoを取得します
func (h *TodoHandler) GetTodoByID(c echo.Context) error {
	id := c.Param("id")
	todo, err := h.todoQuery.GetTodoByID(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "Todo not found",
		})
	}

	return c.JSON(http.StatusOK, todo)
}

// CreateTodo は新しいTodoを作成します
func (h *TodoHandler) CreateTodo(c echo.Context) error {
	var input workflows.CreateTodoInput
	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	todo, err := h.todoWorkflow.CreateTodo(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
	}

	// レスポンス形式に変換
	response := queries.TodoResponse{
		ID:          todo.ID,
		Title:       todo.Title,
		Description: todo.Description,
		Completed:   todo.Completed,
		CreatedAt:   todo.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   todo.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	return c.JSON(http.StatusCreated, response)
}

// UpdateTodo は既存のTodoを更新します
func (h *TodoHandler) UpdateTodo(c echo.Context) error {
	id := c.Param("id")
	var input workflows.UpdateTodoInput
	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	todo, err := h.todoWorkflow.UpdateTodo(c.Request().Context(), id, input)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "Todo not found",
		})
	}

	// レスポンス形式に変換
	response := queries.TodoResponse{
		ID:          todo.ID,
		Title:       todo.Title,
		Description: todo.Description,
		Completed:   todo.Completed,
		CreatedAt:   todo.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   todo.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	return c.JSON(http.StatusOK, response)
}

// DeleteTodo は指定されたIDのTodoを削除します
func (h *TodoHandler) DeleteTodo(c echo.Context) error {
	id := c.Param("id")
	err := h.todoWorkflow.DeleteTodo(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "Todo not found",
		})
	}

	return c.NoContent(http.StatusNoContent)
}
