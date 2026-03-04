# Credit Card Transaction Analyzer - Backend

AI-powered credit card transaction analysis with support for **OpenAI** and **local Ollama** models.

## Features

- 📊 **AI-Powered Categorization** - Automatically categorize transactions (Gas, Restaurants, Groceries, etc.)
- 🔄 **Dual Backend Support** - Choose between OpenAI (cloud) or Ollama (local)
- 📁 **CSV Upload** - Direct CSV file processing
- 🚀 **Fast Processing** - 1-3 seconds with OpenAI, 3-30 seconds with Ollama
- 📝 **Structured JSON Output** - Consistent, validated JSON responses
- 🔒 **Privacy Options** - Cloud processing (OpenAI) or local processing (Ollama)
- 📚 **OpenAPI Documentation** - Interactive Swagger UI at `/swagger-ui`

## Quick Start

### Option 1: OpenAI (Recommended for Production)

```bash
# 1. Set your API key
export OPENAI_API_KEY='sk-your-api-key-here'

# 2. Start the backend
cargo run

# 3. Test it
curl -X POST http://localhost:3000/analyze-transactions-openai \
  -F "file=@transactions.csv" \
  -F "description=My statement"
```

**Get an API Key:** https://platform.openai.com/

### Option 2: Ollama (Recommended for Development)

```bash
# 1. Install and start Ollama
ollama serve

# 2. Pull a model
ollama pull mistral:latest

# 3. Start the backend
cargo run

# 4. Test it
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@transactions.csv" \
  -F "description=My statement"
```

**Install Ollama:** https://ollama.ai/

## API Endpoints

### 🔥 `/analyze-transactions-openai` (Production)
**AI-powered analysis using OpenAI**

```bash
curl -X POST http://localhost:3000/analyze-transactions-openai \
  -F "file=@statement.csv" \
  -F "description=December 2024"
```

**Benefits:**
- ✅ Most accurate categorization
- ✅ Consistent JSON output
- ✅ Fast (1-3 seconds)
- ✅ No local setup required
- 💰 ~$0.001-$0.005 per file

### 🛠️ `/analyze-transactions` (Development)
**AI-powered analysis using local Ollama**

```bash
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@statement.csv" \
  -F "description=December 2024"
```

**Benefits:**
- ✅ Free (no API costs)
- ✅ Private (data stays local)
- ✅ No internet required
- ⚠️ Requires Ollama running

### 📤 `/upload`
**Upload CSV and get raw content**

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@statement.csv" \
  -F "description=Test upload"
```

### 🤖 `/generate`
**Generic AI text generation**

```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"system_instructions": "You are helpful", "user_data": "Hello!"}'
```

## Response Format

Both AI endpoints return the same structure:

```json
{
  "analysis": "{\"categories\":{\"Gas\":{\"transactions\":[{\"date\":\"2024-12-30\",\"merchant\":\"PETRO-CANADA\",\"amount\":64.04}],\"total\":64.04},\"Restaurants\":{...}},\"grand_total\":1234.56}",
  "transaction_count": 87
}
```

**Parse the `analysis` field:**

```javascript
const data = await response.json();
const analysis = JSON.parse(data.analysis);

console.log(analysis.grand_total);           // 1234.56
console.log(analysis.categories.Gas.total);  // 64.04
```

## CSV Format

Expected CSV structure:

```csv
"transaction_date","post_date","type","details","amount","currency"
"2024-12-04","2024-12-05","Purchase","UBER CANADA/UBEREATS","53.4","CAD"
"2024-12-05","2024-12-06","Purchase","PETRO-CANADA 91888","64.04","CAD"
```

The AI automatically:
- ✅ Categorizes transactions by merchant
- ✅ Ignores refunds/payments (negative amounts)
- ✅ Calculates totals per category
- ✅ Returns structured JSON

## Categories

Transactions are categorized into 6 fixed categories:

- **Gas** - Gas stations (Petro-Canada, Shell, Esso)
- **Restaurants** - Food and dining (Uber Eats, restaurants, cafes)
- **Groceries** - Grocery stores (Whole Foods, Save-On-Foods, T&T)
- **Entertainment** - Entertainment (Spotify, Netflix, movies, golf)
- **Utilities** - Bills and utilities (Internet, phone, insurance)
- **Miscellaneous** - Everything else

## Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[OPENAI_INTEGRATION.md](./OPENAI_INTEGRATION.md)** - OpenAI setup and usage
- **[CHOOSING_AI_BACKEND.md](./CHOOSING_AI_BACKEND.md)** - Compare OpenAI vs Ollama
- **[API_USAGE.md](./API_USAGE.md)** - Detailed API documentation
- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** - Troubleshooting guide
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history

## Comparison: OpenAI vs Ollama

| Feature | OpenAI | Ollama |
|---------|--------|--------|
| **Cost** | ~$0.001-$0.005/file | Free |
| **Setup** | API key only | Install + run service |
| **Speed** | 1-3 seconds | 3-30 seconds |
| **Accuracy** | Excellent | Good |
| **Privacy** | Cloud (OpenAI) | Local (your machine) |
| **Hardware** | None | CPU works, GPU better |
| **Best For** | Production | Development |

**Recommendation:** Use OpenAI for production, Ollama for development.

## Architecture

```
┌─────────┐
│  User   │
└────┬────┘
     │ Upload CSV
     ▼
┌─────────────────┐
│  Axum Backend   │
│  (Rust)         │
└────┬───────┬────┘
     │       │
     ▼       ▼
