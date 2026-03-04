use axum::{Json, Router, extract::Path, extract::State, response::Html, routing::get, routing::post};
use axum_typed_multipart::{FieldData, TryFromMultipart, TypedMultipart};
use serde::Deserialize;
use tempfile::NamedTempFile;
use tower_livereload::LiveReloadLayer;
use utoipa::{OpenApi, ToSchema};
use utoipa_swagger_ui::SwaggerUi;
use ollama_rs::Ollama;
use ollama_rs::generation::completion::request::GenerationRequest;
use std::sync::Arc;

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
    responses((status = 200, description = "File uploaded"))
)]
async fn upload_file(
    TypedMultipart(UploadFileRequest { file, description }): TypedMultipart<UploadFileRequest>,
) -> String {
    println!(
        "Uploaded {} with description: {}",
        file.metadata
            .file_name
            .as_deref()
            .unwrap_or("Unknown file_name"),
        description
    );
    format!(
        "Uploaded {} with description: {}",
        file.metadata.file_name.unwrap(),
        description
    )
}

// Generate code and types
struct AppState {
    ollama: Ollama,
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
) -> Json<PromptResponse> {
    let model = "llama3.2:3b".to_string();
    let req = GenerationRequest::new(model, payload.user_data).system(payload.system_instructions);

    let res = state.ollama
        .generate(req)
        .await
        .map_err(|e| {
            println!("Ollama res Error: {}", e);
        })
        .unwrap();

    Json(PromptResponse { response: res.response })
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
    paths(get_user, create_user, upload_file, generate_handler),
    components(schemas(User, CreateUserRequest, UploadFileRequest, PromptRequest, PromptResponse))
)]
struct ApiDoc;

#[tokio::main]
async fn main() {
    let ollama = Ollama::default();
    let shared_state = Arc::new(AppState { ollama });

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
        .with_state(shared_state)
        // Serve Swagger UI at /swagger-ui
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .layer(LiveReloadLayer::new());

    println!("Running on http://localhost:3000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
