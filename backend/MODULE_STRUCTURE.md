# Backend Module Structure

## Overview

The backend is organized into modular components for better maintainability, testability, and code organization.

## Module Layout

```
backend/src/
├── main.rs         # Application entry point and route handlers
├── constants.rs    # Application constants (AI prompts, configs)
└── utils.rs        # Utility functions (error handling, helpers)
```

## Module Descriptions

### `main.rs`
**Purpose:** Application entry point, route definitions, and endpoint handlers

**Contains:**
- Axum web server setup
- Route handlers (`get_user`, `create_user`, `upload_file`, `analyze_transactions`, `generate_handler`)
- Request/Response types (DTOs)
- OpenAPI documentation setup
- Application state management

**Imports:**
- `constants::PROMPT_INSTRUCTIONS` - Default AI system instructions
- `utils::{handle_error, ErrorResponse}` - Generic error handling

**Key Components:**
```rust
// Application state
struct AppState {
    ollama: Ollama,
}

// Request/Response types
struct UploadFileRequest { ... }
struct UploadFileResponse { ... }
struct AnalyzeTransactionsResponse { ... }
struct PromptRequest { ... }
struct PromptResponse { ... }

// Route handlers
async fn upload_file(...) -> Result<...>
async fn analyze_transactions(...) -> Result<...>
async fn generate_handler(...) -> Result<...>
```

---

### `constants.rs`
**Purpose:** Centralized configuration and constant values

**Contains:**
- `PROMPT_INSTRUCTIONS` - Default AI system instructions for transaction analysis

**Why Separate?**
- Single source of truth for AI prompts
- Easy to modify without touching business logic
- Can be extended for other constants (model names, timeouts, etc.)

**Usage:**
```rust
// In main.rs
use constants::PROMPT_INSTRUCTIONS;

let req = GenerationRequest::new(model, data)
    .system(PROMPT_INSTRUCTIONS.to_string());
```

---

### `utils.rs`
**Purpose:** Reusable utility functions and common types

**Contains:**
- `ErrorResponse` struct - Standard error response format
- `handle_error()` function - Generic error handler

**Why Separate?**
- DRY principle - shared utilities used across multiple modules
- Easy to test in isolation
- Can be extended with more utilities (validation, parsing, etc.)

**Public API:**
```rust
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
}

pub fn handle_error(
    e: impl std::fmt::Display,
    status: StatusCode,
    error_type: &str,
    message: &str,
    context: &str,
) -> (StatusCode, Json<ErrorResponse>)
```

**Usage:**
```rust
// In any handler
.map_err(|e| {
    handle_error(
        e,
        StatusCode::SERVICE_UNAVAILABLE,
        "Ollama service unavailable",
        "Failed to connect to Ollama...",
        "analyze-transactions"
    )
})?
```

---

## Import Flow

```
main.rs
  ├── mod constants
  │   └── use constants::PROMPT_INSTRUCTIONS
  │
  └── mod utils
      ├── use utils::handle_error
      └── use utils::ErrorResponse
```

---

## Benefits of This Structure

### 1. Separation of Concerns
- **main.rs**: HTTP handlers and routing
- **constants.rs**: Configuration
- **utils.rs**: Shared utilities

### 2. Maintainability
- Changes to error handling only affect `utils.rs`
- AI prompt updates only affect `constants.rs`
- Easy to locate specific functionality

### 3. Testability
- Utils can be unit tested independently
- Constants can be validated separately
- Handlers can be tested with mock utilities

### 4. Scalability
- Easy to add new modules (e.g., `db.rs`, `auth.rs`)
- Clear pattern for future development
- Modules can be split further as needed

---

## Future Module Extensions

As the application grows, consider adding:

### `db.rs` - Database operations
```rust
pub async fn save_transaction(tx: Transaction) -> Result<()>
pub async fn get_user_transactions(user_id: i32) -> Result<Vec<Transaction>>
```

### `auth.rs` - Authentication/Authorization
```rust
pub fn verify_token(token: &str) -> Result<UserId>
pub fn generate_token(user_id: i32) -> String
```

### `validation.rs` - Input validation
```rust
pub fn validate_csv_format(content: &str) -> Result<()>
pub fn validate_transaction_data(tx: &Transaction) -> Result<()>
```

### `models.rs` - Data models
```rust
pub struct Transaction { ... }
pub struct User { ... }
pub struct Category { ... }
```

### `csv_parser.rs` - CSV processing logic
```rust
pub fn parse_csv(content: &str) -> Result<Vec<Transaction>>
pub fn validate_csv_headers(headers: &[String]) -> Result<()>
```

---

## Code Organization Best Practices

### 1. Module Declaration
```rust
// In main.rs
mod constants;     // Declares constants.rs as a module
mod utils;         // Declares utils.rs as a module

use constants::PROMPT_INSTRUCTIONS;
use utils::{handle_error, ErrorResponse};
```

### 2. Public API Design
Only expose what's needed:
```rust
// In utils.rs
pub fn handle_error(...) { }  // Public - used by handlers
fn format_error_message(...) { }  // Private - internal helper
```

### 3. Import Conventions
```rust
// Group imports logically
use axum::{...};           // External crates
use std::...;              // Standard library
mod constants;             // Local modules
use constants::...;        // Module imports
```

---

## Testing Structure

```
backend/
├── src/
│   ├── main.rs
│   ├── constants.rs
│   └── utils.rs
└── tests/
    ├── integration_tests.rs
    └── utils_tests.rs
```

---

## Summary

The modular structure provides:

✅ **Clear organization** - Each module has a single responsibility
✅ **Easy maintenance** - Changes are isolated to relevant modules
✅ **Better testability** - Modules can be tested independently
✅ **Scalability** - Easy to add new modules as needed
✅ **Code reuse** - Shared utilities in one place
✅ **Clean imports** - Clear dependency relationships

This structure follows Rust best practices and makes the codebase more professional and maintainable.