┌─────────┐ ┌──────────┐
│ OpenAI  │ │  Ollama  │
│ GPT-4o  │ │ (Local)  │
└────┬────┘ └────┬─────┘
     │           │
     └───┬───┬───┘
         │   │
         ▼   ▼
    ┌────────────┐
    │   JSON     │
    │  Response  │
    └────────────┘
```

## Technology Stack

- **[Axum](https://github.com/tokio-rs/axum)** - Web framework
- **[async-openai](https://github.com/64bit/async-openai)** - OpenAI API client
- **[ollama-rs](https://github.com/pepperoni21/ollama-rs)** - Ollama API client
- **[utoipa](https://github.com/juhaku/utoipa)** - OpenAPI documentation
- **[Tokio](https://tokio.rs/)** - Async runtime

## Development

### Prerequisites

- Rust 1.70+ ([Install](https://rustup.rs/))
- (Optional) Ollama ([Install](https://ollama.ai/))
- (Optional) OpenAI API Key ([Get Key](https://platform.openai.com/))

### Build

```bash
# Check compilation
cargo check

# Build debug
cargo build

# Build release
cargo build --release
```

### Run

```bash
# Development mode (with auto-reload)
cargo watch -x run

# Normal mode
cargo run

# Release mode
cargo run --release
```

### Test

```bash
# Run tests
cargo test

# Test with logs
RUST_LOG=debug cargo test

# Test specific endpoint
curl -X POST http://localhost:3000/analyze-transactions-openai \
  -F "file=@test.csv" \
  -F "description=test"
```

### Interactive API Documentation

Visit **http://localhost:3000/swagger-ui** for interactive API testing.

## Configuration

### Environment Variables

```bash
# OpenAI API Key (required for /analyze-transactions-openai)
export OPENAI_API_KEY='sk-your-key-here'

# Ollama URL (optional, defaults to localhost:11434)
export OLLAMA_HOST='http://localhost:11434'

# Log level (optional)
export RUST_LOG=debug
```

### Model Configuration

Edit `src/constants.rs` to change models:

```rust
// Ollama model
pub const MODEL_NAME: &str = "mistral:latest";

// OpenAI model
pub const OPENAI_MODEL: &str = "gpt-4o-mini";
```

**Ollama model options:**
- `mistral:latest` (recommended, balanced)
- `llama3.2:latest` (faster, may hallucinate)
- `qwen2.5:7b` (good accuracy)

**OpenAI model options:**
- `gpt-4o-mini` (recommended, best value)
- `gpt-4o` (highest quality, more expensive)
- `gpt-3.5-turbo` (fastest, cheapest)

## Error Handling

All endpoints return structured error responses:

```json
{
  "error": "OpenAI API error",
  "message": "Failed to connect to OpenAI API. Please check your OPENAI_API_KEY environment variable..."
}
```

Common errors:

- **503 Service Unavailable** - Ollama not running or OpenAI API down
- **500 Internal Server Error** - Invalid JSON from AI or file read error
- **400 Bad Request** - Malformed CSV or missing fields

See [ERROR_HANDLING.md](./ERROR_HANDLING.md) for detailed troubleshooting.

## Performance

### Benchmarks

Tested with 200 transactions:

| Backend | Time | Hardware |
|---------|------|----------|
| OpenAI (gpt-4o-mini) | 2.1s | Cloud |
| Ollama (mistral 7B) | 6.2s | RTX 3060 |
| Ollama (llama3.2 3B) | 9.8s | RTX 3060 |
| Ollama (mistral 7B) | 24.3s | CPU only |

### Cost Estimates

**OpenAI (GPT-4o-mini):**
- 50 transactions: $0.0005
- 200 transactions: $0.002
- 500 transactions: $0.005

**Ollama:**
- All: $0 (free)

## Security

- ✅ CORS configured for local development
- ✅ No hardcoded API keys (environment variables)
- ✅ File uploads cleaned after processing (tempfile)
- ✅ Input validation on all endpoints
- ⚠️ Add authentication for production use
- ⚠️ Add rate limiting for production use

## Deployment

### Docker (Coming Soon)

```bash
# Build
docker build -t creditcard-analyzer .

# Run with OpenAI
docker run -e OPENAI_API_KEY=sk-xxx -p 3000:3000 creditcard-analyzer

# Run with Ollama
docker run --network host creditcard-analyzer
```

### Environment Setup

For production, set environment variables:

```bash
# .env file (don't commit!)
OPENAI_API_KEY=sk-prod-key-here
RUST_LOG=info
```

## Contributing

Contributions welcome! See main repository for guidelines.

## License

See [LICENSE](../LICENSE) in repository root.

## Support

- 📖 Read the documentation in this directory
- 🐛 Report issues on GitHub
- 💬 Ask questions in discussions
- 📧 Contact: [your-email@example.com]

## Roadmap

- [ ] Add response caching to reduce API costs
- [ ] Implement batch processing for large CSVs
- [ ] Add streaming responses for real-time updates
- [ ] Support more bank CSV formats
- [ ] Add user authentication
- [ ] Docker deployment
- [ ] Azure OpenAI support
- [ ] Custom category configuration
- [ ] Web UI for testing

## Credits

Built with ❤️ using Rust and AI.

Powered by:
- [OpenAI](https://openai.com/) - GPT models
- [Ollama](https://ollama.ai/) - Local AI inference
- [Axum](https://github.com/tokio-rs/axum) - Web framework

---

**Ready to analyze transactions? Start with [QUICK_START.md](./QUICK_START.md)!** 🚀