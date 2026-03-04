# JSON Response Handling from AI

## Problem

The AI model (Llama 3.2) was returning malformed JSON responses with several issues:

1. **Markdown code blocks** - Responses wrapped in ````json` and ````
2. **Wrong structure** - Categories as arrays instead of objects with `transactions` and `total`
3. **Extra text** - Explanations or code before/after the JSON
4. **Inconsistent format** - Multiple top-level keys that don't match our schema

### Example of Bad Response

```json
{
  "categories": {
    "Gas": [  // ❌ Should be object with transactions array, not array
      {"date": "2025-12-30", "merchant": "PETRO-CANADA", "amount": 64.04}
    ],
    "Restaurants": [ ... ]
  },
  "expenses": [ ... ],  // ❌ Extra unexpected field
  "categories": [ ... ]  // ❌ Duplicate key with different structure
}
```
(wrapped in ````json` markdown)

## Solution

Implemented a two-part fix:

### 1. Stricter Prompt Instructions (`constants.rs`)

**Key Changes:**
- Added "CRITICAL RULES" section at the top
- Explicit instruction: "Return ONLY valid JSON - no markdown, no code blocks"
- Provided exact JSON structure to copy
- Added validation checklist for the AI to follow
- Simplified categories to prevent confusion

**Example Structure Provided:**
```json
{
  "categories": {
    "Gas": {
      "transactions": [
        {"date": "2025-12-30", "merchant": "PETRO-CANADA", "amount": 64.04}
      ],
      "total": 64.04
    },
    "Restaurants": { "transactions": [], "total": 0.00 },
    ...
  },
  "grand_total": 64.04
}
```

### 2. Response Cleaning Function (`utils.rs`)

Created `clean_json_response()` to sanitize AI output:

```rust
pub fn clean_json_response(raw_json: &str) -> String {
    // 1. Trim whitespace
    let trimmed = raw_json.trim();
    
    // 2. Remove markdown code blocks (```json ... ```)
    let without_markdown = if trimmed.starts_with("```") {
        // Extract content between ``` markers
        ...
    } else {
        trimmed
    };
    
    // 3. Validate JSON boundaries ({ and })
    if result.starts_with('{') && result.ends_with('}') {
        return result.to_string();
    }
    
    // 4. Try to extract JSON if buried in text
    // Find first { and last }
    ...
}
```

### 3. JSON Validation (`main.rs`)

Added validation before returning response:

```rust
// Clean the JSON response
let cleaned_json = clean_json_response(&res.response);

// Validate it's actually valid JSON
if let Err(e) = serde_json::from_str::<serde_json::Value>(&cleaned_json) {
    eprintln!("AI returned invalid JSON: {}", e);
    return Err(handle_error(...));
}

// Return cleaned and validated JSON
Ok(Json(AnalyzeTransactionsResponse {
    analysis: cleaned_json,
    transaction_count: row_count,
}))
```

## How It Works

### Request Flow

```
1. User uploads CSV
   ↓
2. Backend sends CSV + strict prompt to AI
   ↓
3. AI returns response (possibly with markdown)
   ↓
4. clean_json_response() removes markdown
   ↓
5. Validate JSON is parseable
   ↓
