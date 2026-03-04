# AI Model Issues and Solutions

## Problem: AI Hallucinations and Invalid JSON

### Symptoms

1. **Duplicate Transactions**: Same transaction repeated 100+ times
   ```json
   {"date": "2025-12-09", "merchant": "UBER CANADA/UBEREATS", "amount": 69.87},
   {"date": "2025-12-09", "merchant": "UBER CANADA/UBEREATS", "amount": 69.87},
   {"date": "2025-12-09", "merchant": "UBER CANADA/UBEREATS", "amount": 69.87},
   ... (repeats 100+ times)
   ```

2. **Wrong Categories**: Creates categories not in the specification
   - Creates: "Food", "Shopping", "Online Shopping"
   - Should only use: Gas, Restaurants, Groceries, Entertainment, Utilities, Miscellaneous

3. **Malformed JSON**: Invalid syntax like trailing commas, missing brackets
   ```
   Error: expected `,` or `]` at line 70 column 5
   ```

4. **Incomplete Response**: JSON cut off mid-generation

## Root Causes

### 1. Model Too Small
**Problem**: `llama3.2:3b` (3 billion parameters) is too small for complex JSON generation tasks with large CSV files.

**Evidence**:
- Hallucinates duplicate data
- Loses track of structure mid-generation
- Creates non-existent categories
- Can't maintain context for 80+ transactions

**Solution**: Use a larger model

### 2. Context Window Exceeded
**Problem**: CSV file with 89 transactions + prompt exceeds model's context window

**Solution**: Process in batches or use streaming

### 3. Insufficient Constraints
**Problem**: Model doesn't follow instructions precisely

**Solution**: Add explicit anti-hallucination rules

## Solutions

### Solution 1: Use a Larger Model (RECOMMENDED)

Change the model in `backend/src/constants.rs`:

```rust
// Current (too small)
pub const MODEL_NAME: &str = "llama3.2:3b";

// Better options:
pub const MODEL_NAME: &str = "llama3.2:latest";  // ~7B-11B parameters
pub const MODEL_NAME: &str = "llama3.1:8b";      // 8B parameters
pub const MODEL_NAME: &str = "mistral:latest";   // 7B parameters, good at structured output
pub const MODEL_NAME: &str = "qwen2.5:7b";       // Excellent at following instructions
```

**Steps**:
1. Pull the larger model:
   ```bash
   ollama pull llama3.2:latest
   # or
   ollama pull mistral:latest
   ```

2. Update `constants.rs` with the new model name

3. Restart backend and test

**Expected improvement**:
- ✅ No duplicate transactions
- ✅ Correct categories
- ✅ Valid JSON structure
- ✅ Completes all transactions

### Solution 2: Add Response Streaming

For very large CSV files, implement streaming:

```rust
// In main.rs
use ollama_rs::generation::completion::GenerationResponseStream;

// Stream tokens instead of waiting for complete response
let stream = state.ollama.generate_stream(req).await?;
// Process stream to build JSON incrementally
```

### Solution 3: Batch Processing

Process transactions in smaller batches:

```rust
// Split CSV into chunks of 20-30 transactions
// Process each batch separately
// Merge results
```

### Solution 4: Use JSON Mode (if supported)

Some models support native JSON output mode:

```rust
let req = GenerationRequest::new(MODEL_NAME.to_string(), csv_content)
    .system(PROMPT_INSTRUCTIONS.to_string())
    .format(Format::Json); // Forces valid JSON output
```

## Testing Different Models

### Quick Model Comparison

```bash
# Test with different models
ollama pull llama3.2:latest
ollama pull mistral:latest
ollama pull qwen2.5:7b

# Update constants.rs and test each
cargo run

# In another terminal
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@test.csv" | jq '.analysis | fromjson'
```

### Model Performance Chart

