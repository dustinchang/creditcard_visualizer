# OpenAI Integration Guide

This document explains how to use the OpenAI-powered transaction analysis endpoint in the Credit Card Visualizer backend.

## Overview

The `/analyze-transactions-openai` endpoint uses OpenAI's GPT models to analyze credit card transaction CSV files. This provides more reliable and accurate JSON output compared to smaller local models, with reduced hallucination and better categorization.

## Key Advantages Over Local Models

1. **Reliability**: OpenAI models (especially GPT-4o-mini) produce consistently valid JSON
2. **Speed**: Cloud-based processing without local GPU requirements
3. **No Hallucination**: Properly processes each transaction exactly once
4. **Better Categorization**: Superior merchant name recognition and category assignment
5. **Scalability**: Handles larger CSV files without memory constraints

## Setup

### 1. Install Dependencies

The `async-openai` crate is already included in `Cargo.toml`:

```toml
async-openai = { version = "0.33.0", features = ["chat-completion"] }
```

### 2. Set OpenAI API Key

Set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY='sk-your-api-key-here'
```

Or create a `.env` file in the backend directory:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

**Security Note**: Never commit your API key to version control!

### 3. Get an API Key

If you don't have an OpenAI API key:

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy the key (you won't be able to see it again!)

## API Endpoint

### Endpoint Details

- **URL**: `POST /analyze-transactions-openai`
- **Content-Type**: `multipart/form-data`
- **Authentication**: None (API key read from environment)

### Request Format

Send a multipart form with the following fields:

- `file`: CSV file containing credit card transactions
- `description`: String description (e.g., "December 2024 Transactions")

### Example Request (curl)

```bash
curl -X POST http://localhost:3000/analyze-transactions-openai \
  -F "file=@transactions.csv" \
  -F "description=My transactions"
```

### Example Request (JavaScript/Fetch)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('description', 'December 2024');

const response = await fetch('http://localhost:3000/analyze-transactions-openai', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
const analysis = JSON.parse(data.analysis);
console.log(analysis);
```

### Response Format

```json
{
  "analysis": "{\"categories\":{\"Gas\":{...},\"Restaurants\":{...}},\"grand_total\":1234.56}",
  "transaction_count": 42
}
```

The `analysis` field is a JSON string that needs to be parsed:

```javascript
const analysis = JSON.parse(data.analysis);
```

**Parsed structure:**

```json
{
  "categories": {
    "Gas": {
      "transactions": [
        {
          "date": "2024-12-30",
          "merchant": "PETRO-CANADA 91888",
          "amount": 64.04
        }
      ],
      "total": 64.04
    },
    "Restaurants": {
      "transactions": [
        {
          "date": "2024-12-04",
          "merchant": "UBER CANADA/UBEREATS",
          "amount": 53.40
        }
      ],
      "total": 53.40
    },
    "Groceries": {
      "transactions": [],
      "total": 0.00
    },
    "Entertainment": {
      "transactions": [],
      "total": 0.00
    },
    "Utilities": {
      "transactions": [],
      "total": 0.00
    },
    "Miscellaneous": {
      "transactions": [],
      "total": 0.00
    }
  },
  "grand_total": 117.44
}
```

## Model Configuration

### Current Model

The endpoint uses **GPT-4o-mini** by default (configured in `constants.rs`):

```rust
pub const OPENAI_MODEL: &str = "gpt-4o-mini";
```

### Model Options

| Model | Speed | Cost | Quality | Recommended For |
|-------|-------|------|---------|-----------------|
| `gpt-4o-mini` | Fast | Low | High | **Recommended** - Best balance |
| `gpt-4o` | Medium | Medium | Highest | Complex/large datasets |
| `gpt-3.5-turbo` | Fastest | Lowest | Good | Simple categorization |

### Changing the Model

Edit `src/constants.rs`:

```rust
pub const OPENAI_MODEL: &str = "gpt-4o"; // or "gpt-3.5-turbo"
```

## Temperature Setting

The endpoint uses `temperature: 0.1` for consistent, deterministic JSON output:

```rust
.temperature(0.1) // Low temperature for more consistent JSON output
```

- **Lower (0.0-0.3)**: More consistent, deterministic responses (recommended for JSON)
- **Higher (0.7-1.0)**: More creative, varied responses (not recommended here)

## Error Handling

### Possible Errors

1. **503 Service Unavailable**: OpenAI API is unreachable or API key is invalid
   ```json
   {
     "error": "OpenAI API error",
     "message": "Failed to connect to OpenAI API. Please check your OPENAI_API_KEY environment variable..."
   }
   ```

2. **500 Internal Server Error**: AI returned invalid JSON
   ```json
   {
     "error": "AI response error",
     "message": "OpenAI returned invalid JSON. Please try again..."
   }
   ```

3. **500 File Read Error**: Cannot read uploaded file
   ```json
   {
     "error": "File read error",
     "message": "Failed to read file contents..."
   }
   ```

### Debugging

Check the server logs for detailed error information:

```bash
cargo run
# Watch for lines starting with:
# - "OpenAI returned invalid JSON:"
# - "OpenAI API error:"
```

## Cost Estimates

### GPT-4o-mini Pricing (as of 2024)

- **Input**: ~$0.15 per 1M tokens
- **Output**: ~$0.60 per 1M tokens

### Estimated Cost per CSV File