6. Return cleaned JSON to frontend
```

### Cleaning Examples

**Input 1: Markdown wrapped**
```
```json
{"categories": {...}}
```
```
**Output:** `{"categories": {...}}`

**Input 2: Extra text before**
```
Here's the analysis:
{"categories": {...}}
```
**Output:** `{"categories": {...}}`

**Input 3: Already clean**
```
{"categories": {...}}
```
**Output:** `{"categories": {...}}`

## Expected Response Format

The AI should now consistently return:

```json
{
  "categories": {
    "Gas": {
      "transactions": [
        {"date": "2025-12-30", "merchant": "PETRO-CANADA 91888", "amount": 64.04}
      ],
      "total": 64.04
    },
    "Restaurants": {
      "transactions": [
        {"date": "2025-12-04", "merchant": "UBER CANADA/UBEREATS", "amount": 53.40},
        {"date": "2025-12-07", "merchant": "BROWNS SOCIALHOUSE", "amount": 124.20}
      ],
      "total": 177.60
    },
    "Groceries": {
      "transactions": [
        {"date": "2025-12-06", "merchant": "WHOLE FOODS MARKET", "amount": 14.67}
      ],
      "total": 14.67
    },
    "Entertainment": {
      "transactions": [
        {"date": "2025-12-10", "merchant": "SPOTIFY P3D4B102B8", "amount": 14.21}
      ],
      "total": 14.21
    },
    "Utilities": {
      "transactions": [
        {"date": "2025-12-08", "merchant": "NOVUS", "amount": 100.80}
      ],
      "total": 100.80
    },
    "Miscellaneous": {
      "transactions": [
        {"date": "2025-12-04", "merchant": "STAPLES STORE #84", "amount": 0.66}
      ],
      "total": 0.66
    }
  },
  "grand_total": 372.98
}
```

## Frontend Usage

```javascript
// Make request
const response = await fetch('/analyze-transactions', {
  method: 'POST',
  body: formData
});

const data = await response.json();

// Parse the cleaned JSON string
const analysis = JSON.parse(data.analysis);

// Access structured data
console.log(analysis.categories.Gas.total); // 64.04
console.log(analysis.categories.Restaurants.transactions); // Array of transactions
console.log(analysis.grand_total); // 372.98

// Iterate over categories
Object.entries(analysis.categories).forEach(([category, data]) => {
  console.log(`${category}: $${data.total}`);
  data.transactions.forEach(tx => {
    console.log(`  - ${tx.date}: ${tx.merchant}, $${tx.amount}`);
  });
});
```

## Error Handling

If the AI returns invalid JSON even after cleaning:

**Response (500 Internal Server Error):**
```json
{
  "error": "AI response error",
  "message": "The AI returned invalid JSON. Please try again. Context: analyze-transactions. Error: expected `,` or `}` at line 1 column 45"
}
```

**Server logs will show:**
```
AI returned invalid JSON: expected `,` or `}` at line 1 column 45
Raw response: [actual AI response for debugging]
```

## Testing

```bash
# Test with real CSV
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@credit-card-statement.csv" \
  | jq '.analysis | fromjson'

# Should output valid JSON structure
```

## Benefits

✅ **Robust** - Handles markdown, extra text, and malformed responses  
✅ **Validated** - Ensures JSON is parseable before returning  
✅ **Clear errors** - Specific error messages when validation fails  
✅ **Flexible** - Works even if AI doesn't follow instructions perfectly  
✅ **Debuggable** - Logs raw response when validation fails  

## Troubleshooting

### Issue: "AI returned invalid JSON"

**Check:**
1. Server logs for the raw AI response
2. If response is still wrapped in markdown after cleaning
3. If AI is following the prompt structure

**Solutions:**
- Restart Ollama: `ollama serve`
- Try a different model: Change `llama3.2:3b` to another model
- Adjust prompt in `constants.rs` to be even more explicit
- Check if model has enough context (file too large)

### Issue: Categories are wrong

**Check:**
- Prompt categorization rules in `constants.rs`
- Merchant name patterns for each category

**Solutions:**
- Update category examples in prompt
- Add more specific merchant patterns
- Fine-tune the AI model with better examples

## Future Improvements

- [ ] Add TypeScript types for the response structure
- [ ] Create a Rust struct for the analysis response (stronger typing)
- [ ] Add schema validation (e.g., using `jsonschema` crate)
- [ ] Cache cleaned responses to avoid re-processing
- [ ] Add retry logic if JSON validation fails
- [ ] Log malformed responses to identify AI model issues
- [ ] Consider using structured output APIs if available