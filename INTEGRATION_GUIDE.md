# Rust Backend Integration Guide

## Overview

This guide shows you how to integrate your React frontend with your Rust backend for the Credit Card Visualizer application.

## Frontend Expectations

The frontend expects your Rust backend to return data in this format:

```json
{
  "analysis": "{\"categories\":{\"Gas\":{\"transactions\":[{\"date\":\"2025-12-30\",\"merchant\":\"PETRO-CANADA 91888\",\"amount\":64.04}],\"total\":64.04},\"Restaurants\":{\"transactions\":[{\"date\":\"2025-12-04\",\"merchant\":\"UBER CANADA/UBEREATS\",\"amount\":53.4}],\"total\":1072.93}},\"grand_total\":2993.75}",
  "transaction_count": 89
}
```

Note: The `analysis` field is a **JSON string** (not a JSON object).

## Rust Backend Setup

### 1. Define Your Data Structures

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub date: String,
    pub merchant: String,
    pub amount: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Category {
    pub transactions: Vec<Transaction>,
    pub total: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisData {
    pub categories: std::collections::HashMap<String, Category>,
    pub grand_total: f64,
}

#[derive(Debug, Serialize)]
pub struct ApiResponse {
    pub analysis: String,  // JSON string, not object!
    pub transaction_count: usize,
}
```

### 2. Create the Upload Endpoint

#### Option A: Using Axum

```rust
use axum::{
    extract::Multipart,
    http::StatusCode,
    response::Json,
    Router,
    routing::post,
};
use tower_http::cors::{CorsLayer, Any};

async fn upload_file(mut multipart: Multipart) -> Result<Json<ApiResponse>, StatusCode> {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap().to_string();
        
        if name == "file" {
            let data = field.bytes().await.unwrap();
            
            // Parse CSV and analyze
            let analysis_data = analyze_csv(&data)?;
            let transaction_count = count_transactions(&analysis_data);
            
            // Serialize analysis to JSON string
            let analysis_json = serde_json::to_string(&analysis_data)
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            
            let response = ApiResponse {
                analysis: analysis_json,
                transaction_count,
            };
            
            return Ok(Json(response));
        }
    }
    
    Err(StatusCode::BAD_REQUEST)
}

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);
    
    let app = Router::new()
        .route("/api/upload", post(upload_file))
        .layer(cors);
    
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();
    
    println!("Server running on http://localhost:3000");
    
    axum::serve(listener, app).await.unwrap();
}

fn analyze_csv(data: &[u8]) -> Result<AnalysisData, StatusCode> {
    // Your CSV parsing and analysis logic here
    // Return AnalysisData structure
    todo!()
}

fn count_transactions(data: &AnalysisData) -> usize {
    data.categories.values()
        .map(|cat| cat.transactions.len())
        .sum()
}
```

#### Option B: Using Actix-Web

```rust
use actix_web::{web, App, HttpServer, HttpResponse};
use actix_multipart::Multipart;
use actix_cors::Cors;
use futures_util::TryStreamExt;

async fn upload_file(mut payload: Multipart) -> HttpResponse {
    while let Ok(Some(mut field)) = payload.try_next().await {
        let content_disposition = field.content_disposition();
        
        if content_disposition.get_name() == Some("file") {
            let mut bytes = Vec::new();
            
            while let Some(chunk) = field.try_next().await.unwrap() {
                bytes.extend_from_slice(&chunk);
            }
            
            // Parse CSV and analyze
            match analyze_csv(&bytes) {
                Ok(analysis_data) => {
                    let transaction_count = count_transactions(&analysis_data);
                    
                    let analysis_json = serde_json::to_string(&analysis_data)
                        .unwrap();
                    
                    let response = ApiResponse {
                        analysis: analysis_json,
                        transaction_count,
                    };
                    
                    return HttpResponse::Ok().json(response);
                }
                Err(_) => return HttpResponse::BadRequest().finish(),
            }
        }
    }
    
    HttpResponse::BadRequest().finish()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();
        
        App::new()
            .wrap(cors)
            .route("/api/upload", web::post().to(upload_file))
    })
    .bind("127.0.0.1:3000")?
    .run()
    .await
}
```

#### Option C: Using rspc (Type-Safe RPC)

```rust
use rspc::{Router, Config};

#[derive(Debug, Clone)]
struct Ctx;

fn router() -> Router<Ctx> {
    Router::<Ctx>::new()
        .mutation("upload_file", |t| {
            t(|ctx, file_data: Vec<u8>| async move {
                let analysis_data = analyze_csv(&file_data)?;
                let transaction_count = count_transactions(&analysis_data);
                
                let analysis_json = serde_json::to_string(&analysis_data)?;
                
                Ok(ApiResponse {
                    analysis: analysis_json,
                    transaction_count,
                })
            })
        })
        .build()
}

#[tokio::main]
async fn main() {
    let router = router();
    
    // Export TypeScript bindings for frontend
    router
        .export_ts("../frontend/src/bindings.ts")
        .unwrap();
    
    // Serve with your preferred server (Axum, Actix, etc.)
}
```

### 3. Add Dependencies to Cargo.toml

```toml
[dependencies]
# Web framework (choose one)
axum = { version = "0.7", features = ["multipart"] }
# OR
actix-web = "4"
actix-multipart = "0.6"
actix-cors = "0.7"

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Async runtime
tokio = { version = "1", features = ["full"] }

