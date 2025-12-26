"""
Custom Exceptions

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from typing import Any, Optional


class QuentoException(Exception):
    """Base exception for Quento application."""

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        status_code: int = 500,
        details: Optional[Any] = None,
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class AuthenticationError(QuentoException):
    """Authentication failed."""

    def __init__(self, message: str = "Authentication failed", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="UNAUTHORIZED",
            status_code=401,
            details=details,
        )


class AuthorizationError(QuentoException):
    """Authorization failed - insufficient permissions."""

    def __init__(self, message: str = "Insufficient permissions", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="FORBIDDEN",
            status_code=403,
            details=details,
        )


class NotFoundError(QuentoException):
    """Resource not found."""

    def __init__(self, message: str = "Resource not found", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="NOT_FOUND",
            status_code=404,
            details=details,
        )


class ValidationError(QuentoException):
    """Validation failed."""

    def __init__(self, message: str = "Validation failed", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=400,
            details=details,
        )


class RateLimitError(QuentoException):
    """Rate limit exceeded."""

    def __init__(self, message: str = "Rate limit exceeded", retry_after: int = 60):
        super().__init__(
            message=message,
            code="RATE_LIMITED",
            status_code=429,
            details={"retry_after": retry_after},
        )


class AIServiceError(QuentoException):
    """AI service error."""

    def __init__(self, message: str = "AI service unavailable", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="AI_UNAVAILABLE",
            status_code=503,
            details=details,
        )


class UserAlreadyExistsError(QuentoException):
    """User already exists."""

    def __init__(self, message: str = "User already exists", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="USER_EXISTS",
            status_code=409,
            details=details,
        )


class InvalidTokenError(QuentoException):
    """Invalid or expired token."""

    def __init__(self, message: str = "Invalid or expired token", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="INVALID_TOKEN",
            status_code=401,
            details=details,
        )
