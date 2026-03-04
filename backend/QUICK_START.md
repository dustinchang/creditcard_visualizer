# Quick Start Guide

Get your credit card transaction analyzer running in minutes!

## Choose Your AI Backend

We support **two options** for AI-powered transaction analysis:

### Option A: OpenAI (Recommended for Production)
- ✅ Most reliable and accurate
- ✅ Fast cloud processing
- ✅ No local setup required
- 💰 Costs ~$0.001-$0.005 per file

### Option B: Local Ollama (Recommended for Development)
- ✅ Free and private
- ✅ Data stays local
- ⚠️ Requires local setup
- ⚠️ Needs GPU for speed

## Prerequisites

### For Both Options:
1. **Rust** - [Install Rust](https://rustup.rs/)

### For OpenAI (Option A):
2. **OpenAI API Key** - [Get API Key](https://platform.openai.com/)

### For Ollama (Option B):
2. **Ollama** - [Install Ollama](https://ollama.ai/)

---

## Setup Steps - Option A: OpenAI

### 1. Set API Key

```bash
# Set your OpenAI API key
export OPENAI_API_KEY='sk-your-api-key-here'

# Verify it's set
echo $OPENAI_API_KEY
```

**Get an API Key:**
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new secret key
5. Copy and save it (you won't see it again!)

### 2. Start Backend

```bash
cd backend
cargo run

# You should see:
# Running on http://localhost:3000
```

### 3. Test the API

```bash
# Analyze transactions with OpenAI
curl -X POST http://localhost:3000/analyze-transactions-openai \
  -F "file=@/path/to/your/credit-card-statement.csv" \
  -F "description=December statement"
```

---

## Setup Steps - Option B: Local Ollama

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
# Analyze transactions with Ollama
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@/path/to/your/credit-card-statement.csv" \
  -F "description=Monthly statement"
```

## Expected Output

```json
{
  "analysis": "{\"categories\":{\"Gas\":{\"transactions\":[{\"date\":\"2025-12-30\",\"merchant\":\"PETRO-CANADA 91888\",\"amount\":64.04}],\"total\":64.04},\"Restaurants\":{\"transactions\":[{\"date\":\"2025-12-04\",\"merchant\":\"UBER CANADA/UBEREATS\",\"amount\":53.40}],\"total\":53.40}...},\"grand_total\":2435.03}",
  "transaction_count": 87
}
```

**Note:** The `analysis` field is a JSON string. Parse it in your application:
```javascript
const data = await response.json();
const analysis = JSON.parse(data.analysis);
console.log(analysis.grand_total); // 2435.03
```

## Common Issues

### OpenAI Issues

#### ❌ Error: "OpenAI API error"

**Problem:** API key not set or invalid

**Solution:**
```bash
# Check if key is set
echo $OPENAI_API_KEY

# Set it if missing
export OPENAI_API_KEY='sk-your-key-here'

# Restart the server
cargo run
```

**Full Error Example:**
```json
{
  "error": "OpenAI API error",
  "message": "Failed to connect to OpenAI API. Please check your OPENAI_API_KEY environment variable..."
}
```

#### ❌ Rate limit errors

**Problem:** Too many requests to OpenAI

**Solution:**
- Wait a minute and try again
- Check your OpenAI usage dashboard
- Upgrade your OpenAI plan if needed

---

### Ollama Issues

#### ❌ Error: "Ollama service unavailable"

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

### 1. `/analyze-transactions-openai` ⭐ RECOMMENDED FOR PRODUCTION
Upload CSV and get OpenAI-powered AI analysis

```bash
export OPENAI_API_KEY='sk-your-key'
curl -X POST http://localhost:3000/analyze-transactions-openai \
  -F "file=@statement.csv" \
  -F "description=December statement"
```

**Benefits:**
- Most accurate categorization
- No hallucinations
- Fast (1-3 seconds)
- Consistent JSON output
- Cost: ~$0.001-$0.005 per file

### 2. `/analyze-transactions` ⭐ RECOMMENDED FOR DEVELOPMENT
Upload CSV and get local Ollama-powered AI analysis

```bash
ollama serve  # Must be running
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@statement.csv" \
  -F "description=December statement"
```

**Benefits:**
- Free (no API costs)
- Private (data stays local)
- No internet required

### 3. `/upload`
Upload CSV and get raw content back

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@statement.csv" \
  -F "description=Test upload"
```

### 4. `/generate`
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

### For OpenAI Setup:
- [x] Rust is installed: `rustc --version`
- [x] API key is set: `echo $OPENAI_API_KEY`
- [x] Backend compiles: `cargo check`
- [x] Backend runs: `cargo run`
- [x] Test endpoint: `curl -X POST http://localhost:3000/analyze-transactions-openai -F "file=@test.csv" -F "description=test"`

### For Ollama Setup:
- [x] Rust is installed: `rustc --version`
- [x] Ollama is installed: `ollama --version`
- [x] Ollama service is running: `curl http://localhost:11434/api/tags`
- [x] Model is available: `ollama list` (should show llama3.2:3b or mistral:latest)
- [x] Backend compiles: `cargo check`
- [x] Backend runs: `cargo run`

## Next Steps

1. Try the Swagger UI at `http://localhost:3000/swagger-ui`
2. Read `OPENAI_INTEGRATION.md` for OpenAI setup and usage details
3. Read `API_USAGE.md` for detailed endpoint documentation
4. Read `CSV_PROCESSING.md` for architecture details
5. Read `ERROR_HANDLING.md` for troubleshooting

## Performance Tips

- Keep CSV files under 10MB for best performance
- **OpenAI**: First request ~1-3 seconds, subsequent requests similar
- **Ollama**: First request may be slow (model loading), subsequent requests ~3-5 seconds
- Use `/analyze-transactions-openai` for production (most reliable)
- Use `/analyze-transactions` for development (free, private)
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

**For OpenAI:**
✅ API key is set: `echo $OPENAI_API_KEY`
✅ Backend shows: "Running on http://localhost:3000"
✅ Swagger UI loads: `http://localhost:3000/swagger-ui`
✅ Test endpoint works: `curl http://localhost:3000/`
✅ OpenAI analysis returns valid JSON (not errors)

**For Ollama:**
✅ Ollama service responds: `curl http://localhost:11434/api/tags`
✅ Backend shows: "Running on http://localhost:3000"
✅ Swagger UI loads: `http://localhost:3000/swagger-ui`
✅ Test endpoint works: `curl http://localhost:3000/`
✅ Ollama analysis returns results (not errors)

## Need Help?

- Check server logs in the terminal where you ran `cargo run`
- Visit `http://localhost:3000/swagger-ui` to test interactively
- Read `OPENAI_INTEGRATION.md` for OpenAI-specific help
- Read `ERROR_HANDLING.md` for detailed troubleshooting
- **Ollama users**: Ensure both Ollama and backend are running simultaneously
- **OpenAI users**: Verify OPENAI_API_KEY is set correctly

## Architecture Overview

**With OpenAI:**
```
User → Backend (Axum) → OpenAI (GPT-4o-mini) → AI Analysis → User
         ↑
    CSV uploaded → Cloud processing → Structured JSON
```

**With Ollama:**
```
User → Backend (Axum) → Ollama (Mistral/Llama) → AI Analysis → User
         ↑
    CSV uploaded → Local processing → Structured JSON
```

**Both options:**
- CSV sent directly as text (no conversion!)
- Same JSON response format
- Easy to switch between them

Simple, fast, and efficient! 🚀
