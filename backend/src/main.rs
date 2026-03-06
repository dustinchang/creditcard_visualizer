use async_openai::{
    Client as OpenAIClient,
    types::chat::{
        ChatCompletionRequestSystemMessageArgs, ChatCompletionRequestUserMessageArgs,
        CreateChatCompletionRequestArgs,
    },
};
use axum::{
    Json, Router, extract::Path, extract::State, http::StatusCode, response::Html, routing::get,
    routing::post,
};
use axum_typed_multipart::{FieldData, TryFromMultipart, TypedMultipart};
use ollama_rs::Ollama;
use ollama_rs::generation::completion::request::GenerationRequest;
use serde::Deserialize;
use std::io::Read;
use std::sync::Arc;
use tempfile::NamedTempFile;
use tower_http::cors::{Any, CorsLayer};
use tower_livereload::LiveReloadLayer;
use utoipa::{OpenApi, ToSchema};
use utoipa_swagger_ui::SwaggerUi;

mod constants;
use constants::{MODEL_NAME, OPENAI_MODEL, PROMPT_INSTRUCTIONS};

mod utils;
use utils::{ErrorResponse, clean_json_response, handle_error};

// Types
#[derive(ToSchema, serde::Serialize)]
struct User {
    id: i32,
    username: String,
}

#[derive(ToSchema, Deserialize)]
struct CreateUserRequest {
    username: String,
    email: String,
}

#[derive(TryFromMultipart, ToSchema)]
struct UploadFileRequest {
    #[schema(value_type = String, format = Binary)] // Tells Swagger this is a file picker
    file: FieldData<NamedTempFile>,
    description: String,
}

#[derive(serde::Serialize, ToSchema)]
struct UploadFileResponse {
    filename: String,
    description: String,
    /// The raw CSV content ready for AI processing
    csv_content: String,
    row_count: usize,
}

#[utoipa::path(
    get,
    path = "/user/{id}",
    responses(
        (status = 200, description = "User found", body = User),
        (status = 404, description = "User not found")
    ),
    params(
        ("id" = i32, Path, description = "User database id")
    )
)]
async fn get_user(Path(id): Path<i32>) -> Json<User> {
    Json(User {
        id,
        username: "rust_dev test".to_string(),
    })
}

#[utoipa::path(
    post,
    path = "/user", // No ID here because we are creating a NEW user
    request_body = CreateUserRequest,
    responses((status = 201, body = User))
)]
async fn create_user(Json(payload): Json<CreateUserRequest>) -> &'static str {
    println!(
        "Creating user: {}, with email: {}",
        payload.username, payload.email
    );
    "User created"
}

#[utoipa::path(
    post,
    path = "/upload",
    request_body(content_type = "multipart/form-data", content = UploadFileRequest),
    responses(
        (status = 200, description = "File uploaded and parsed", body = UploadFileResponse),
        (status = 500, description = "Failed to parse CSV")
    )
)]
async fn upload_file(
    TypedMultipart(UploadFileRequest { file, description }): TypedMultipart<UploadFileRequest>,
) -> Result<Json<UploadFileResponse>, (StatusCode, Json<ErrorResponse>)> {
    let filename = file
        .metadata
        .file_name
        .clone()
        .unwrap_or("unknown.csv".to_string());

    // Read the file contents
    let mut csv_content = String::new();
    let mut temp_file = file.contents;
    // Read the file contents into csv_content string
    // - `temp_file` is a NamedTempFile (temporary file on disk)
    // - `.read_to_string(&mut csv_content)` reads all bytes from the file,
    //   decodes them as UTF-8, and appends the resulting string to csv_content
    // - `.map_err()` transforms any IO error into our custom error response
    // - `?` operator propagates the error if reading fails, otherwise continues
    temp_file.read_to_string(&mut csv_content).map_err(|e| {
        handle_error(
            e,
            StatusCode::INTERNAL_SERVER_ERROR,
            "File read error",
            "Failed to read the uploaded file contents",
            "upload",
        )
    })?;

    // Count rows (excluding header)
    // Count the number of rows in the CSV file
    // - `csv_content.lines()` splits the string into an iterator of lines
    // - `.count()` counts all lines (including the header row)
    // - `.saturating_sub(1)` subtracts 1 to exclude the header row from the count
    //   (saturating_sub prevents underflow, returning 0 if the result would be negative)
    let row_count = csv_content.lines().count().saturating_sub(1);

    println!("Uploaded {} with {} rows", filename, row_count);

    Ok(Json(UploadFileResponse {
        filename,
        description,
        csv_content,
        row_count,
    }))
}

#[derive(serde::Serialize, ToSchema)]
struct AnalyzeTransactionsResponse {
    /// The AI's categorized and analyzed response in JSON format
    /// Contains: categories (with transactions and totals per category) and grand_total
    analysis: String,
    /// Number of transactions processed
    transaction_count: usize,
}