| Model | Size | Speed | Accuracy | JSON Quality | Recommended |
|-------|------|-------|----------|--------------|-------------|
| llama3.2:3b | 3B | ⚡⚡⚡ | ⭐⭐ | ⭐⭐ | ❌ Too small |
| llama3.2:latest | 7-11B | ⚡⚡ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Good |
| mistral:latest | 7B | ⚡⚡ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Best for structured output |
| qwen2.5:7b | 7B | ⚡⚡ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Best at following instructions |
| llama3.1:8b | 8B | ⚡ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Most accurate |

### Performance Requirements

- **RAM**: 8GB minimum for 7B models, 16GB recommended
- **CPU**: Modern multi-core processor (4+ cores)
- **Storage**: 5-10GB per model

## Current Configuration

**File**: `backend/src/constants.rs`

```rust
pub const MODEL_NAME: &str = "llama3.2:latest"; // Updated from 3b
```

## Verification Steps

After changing models, verify the output:

### 1. Check for Valid JSON
```bash
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@test.csv" | jq '.analysis | fromjson' > /dev/null
echo $? # Should be 0 (success)
```

### 2. Check for Duplicates
```bash
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@test.csv" \
  | jq '.analysis | fromjson | .categories | to_entries[] | .value.transactions | length'
# Compare counts with actual CSV rows
```

### 3. Check Categories
```bash
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@test.csv" \
  | jq '.analysis | fromjson | .categories | keys'
# Should output: ["Entertainment", "Gas", "Groceries", "Miscellaneous", "Restaurants", "Utilities"]
```

### 4. Validate Totals
```bash
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@test.csv" \
  | jq '.analysis | fromjson | .grand_total'
# Manually verify this matches sum of all positive amounts in CSV
```

## Debugging Tips

### Enable Verbose Logging

```rust
// In main.rs, add before calling ollama
eprintln!("Sending {} bytes to model {}", csv_content.len(), MODEL_NAME);
eprintln!("Prompt length: {} chars", PROMPT_INSTRUCTIONS.len());

// After receiving response
eprintln!("Received {} bytes from model", res.response.len());
eprintln!("First 200 chars: {}", &res.response[..200.min(res.response.len())]);
```

### Check Ollama Logs

```bash
# See Ollama service logs
ollama ps
ollama logs
```

### Reduce CSV Size for Testing

```bash
# Test with just 10 transactions
head -n 11 large_statement.csv > small_test.csv
curl -X POST http://localhost:3000/analyze-transactions -F "file=@small_test.csv"
```

## When to Use Each Solution

| Scenario | Solution |
|----------|----------|
| < 50 transactions | Use `llama3.2:latest` or `mistral:latest` |
| 50-100 transactions | Use `llama3.1:8b` or `qwen2.5:7b` |
| 100+ transactions | Implement batch processing |
| Limited RAM (< 8GB) | Stick with `llama3.2:3b` but process in batches |
| Need speed | Use `mistral:latest` |
| Need accuracy | Use `qwen2.5:7b` or `llama3.1:8b` |

## Alternative Approach: Rule-Based Categorization

If AI models continue to hallucinate, implement rule-based categorization:

```rust
fn categorize_merchant(merchant: &str) -> &str {
    let merchant_lower = merchant.to_lowercase();
    
    if merchant_lower.contains("petro") || merchant_lower.contains("gas") {
        "Gas"
    } else if merchant_lower.contains("uber") || merchant_lower.contains("restaurant") {
        "Restaurants"
    } else if merchant_lower.contains("whole foods") || merchant_lower.contains("grocery") {
        "Groceries"
    }
    // ... etc
}
```

**Pros**: Fast, deterministic, no hallucinations
**Cons**: Requires manual rule maintenance

## Summary

**Immediate fix**: Change model from `llama3.2:3b` to `llama3.2:latest` or `mistral:latest`

```bash
# 1. Pull larger model
ollama pull mistral:latest

# 2. Update constants.rs
# Change MODEL_NAME to "mistral:latest"

# 3. Restart backend
cargo run

# 4. Test
curl -X POST http://localhost:3000/analyze-transactions -F "file=@test.csv"
```

This should eliminate hallucinations and produce valid JSON! 🎉