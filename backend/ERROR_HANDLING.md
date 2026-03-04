# Error Handling Documentation

## Overview

The backend implements proper error handling for all AI-related operations, particularly for Ollama service connectivity issues.

## Error Response Format

When an error occurs, the API returns a structured JSON response with appropriate HTTP status codes:

```json
{
  "error": "Error type",
  "message": "Detailed error message with troubleshooting steps"
}
```

## HTTP Status Codes

### 200 OK
Request succeeded, data returned successfully.

### 503 Service Unavailable
Ollama service is not running or unreachable.

**Example Response:**
```json
{
  "error": "Ollama service unavailable",
  "message": "Failed to connect to Ollama. Please ensure Ollama is running (try 'ollama serve'). Error: connection refused"
}
```

**Common Causes:**
1. Ollama service not started
2. Ollama running on different port
3. Network connectivity issues
4. Ollama crashed or hung

**Solutions:**
```bash
# Start Ollama service
ollama serve

# Or run in background
ollama serve &

# Check if Ollama is running
curl http://localhost:11434/api/tags

# Verify model is available
ollama list
ollama pull llama3.2:3b  # If model not found
```

## Endpoints with Error Handling

### `/analyze-transactions`

**Success (200):**
```json
{
  "analysis": "CATEGORIZED TRANSACTIONS:\n...",
  "transaction_count": 87
}
```

**Error (503):**
```json
{
  "error": "Ollama service unavailable",
  "message": "Failed to connect to Ollama. Please ensure Ollama is running (try 'ollama serve'). Error: ..."
}
```

**Example:**
```bash
# Without Ollama running
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@statement.csv"

# Returns:
# Status: 503 Service Unavailable
# {
#   "error": "Ollama service unavailable",
#   "message": "Failed to connect to Ollama. Please ensure Ollama is running (try 'ollama serve'). Error: error sending request for url (http://localhost:11434/api/generate): error trying to connect: tcp connect error: Connection refused (os error 61)"
# }
```

### `/generate`

**Success (200):**
```json
{
  "response": "AI generated response..."
}
```

**Error (503):**
```json
{
  "error": "Ollama service unavailable",
  "message": "Failed to connect to Ollama. Please ensure Ollama is running (try 'ollama serve'). Error: ..."
}
```

## Implementation Details

### Error Handling Pattern

```rust
let res = state
    .ollama
    .generate(req)
    .await
    .map_err(|e| {
        eprintln!("Ollama error: {}", e);
        (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(ErrorResponse {
                error: "Ollama service unavailable".to_string(),
                message: format!(
                    "Failed to connect to Ollama. Please ensure Ollama is running (try 'ollama serve'). Error: {}",
                    e
                ),
            }),
        )
    })?;
```

### Key Features

1. **Logs to stderr** - Server logs show detailed error for debugging
2. **Returns structured JSON** - Client gets machine-readable error
3. **Helpful message** - Includes troubleshooting steps
4. **Proper status code** - 503 indicates service dependency failure
5. **Error propagation** - Uses `?` operator for clean code

## Common Error Scenarios

### 1. Ollama Not Running

**Symptom:** 
```
Ollama error: error sending request for url (http://localhost:11434/api/generate): error trying to connect: tcp connect error: Connection refused
```

**Solution:**
```bash
ollama serve
```

### 2. Model Not Available

**Symptom:**
```
Ollama error: model 'llama3.2:3b' not found
```

**Solution:**
```bash
ollama pull llama3.2:3b
```

### 3. Ollama Port Conflict

**Symptom:**
```
Ollama error: connection refused on port 11434
```

**Solution:**
```bash
# Check what's using the port
lsof -i :11434

# Kill conflicting process or restart Ollama
killall ollama
ollama serve
```

### 4. Timeout

**Symptom:**
```
Ollama error: request timeout
```

**Solution:**
- Check system resources (RAM, CPU)
- Try a smaller model
- Increase timeout if processing large data

## Frontend Integration

When calling the API from frontend, handle errors appropriately:

```javascript
try {
  const response = await fetch('http://localhost:3000/analyze-transactions', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // Handle error
    console.error(`Error: ${data.error}`);
    alert(`Service unavailable: ${data.message}`);
    // Show user-friendly message
  } else {
    // Success - show results
    displayAnalysis(data.analysis);
  }
} catch (error) {
  console.error('Network error:', error);
  alert('Could not connect to backend server');
}
```

## Server Logs

When errors occur, detailed information is logged to stderr:

```bash
# Start server with logging
cargo run

# When error occurs, you'll see:
# Ollama error: error sending request for url (http://localhost:11434/api/generate): error trying to connect: tcp connect error: Connection refused (os error 61)
```

## Testing Error Handling

### Test 1: Ollama Not Running
```bash
# Stop Ollama
killall ollama

# Try to analyze transactions
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@test.csv" \
  -w "\nHTTP Status: %{http_code}\n"

# Expected: 503 with error message
```

### Test 2: Successful Request
```bash
# Start Ollama
ollama serve &

# Try to analyze transactions
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@test.csv" \
  -w "\nHTTP Status: %{http_code}\n"

# Expected: 200 with analysis
```

## Future Improvements

Potential enhancements:

- [ ] Add retry logic for transient failures
- [ ] Implement circuit breaker pattern
- [ ] Add health check endpoint (`/health`)
- [ ] More granular error codes (model not found vs connection refused)
- [ ] Timeout configuration
- [ ] Rate limiting error responses
- [ ] Structured logging (JSON logs)
- [ ] Error metrics/monitoring

## Troubleshooting Checklist

If you encounter errors:

1. ✅ Is Ollama running? `ps aux | grep ollama`
2. ✅ Is the model available? `ollama list`
3. ✅ Can you reach Ollama? `curl http://localhost:11434/api/tags`
4. ✅ Is the backend running? `curl http://localhost:3000/`
5. ✅ Check backend logs for detailed errors
6. ✅ Check system resources (RAM/CPU)
7. ✅ Try restarting both services

## Summary

The error handling system provides:

- ✅ Clear error messages with troubleshooting steps
- ✅ Proper HTTP status codes
- ✅ Structured JSON responses
- ✅ Server-side logging for debugging
- ✅ Graceful degradation (no panics)
- ✅ User-friendly guidance

This ensures a better developer experience when things go wrong!