#[utoipa::path(
    post,
    path = "/analyze-transactions",
    request_body(content_type = "multipart/form-data", content = UploadFileRequest),
    responses(
        (status = 200, description = "Transactions analyzed by AI", body = AnalyzeTransactionsResponse),
        (status = 500, description = "Failed to parse CSV or generate AI response")
    ),
    tag = "ai"
)]
async fn analyze_transactions(
    State(state): State<Arc<AppState>>,
    TypedMultipart(UploadFileRequest {
        file,
        description: _,
    }): TypedMultipart<UploadFileRequest>,
) -> Result<Json<AnalyzeTransactionsResponse>, (StatusCode, Json<ErrorResponse>)> {
    // Read the file contents
    let mut csv_content = String::new();
    let mut temp_file = file.contents;
    temp_file.read_to_string(&mut csv_content).map_err(|e| {
        handle_error(
            e,
            StatusCode::INTERNAL_SERVER_ERROR,
            "File read error",
            "Failed to read file contents",
            "analyze-transactions",
        )
    })?;

    let row_count = csv_content.lines().count().saturating_sub(1);

    // Generate AI analysis - send CSV directly to AI
    let req = GenerationRequest::new(MODEL_NAME.to_string(), csv_content)
        .system(PROMPT_INSTRUCTIONS.to_string());

    let res = state.ollama.generate(req).await.map_err(|e| {
        handle_error(
            e,
            StatusCode::SERVICE_UNAVAILABLE,
            "Ollama service unavailable",
            "Failed to connect to Ollama. Please ensure Ollama is running (try 'ollama serve')",
            "analyze-transactions",
        )
    })?;

    // Clean the JSON response to remove any markdown formatting
    let cleaned_json = clean_json_response(&res.response);

    // Validate that it's actually valid JSON
    if let Err(e) = serde_json::from_str::<serde_json::Value>(&cleaned_json) {
        eprintln!("AI returned invalid JSON: {}", e);
        eprintln!("Raw response: {}", res.response);
        return Err(handle_error(
            format!("Invalid JSON from AI: {}", e),
            StatusCode::INTERNAL_SERVER_ERROR,
            "AI response error",
            "The AI returned invalid JSON. Please try again",
            "analyze-transactions",
        ));
    }

    Ok(Json(AnalyzeTransactionsResponse {
        analysis: cleaned_json,
        transaction_count: row_count,
    }))
}

#[utoipa::path(
    post,
    path = "/analyze-transactions-openai",
    request_body(content_type = "multipart/form-data", content = UploadFileRequest),
    responses(
        (status = 200, description = "Transactions analyzed by OpenAI", body = AnalyzeTransactionsResponse),
        (status = 500, description = "Failed to parse CSV or generate AI response"),
        (status = 503, description = "OpenAI API unavailable")
    ),
    tag = "ai"
)]
async fn analyze_transactions_openai(
    State(state): State<Arc<AppState>>,
    TypedMultipart(UploadFileRequest {
        file,
        description: _,
    }): TypedMultipart<UploadFileRequest>,
) -> Result<Json<AnalyzeTransactionsResponse>, (StatusCode, Json<ErrorResponse>)> {
    // Read the file contents
    let mut csv_content = String::new();
    let mut temp_file = file.contents;
    temp_file.read_to_string(&mut csv_content).map_err(|e| {
        handle_error(
            e,
            StatusCode::INTERNAL_SERVER_ERROR,
            "File read error",
            "Failed to read file contents",
            "analyze-transactions-openai",
        )
    })?;

    let row_count = csv_content.lines().count().saturating_sub(1);

    // Create OpenAI chat completion request with structured output
    // Helper for System Messages
    let system_msg = ChatCompletionRequestSystemMessageArgs::default()
        .content(PROMPT_INSTRUCTIONS)
        .build()
        .map_err(|e| {
            handle_error(
                e,
                StatusCode::INTERNAL_SERVER_ERROR,
                "Build error",
                "System prompt failed",
                "openai",
            )
        })?;

    // Helper for User Messages (CSV)
    let user_msg = ChatCompletionRequestUserMessageArgs::default()
        .content(csv_content)
        .build()
        .map_err(|e| {
            handle_error(
                e,
                StatusCode::INTERNAL_SERVER_ERROR,
                "Build error",
                "CSV input failed",
                "openai",
            )
        })?;

    // OAI Request
    let request = CreateChatCompletionRequestArgs::default()
        .model(OPENAI_MODEL)
        .messages(vec![system_msg.into(), user_msg.into()])
        .build()
        .map_err(|e| {
            handle_error(
                e,
                StatusCode::INTERNAL_SERVER_ERROR,
                "Build error",
                "OpenAI request failed",
                "openai",
            )
        })?;

    // Call OpenAI API
    let response = state.openai.chat().create(request).await.map_err(|e| {
            handle_error(
                e,
                StatusCode::SERVICE_UNAVAILABLE,
                "OpenAI API error",
                "Failed to connect to OpenAI API. Please check your OPENAI_API_KEY environment variable",
                "analyze-transactions-openai",
            )
        })?;

    // Extract the response content
    let ai_response = response
        .choices
        .first()
        .and_then(|choice| choice.message.content.clone())
        .ok_or_else(|| {
            handle_error(
                "No response from OpenAI",
                StatusCode::INTERNAL_SERVER_ERROR,
                "OpenAI response error",
                "OpenAI returned an empty response",
                "analyze-transactions-openai",
            )
        })?;

    // Clean the JSON response to remove any markdown formatting
    let cleaned_json = clean_json_response(&ai_response);

    // Validate that it's actually valid JSON
    if let Err(e) = serde_json::from_str::<serde_json::Value>(&cleaned_json) {
        eprintln!("OpenAI returned invalid JSON: {}", e);
        eprintln!("Raw response: {}", ai_response);
        return Err(handle_error(
            format!("Invalid JSON from OpenAI: {}", e),
            StatusCode::INTERNAL_SERVER_ERROR,
            "AI response error",
            "OpenAI returned invalid JSON. Please try again",
            "analyze-transactions-openai",
        ));
    }

    Ok(Json(AnalyzeTransactionsResponse {
        analysis: cleaned_json,
        transaction_count: row_count,
    }))
}