| Transactions | Input Tokens | Output Tokens | Cost |
|--------------|--------------|---------------|------|
| 50           | ~1,500       | ~500          | ~$0.0005 |
| 200          | ~6,000       | ~2,000        | ~$0.002 |
| 500          | ~15,000      | ~5,000        | ~$0.005 |

**Note**: These are rough estimates. Actual costs depend on merchant name length and CSV format.

## Comparison: OpenAI vs Local Ollama

| Feature | OpenAI (`/analyze-transactions-openai`) | Local Ollama (`/analyze-transactions`) |
|---------|----------------------------------------|----------------------------------------|
| **Setup** | API key required | Ollama must be running locally |
| **Cost** | ~$0.001 per file | Free |
| **Speed** | Fast (1-3 seconds) | Varies (3-30 seconds) |
| **Accuracy** | Excellent | Good (depends on model) |
| **Hallucinations** | Rare | Can occur with small models |
| **JSON Validity** | Always valid | Sometimes needs cleaning |
| **Hardware** | None | GPU recommended for speed |
| **Privacy** | Data sent to OpenAI | Data stays local |

## Best Practices

### 1. Environment Management

Use different API keys for development and production:

```bash
# Development
export OPENAI_API_KEY='sk-dev-key...'

# Production
export OPENAI_API_KEY='sk-prod-key...'
```

### 2. Rate Limiting

OpenAI has rate limits. For production, implement:

- Request queuing
- Exponential backoff retry logic
- User-based rate limiting

### 3. Caching

Consider caching results to avoid re-processing the same CSV:

```rust
// Pseudo-code
if let Some(cached) = cache.get(&csv_hash) {
    return cached;
}
```

### 4. Monitoring

Track OpenAI API usage:

- Log all API calls
- Monitor costs in OpenAI dashboard
- Set up billing alerts

## Implementation Details

### Code Structure

The endpoint is implemented in `src/main.rs`:

```rust
async fn analyze_transactions_openai(
    State(state): State<Arc<AppState>>,
    TypedMultipart(file): TypedMultipart<UploadFileRequest>,
) -> Result<Json<AnalyzeTransactionsResponse>, (StatusCode, Json<ErrorResponse>)>
```

### Key Components

1. **CSV Reading**: Uses same logic as Ollama endpoint
2. **Request Building**: Uses `CreateChatCompletionRequestArgs` builder pattern
3. **System Prompt**: Reuses `PROMPT_INSTRUCTIONS` from `constants.rs`
4. **Response Parsing**: Same JSON cleaning/validation pipeline
5. **Error Handling**: Unified error handling via `handle_error` utility

### AppState Configuration

The OpenAI client is initialized in `main()`:

```rust
let openai = OpenAIClient::new(); // Reads OPENAI_API_KEY from env
let shared_state = Arc::new(AppState { ollama, openai });
```

## Testing

### Test with Sample CSV

```bash
# Create a test CSV
cat > test.csv << 'EOF'
date,type,details,amount
2024-12-30,Purchase,PETRO-CANADA 91888,64.04
2024-12-04,Purchase,UBER CANADA/UBEREATS,53.40
EOF

# Test the endpoint
curl -X POST http://localhost:3000/analyze-transactions-openai \
  -F "file=@test.csv" \
  -F "description=Test"
```

### Swagger UI Testing

1. Start the server: `cargo run`
2. Open http://localhost:3000/swagger-ui
3. Find `/analyze-transactions-openai` endpoint
4. Click "Try it out"
5. Upload a CSV file
6. Execute and view response

## Troubleshooting

### "OpenAI API error" - Invalid API Key

**Problem**: API key not found or invalid

**Solution**:
```bash
# Check if key is set
echo $OPENAI_API_KEY

# Set it if missing
export OPENAI_API_KEY='sk-your-key-here'

# Restart the server
cargo run
```

### "Request build error"

**Problem**: Invalid request parameters

**Solution**: Check that `OPENAI_MODEL` in `constants.rs` is a valid model name

### Rate Limit Errors

**Problem**: Too many requests to OpenAI API

**Solution**:
- Wait a minute and try again
- Upgrade your OpenAI plan
- Implement request queuing

## Next Steps

### Enhancements

1. **Streaming Responses**: Use streaming for real-time progress updates
2. **Batch Processing**: Split large CSVs into smaller batches
3. **Response Caching**: Cache results by CSV hash
4. **Retry Logic**: Add exponential backoff for transient failures
5. **Cost Tracking**: Log and monitor API usage costs

### Alternative Models

Consider using other OpenAI-compatible APIs:

- **Azure OpenAI**: Enterprise features and compliance
- **OpenRouter**: Access to multiple models (Claude, Llama, etc.)
- **Together AI**: Cheaper alternatives with similar APIs

## Support

For issues or questions:

1. Check server logs: `cargo run` output
2. Review Swagger docs: http://localhost:3000/swagger-ui
3. Consult OpenAI docs: https://platform.openai.com/docs
4. See `AI_MODEL_ISSUES.md` for common problems

## References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [async-openai Crate Docs](https://docs.rs/async-openai)
- [GPT-4o-mini Model Card](https://platform.openai.com/docs/models/gpt-4o-mini)
- [API Usage Guide](./API_USAGE.md)
- [Error Handling Guide](./ERROR_HANDLING.md)