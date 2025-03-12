package shared

import "fmt"

// DomainError はドメイン層で発生するエラーを表します
type DomainError struct {
	Code    string
	Message string
	Cause   error
}

// Error はエラーメッセージを返します
func (e *DomainError) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("%s: %s (cause: %v)", e.Code, e.Message, e.Cause)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// NewDomainError は新しいDomainErrorを作成します
func NewDomainError(code string, message string, cause error) *DomainError {
	return &DomainError{
		Code:    code,
		Message: message,
		Cause:   cause,
	}
}

// ApplicationError はアプリケーション層で発生するエラーを表します
type ApplicationError struct {
	Code    string
	Message string
	Cause   error
}

// Error はエラーメッセージを返します
func (e *ApplicationError) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("%s: %s (cause: %v)", e.Code, e.Message, e.Cause)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// NewApplicationError は新しいApplicationErrorを作成します
func NewApplicationError(code string, message string, cause error) *ApplicationError {
	return &ApplicationError{
		Code:    code,
		Message: message,
		Cause:   cause,
	}
}

// QueryError はクエリ層で発生するエラーを表します
type QueryError struct {
	Code    string
	Message string
	Cause   error
}

// Error はエラーメッセージを返します
func (e *QueryError) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("%s: %s (cause: %v)", e.Code, e.Message, e.Cause)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// NewQueryError は新しいQueryErrorを作成します
func NewQueryError(code string, message string, cause error) *QueryError {
	return &QueryError{
		Code:    code,
		Message: message,
		Cause:   cause,
	}
}