# CSV parsing
csv = "1.3"

# CORS (for Axum)
tower-http = { version = "0.5", features = ["cors"] }

# rspc (optional)
rspc = "0.1"
```

## Frontend Integration

### Update App.tsx

Replace the mock `uploadFile` function in `frontend/src/App.tsx`:

```typescript
const uploadFile = async (file: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
```

## CORS Configuration

### Development

For local development, allow all origins:

```rust
// Axum
let cors = CorsLayer::new()
    .allow_origin(Any)
    .allow_methods(Any)
    .allow_headers(Any);

// Actix
let cors = Cors::default()
    .allow_any_origin()
    .allow_any_method()
    .allow_any_header();
```

### Production

For production, restrict to your frontend domain:

```rust
use tower_http::cors::CorsLayer;
use http::Method;

let cors = CorsLayer::new()
    .allow_origin("https://your-frontend-domain.com".parse::<HeaderValue>().unwrap())
    .allow_methods([Method::GET, Method::POST])
    .allow_headers([header::CONTENT_TYPE]);
```

## Example CSV Analysis Function

```rust
use csv::ReaderBuilder;
use std::collections::HashMap;

fn analyze_csv(data: &[u8]) -> Result<AnalysisData, Box<dyn std::error::Error>> {
    let mut reader = ReaderBuilder::new()
        .has_headers(true)
        .from_reader(data);
    
    let mut categories: HashMap<String, Category> = HashMap::new();
    let mut grand_total = 0.0;
    
    for result in reader.records() {
        let record = result?;
        
        // Adjust indices based on your CSV format
        let date = record.get(0).unwrap_or("").to_string();
        let merchant = record.get(1).unwrap_or("").to_string();
        let amount: f64 = record.get(2).unwrap_or("0").parse()?;
        
        // Categorize transaction (implement your logic)
        let category_name = categorize_transaction(&merchant);
        
        let transaction = Transaction {
            date,
            merchant,
            amount,
        };
        
        categories
            .entry(category_name)
            .or_insert_with(|| Category {
                transactions: Vec::new(),
                total: 0.0,
            })
            .transactions
            .push(transaction);
        
        categories
            .get_mut(&category_name)
            .unwrap()
            .total += amount;
        
        grand_total += amount;
    }
    
    Ok(AnalysisData {
        categories,
        grand_total,
    })
}

fn categorize_transaction(merchant: &str) -> String {
    let merchant_lower = merchant.to_lowercase();
    
    if merchant_lower.contains("gas") || merchant_lower.contains("petro") {
        "Gas".to_string()
    } else if merchant_lower.contains("restaurant") || merchant_lower.contains("uber") {
        "Restaurants".to_string()
    } else if merchant_lower.contains("grocery") || merchant_lower.contains("market") {
        "Groceries".to_string()
    } else if merchant_lower.contains("entertainment") || merchant_lower.contains("spotify") {
        "Entertainment".to_string()
    } else if merchant_lower.contains("utility") || merchant_lower.contains("novus") {
        "Utilities".to_string()
    } else {
        "Miscellaneous".to_string()
    }
}
```

## Testing the Integration

### 1. Start Rust Backend

```bash
cd backend
cargo run
```

### 2. Start React Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Upload

1. Open http://localhost:5173/
2. Upload a CSV file
3. Check browser console for any errors
4. Verify visualization appears with data

### 4. Debug Common Issues

**CORS Error:**
```
Access to fetch at 'http://localhost:3000/api/upload' from origin 'http://localhost:5173' has been blocked by CORS policy
```
→ Add CORS middleware to Rust backend

**Parse Error:**
```
SyntaxError: Unexpected token < in JSON at position 0
```
→ Backend is returning HTML error page instead of JSON
→ Check backend logs for actual error

**Empty Data:**
→ Check that `analysis` field is properly serialized JSON string
→ Verify CSV parsing logic is working correctly

## Environment Variables

Create `.env` files for configuration:

### Backend (.env)

```env
SERVER_HOST=0.0.0.0
SERVER_PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

Update frontend API call:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const uploadFile = async (file: File): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  // ...
};
```

## Production Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - RUST_LOG=info
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:3000
```

### Separate Deployment

1. **Backend**: Deploy to service like Railway, Fly.io, or AWS
2. **Frontend**: Deploy to Vercel, Netlify, or Cloudflare Pages
3. Update `VITE_API_URL` in frontend build to point to backend URL

## Security Considerations

1. **File Size Limits**: Add max file size validation
2. **File Type Validation**: Verify CSV format on backend
3. **Rate Limiting**: Prevent abuse of upload endpoint
4. **Authentication**: Add auth if handling sensitive data
5. **Input Sanitization**: Validate all CSV data
6. **HTTPS**: Use TLS in production

## Next Steps

1. ✅ Set up Rust backend with chosen framework
2. ✅ Implement CSV parsing logic
3. ✅ Add categorization rules
4. ✅ Configure CORS
5. ✅ Test with sample CSV files
6. ✅ Connect frontend to backend
7. ✅ Deploy to production

---

**Questions? Check the component documentation in `frontend/src/components/README.md`**