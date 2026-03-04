use axum::{Json, http::StatusCode};
use serde::Serialize;
use utoipa::ToSchema;

#[derive(Serialize, ToSchema)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
}

/// Clean JSON response by removing markdown code blocks and extra whitespace
///
/// # Arguments
/// * `raw_json` - The raw response from AI that might contain markdown formatting
///
/// # Returns
/// Cleaned JSON string ready to be parsed
///
/// # Example
/// ```rust
/// let raw = "```json\n{\"key\": \"value\"}\n```";
/// let clean = clean_json_response(raw);
/// // Returns: "{\"key\": \"value\"}"
/// ```
pub fn clean_json_response(raw_json: &str) -> String {
    let trimmed = raw_json.trim();

    // Remove markdown code blocks (```json, ```, etc.)
    let without_markdown = if trimmed.starts_with("```") {
        // Find the first newline after opening ```
        let start = trimmed.find('\n').map(|i| i + 1).unwrap_or(0);

        // Find the closing ```
        let end = if let Some(pos) = trimmed.rfind("```") {
            pos
        } else {
            trimmed.len()
        };

        &trimmed[start..end]
    } else {
        trimmed
    };

    // Trim again after removing markdown
    let result = without_markdown.trim();

    // Validate it starts with { and ends with }
    if result.starts_with('{') && result.ends_with('}') {
        result.to_string()
    } else {
        // Try to find the first { and last }
        if let Some(start) = result.find('{') {
            if let Some(end) = result.rfind('}') {
                if start < end {
                    return result[start..=end].to_string();
                }
            }
        }
        // If we can't find valid JSON bounds, return as-is and let parsing fail with good error
        result.to_string()
    }
}

/// Generic helper function to handle errors with consistent error responses
///
/// # Arguments
/// * `e` - The error that occurred
/// * `status` - HTTP status code to return
/// * `error_type` - Short error type description (e.g., "Ollama service unavailable", "File read error")
/// * `message` - Detailed user-friendly error message
/// * `context` - Context string describing where the error occurred (e.g., "analyze-transactions", "upload")
///
/// # Example
/// ```rust
/// .map_err(|e| handle_error(
///     e,
///     StatusCode::SERVICE_UNAVAILABLE,
///     "Ollama service unavailable",
///     "Failed to connect to Ollama. Please ensure Ollama is running (try 'ollama serve').",
///     "generate"
/// ))?;
/// ```
pub fn handle_error(
    e: impl std::fmt::Display,
    status: StatusCode,
    error_type: &str,
    message: &str,
    context: &str,
) -> (StatusCode, Json<ErrorResponse>) {
    eprintln!("{} error ({}): {}", error_type, context, e);
    (
        status,
        Json(ErrorResponse {
            error: error_type.to_string(),
            message: format!("{}. Context: {}. Error: {}", message, context, e),
        }),
    )
}
