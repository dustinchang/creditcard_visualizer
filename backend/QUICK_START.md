# Quick Start Guide

Get your credit card transaction analyzer running in minutes!

## Prerequisites

1. **Rust** - [Install Rust](https://rustup.rs/)
2. **Ollama** - [Install Ollama](https://ollama.ai/)

## Setup Steps

### 1. Start Ollama

```bash
# Start Ollama service
ollama serve

# In a new terminal, pull the required model
ollama pull llama3.2:3b

# Verify it's running
curl http://localhost:11434/api/tags
```

**Important:** Keep Ollama running in the background for the backend to work!

### 2. Start Backend

```bash
cd backend
cargo run

# You should see:
# Running on http://localhost:3000
```

### 3. Test the API

#### Option A: Use Swagger UI (Easiest)

Open your browser to `http://localhost:3000/swagger-ui` and test the endpoints interactively!

#### Option B: Use curl

```bash
# Upload and analyze a CSV file
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@/path/to/your/credit-card-statement.csv" \
  -F "description=Monthly statement"
```

## Expected Output

```json
{
  "analysis": "CATEGORIZED TRANSACTIONS:\n\nGas:\n- 2025-12-30: PETRO-CANADA 91888, $64.04\n\nRestaurants:\n- 2025-12-04: UBER CANADA/UBEREATS, $53.40\n- 2025-12-07: BROWNS SOCIALHOUSE BRENTW, $124.20\n...\n\nTOTALS PER CATEGORY:\nGas: $64.04\nRestaurants: $892.15\nGroceries: $423.67\nEntertainment: $286.44\nUtilities: $114.41\nMiscellaneous: $654.32\n\nGRAND TOTAL: $2,435.03",
  "transaction_count": 87
}
```

## Common Issues

### ❌ Error: "Ollama service unavailable"

**Problem:** Ollama is not running

**Solution:**
```bash
# Start Ollama in a new terminal
ollama serve

# Or run in background
ollama serve &
```

**Full Error Example:**
```json
{
  "error": "Ollama service unavailable",
  "message": "Failed to connect to Ollama. Please ensure Ollama is running (try 'ollama serve'). Error: connection refused"
}
```

### ❌ Error: "model 'llama3.2:3b' not found"

**Problem:** Model hasn't been downloaded

**Solution:**
```bash
ollama pull llama3.2:3b
```

### ❌ Port 3000 already in use

**Problem:** Another service is using port 3000

**Solution:**
```bash
# Find what's using the port
lsof -i :3000

# Kill the process or change the port in main.rs
```

## CSV Format

Your CSV file should have these columns:

```csv
"transaction_date","post_date","type","details","amount","currency"
"2025-12-04","2025-12-05","Purchase","UBER CANADA/UBEREATS","53.4","CAD"
"2025-12-04","2025-12-05","Purchase","STAPLES STORE #84","0.66","CAD"
"2025-12-05","2025-12-05","Payment","From chequing account","-4810.04","CAD"
```

## Available Endpoints

### 1. `/analyze-transactions` ⭐ RECOMMENDED
Upload CSV and get immediate AI analysis

```bash
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@statement.csv" \
  -F "description=December statement"
```

### 2. `/upload`
Upload CSV and get raw content back

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@statement.csv" \
  -F "description=Test upload"
```

### 3. `/generate`
Send any data to AI with custom instructions

```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_instructions": "You are a tax advisor",
    "user_data": "csv content here..."
  }'
```

## Verification Checklist

Before starting, make sure:

- [x] Rust is installed: `rustc --version`
- [x] Ollama is installed: `ollama --version`
- [x] Ollama service is running: `curl http://localhost:11434/api/tags`
- [x] Model is available: `ollama list` (should show llama3.2:3b)
- [x] Backend compiles: `cargo check`
- [x] Backend runs: `cargo run`

## Next Steps

1. Try the Swagger UI at `http://localhost:3000/swagger-ui`
2. Read `API_USAGE.md` for detailed endpoint documentation
3. Read `CSV_PROCESSING.md` for architecture details
4. Read `ERROR_HANDLING.md` for troubleshooting

## Performance Tips

- Keep CSV files under 10MB for best performance
- First request may be slow (model loading)
- Subsequent requests are much faster (~3-5 seconds)
- Use `/analyze-transactions` for one-time analysis (fastest)
- Use `/upload` + `/generate` to analyze same CSV multiple times

## Development Mode

```bash
# Auto-reload on code changes
cargo watch -x run

# Run with detailed logs
RUST_LOG=debug cargo run

# Build optimized binary
cargo build --release
./target/release/backend
```

## Success Indicators

✅ Ollama service responds: `curl http://localhost:11434/api/tags`
✅ Backend shows: "Running on http://localhost:3000"
✅ Swagger UI loads: `http://localhost:3000/swagger-ui`
✅ Test endpoint works: `curl http://localhost:3000/`
✅ Analysis returns results (not errors)

## Need Help?

- Check server logs in the terminal where you ran `cargo run`
- Visit `http://localhost:3000/swagger-ui` to test interactively
- Read `ERROR_HANDLING.md` for detailed troubleshooting
- Ensure both Ollama and backend are running simultaneously

## Architecture Overview

```
User → Backend (Axum) → Ollama (Llama 3.2) → AI Analysis → User
         ↑
    CSV file uploaded
    directly as text
    (no conversion!)
```

Simple, fast, and efficient! 🚀
