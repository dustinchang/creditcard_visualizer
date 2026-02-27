// use axum::http::Method;
// use rspc::Router;
// use std::net::SocketAddr;
// use tower_http::cors::{Any, CorsLayer};

// #[tokio::main]
// async fn main() {
//     // 1. Define the router and UNWRAP it (because build returns a Result)
//     let (router, _) = Router::<()>::new()
//         .query("version", |t| t.resolver(|_ctx, _: ()| "1.0.0"))
//         .build()
//         .expect("Failed to build rspc router");

//     // 2. Export types
//     router
//         .export_ts("../frontend/src/bindings.ts")
//         .expect("Failed to export typescript bindings");

//     // 3. Setup CORS
//     let cors = CorsLayer::new()
//         .allow_methods([Method::GET, Method::POST])
//         .allow_origin(Any)
//         .allow_headers(Any);

//     // 4. Create Axum app
//     // Note: In 0.4.x, we use the router directly with the Axum integration
//     let app = axum::Router::new()
//         .nest("/rspc", rspc_axum::endpoint(router, |_: ()| ()))
//         .layer(cors);

//     // 5. Run the server
//     let addr = SocketAddr::from(([127, 0, 0, 1], 4000));
//     println!("Server running on http://{}", addr);

//     let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
//     axum::serve(listener, app).await.unwrap();
// }

use axum::{Json, Router, extract::Path, response::Html, routing::get, routing::post};
use axum_typed_multipart::{FieldData, TryFromMultipart, TypedMultipart};
use serde::Deserialize;
use tempfile::NamedTempFile;
use tower_livereload::LiveReloadLayer;
use utoipa::{OpenApi, ToSchema};
use utoipa_swagger_ui::SwaggerUi;

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

#[derive(OpenApi)]
#[openapi(
    paths(get_user, create_user, upload_file),
    components(schemas(User, CreateUserRequest, UploadFileRequest))
)]
struct ApiDoc;

#[tokio::main]
async fn main() {
    let app = Router::new()
        // .route("/", get(|| async { "Hello, Rust!" }))
        .route(
            "/",
            get(|| async { Html("<html><body><h1>Check Source test</h1></body></html>") }),
        )
        .route("/user/{id}", get(get_user))
        .route("/user", post(create_user))
        .route("/upload", post(upload_file))
        // Serve Swagger UI at /swagger-ui
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .layer(LiveReloadLayer::new());

    println!("Running on http://localhost:3000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