// Generate code and types
struct AppState {
    ollama: Ollama,
    openai: OpenAIClient<async_openai::config::OpenAIConfig>,
}

#[derive(Deserialize, ToSchema)]
struct PromptRequest {
    /// The instructions for the AI (e.g., "You are a poetic assistant")
    system_instructions: String,
    /// The actual data or prompt to process
    user_data: String,
}

#[derive(serde::Serialize, ToSchema)]
struct PromptResponse {
    // The final generated text from model
    response: String,
}

#[utoipa::path(
    post,
    path = "/generate",
    request_body = PromptRequest,
    responses(
        (status = 200, description = "AI successfully generated a response", body = PromptResponse),
        (status = 500, description = "Internal server error or Ollama unreachable")
    ),
    tag = "ai"
)]
async fn generate_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<PromptRequest>,
) -> Result<Json<PromptResponse>, (StatusCode, Json<ErrorResponse>)> {
    let system_instructions = if payload.system_instructions.trim().is_empty() {
        PROMPT_INSTRUCTIONS.to_string()
    } else {
        payload.system_instructions
    };

    let req = GenerationRequest::new(MODEL_NAME.to_string(), payload.user_data)
        .system(system_instructions);

    let res = state.ollama.generate(req).await.map_err(|e| {
        handle_error(
            e,
            StatusCode::SERVICE_UNAVAILABLE,
            "Ollama service unavailable",
            "Failed to connect to Ollama. Please ensure Ollama is running (try 'ollama serve')",
            "generate",
        )
    })?;

    Ok(Json(PromptResponse {
        response: res.response,
    }))
}

// TODO: Get data from an uploaded file
// TODO: Parse only the needed(non-sensitive) data from a CC file
// TODO: Return that data to frontend
// TODO: Look for data visualization that will render that data useful
// TODO: Or maybe use AI to categorize it if no useful metadata?
// TODO: Add Typeshare at some point
// Stripe token for users to pay
//
#[derive(OpenApi)]
#[openapi(
    paths(
        get_user,
        create_user,
        upload_file,
        generate_handler,
        analyze_transactions,
        analyze_transactions_openai
    ),
    components(schemas(
        User,
        CreateUserRequest,
        UploadFileRequest,
        UploadFileResponse,
        PromptRequest,
        PromptResponse,
        AnalyzeTransactionsResponse,
        ErrorResponse
    )),
    tags(
        (name = "ai", description = "AI-powered transaction analysis endpoints")
    )
)]
struct ApiDoc;

#[tokio::main]
async fn main() {
    let ollama = Ollama::default();
    let openai = OpenAIClient::new();
    let shared_state = Arc::new(AppState { ollama, openai });

    // Configure CORS to allow requests from frontend
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        // .route("/", get(|| async { "Hello, Rust!" }))
        .route(
            "/",
            get(|| async { Html("<html><body><h1>Check Source test</h1></body></html>") }),
        )
        .route("/user/{id}", get(get_user))
        .route("/user", post(create_user))
        .route("/upload", post(upload_file))
        .route("/generate", post(generate_handler))
        .route("/analyze-transactions", post(analyze_transactions))
        .route(
            "/analyze-transactions-openai",
            post(analyze_transactions_openai),
        )
        .with_state(shared_state)
        // Serve Swagger UI at /swagger-ui
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .layer(cors)
        .layer(LiveReloadLayer::new());

    println!("Running on http://localhost:3000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
