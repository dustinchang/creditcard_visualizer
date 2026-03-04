# Credit Card Transaction API Usage Guide

This guide explains how to use the backend API to process credit card transaction CSV files.

## Endpoints

### 1. `/upload` - Upload and Parse CSV
Upload a CSV file and get the raw CSV content back for further processing.

**Method:** `POST`  
**Content-Type:** `multipart/form-data`

**Request:**
- `file`: CSV file containing credit card transactions
- `description`: Optional description of the file

**Response:**
```json
{
  "filename": "credit-card-statement-transactions-2026-01-01.csv",
  "description": "My credit card statement",
  "csv_content": "\"transaction_date\",\"post_date\",\"type\",\"details\",\"amount\",\"currency\"\n\"2025-12-04\",\"2025-12-05\",\"Purchase\",\"UBER CANADA/UBEREATS\",\"53.4\",\"CAD\"",
  "row_count": 87
}
```

**Usage with curl:**
```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@/path/to/credit-card-statement-transactions-2026-01-01.csv" \
  -F "description=December credit card statement"
```

---

### 2. `/generate` - Generate AI Response
Send custom data to the AI model with optional system instructions.

**Method:** `POST`  
**Content-Type:** `application/json`

**Request:**
```json
{
  "system_instructions": "You are a financial analyst",
  "user_data": "\"transaction_date\",\"post_date\",\"type\",\"details\",\"amount\",\"currency\"\n\"2025-12-04\",\"2025-12-05\",\"Purchase\",\"UBER CANADA/UBEREATS\",\"53.4\",\"CAD\""
}
```

**Response:**
```json
{
  "response": "AI generated analysis..."
}
```

**Notes:**
- If `system_instructions` is empty or not provided, it defaults to the financial data processor instructions defined in `constants.rs`
- The `user_data` field can contain any text data, including raw CSV content
- AI models understand CSV format natively - no conversion needed!

**Usage with curl:**
```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_instructions": "",
    "user_data": "\"transaction_date\",\"post_date\",\"type\",\"details\",\"amount\",\"currency\"\n\"2025-12-04\",\"2025-12-05\",\"Purchase\",\"UBER CANADA/UBEREATS\",\"53.4\",\"CAD\""
  }'
```

---

### 3. `/analyze-transactions` - Upload CSV and Analyze in One Step ⭐ RECOMMENDED
Upload a CSV file and immediately get AI analysis with categorization and totals.

**Method:** `POST`  
**Content-Type:** `multipart/form-data`

**Request:**
- `file`: CSV file containing credit card transactions
- `description`: Optional description

**Response:**
```json
{
  "analysis": "{\"categories\":{\"Gas\":{\"transactions\":[{\"date\":\"2025-12-30\",\"merchant\":\"PETRO-CANADA 91888\",\"amount\":64.04}],\"total\":64.04},\"Restaurants\":{\"transactions\":[{\"date\":\"2025-12-04\",\"merchant\":\"UBER CANADA/UBEREATS\",\"amount\":53.40}],\"total\":892.15},\"Groceries\":{\"transactions\":[],\"total\":423.67},\"Entertainment\":{\"transactions\":[],\"total\":286.44},\"Utilities\":{\"transactions\":[],\"total\":114.41},\"Miscellaneous\":{\"transactions\":[],\"total\":654.32}},\"grand_total\":2435.03}",
  "transaction_count": 87
}
```

**Note:** The `analysis` field contains a JSON string with the categorized transaction data. You can parse it on the frontend:

```javascript
const response = await fetch('/analyze-transactions', { method: 'POST', body: formData });
const data = await response.json();
const analysis = JSON.parse(data.analysis);

// Access the data:
console.log(analysis.categories.Gas.total); // 64.04
console.log(analysis.grand_total); // 2435.03
```

**Analysis JSON Structure:**
```json
{
  "categories": {
    "Gas": {
      "transactions": [
        { "date": "2025-12-30", "merchant": "PETRO-CANADA 91888", "amount": 64.04 }
      ],
      "total": 64.04
    },
    "Restaurants": {
      "transactions": [
        { "date": "2025-12-04", "merchant": "UBER CANADA/UBEREATS", "amount": 53.40 }
      ],
      "total": 892.15
    },
    "Groceries": { "transactions": [], "total": 0.00 },
    "Entertainment": { "transactions": [], "total": 0.00 },
    "Utilities": { "transactions": [], "total": 0.00 },
    "Miscellaneous": { "transactions": [], "total": 0.00 }
  },
  "grand_total": 2435.03
}
```

**Usage with curl:**
```bash
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@/path/to/credit-card-statement-transactions-2026-01-01.csv" \
  -F "description=December statement analysis"
```

**This is the simplest and fastest option!** The CSV is sent directly to the AI model with no intermediate processing.

---

## Workflow Examples

### Workflow 1: One-Step Process (⭐ RECOMMENDED)

Use the combined `/analyze-transactions` endpoint:

```bash
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@credit-card-statement-transactions-2026-01-01.csv" \
  -F "description=Monthly statement"
```

This automatically:
- Reads the CSV file
- Sends it directly to the AI (no conversion needed!)
- Uses the default financial data processor instructions
- Returns categorized transactions with totals

### Workflow 2: Two-Step Process (Advanced)

1. **Upload the CSV file:**
```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@credit-card-statement-transactions-2026-01-01.csv" \
  -F "description=Monthly statement" \
  -o upload_response.json
```

2. **Extract the `csv_content` from the response and send to `/generate`:**
```bash
# Extract csv_content from upload_response.json
CSV_CONTENT=$(jq -r '.csv_content' upload_response.json)

# Send to generate endpoint with custom instructions
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"system_instructions\": \"You are a tax advisor. Identify deductible expenses.\",
    \"user_data\": $(echo "$CSV_CONTENT" | jq -Rs .)
  }"
```

Use this workflow when you want custom system instructions or need to process the CSV multiple times with different prompts.

---

## CSV Format Requirements

Your CSV file should have the following columns:
- `transaction_date`: Date of the transaction
- `post_date`: Date the transaction posted
- `type`: Transaction type (Purchase, Payment, Refund, etc.)
- `details`: Merchant or transaction description
- `amount`: Transaction amount (positive for charges, negative for credits)
- `currency`: Currency code (e.g., CAD, USD)

**Example CSV:**
```csv
"transaction_date","post_date","type","details","amount","currency"
"2025-12-04","2025-12-05","Purchase","UBER CANADA/UBEREATS","53.4","CAD"
"2025-12-04","2025-12-05","Purchase","STAPLES STORE #84","0.66","CAD"
"2025-12-05","2025-12-05","Payment","From chequing account","-4810.04","CAD"
```

**Note:** The AI model understands CSV format natively, so the file is sent as-is without any conversion or preprocessing!

---

## Default AI Instructions

When `system_instructions` is empty or not provided in `/generate`, the system uses these default instructions:

> You are a financial data processor. Your task is to extract, categorize, and total credit card transactions.
>
> The input will be provided as CSV data with the following columns:
> - transaction_date: Date of the transaction
> - post_date: Date the transaction posted
> - type: Transaction type (Purchase, Payment, Refund, etc.)
> - details: Merchant or transaction description
> - amount: Transaction amount
> - currency: Currency code
>
> YOUR TASKS:
> 1. EXTRACTION: Identify the date, amount, and description for every transaction in the CSV.
> 2. CATEGORIZATION: Assign each transaction to EXACTLY ONE of the following categories:
>    - Gas
>    - Restaurants
>    - Groceries
>    - Entertainment
>    - Utilities
>    - Miscellaneous (Use this for anything that doesn't fit above)
>
> 3. AGGREGATION: Calculate the sum of all transaction amounts for each category.
>
> OUTPUT FORMAT:
> Return a categorized list of transactions followed by a clear "Totals per Category" summary.
> Ignore any transactions with negative amounts (refunds/payments) when calculating category totals.

---

## Why CSV Direct Approach?

We send CSV files directly to the AI without conversion because:

1. **Faster** - No preprocessing overhead
2. **Simpler** - Less code, fewer bugs
3. **Native Support** - AI models are trained on CSV data and understand it natively
4. **Efficient** - CSV is already a compact, structured format
5. **Lossless** - No data transformation means no risk of conversion errors

Modern AI models like Llama 3.2 handle CSV format excellently without needing conversion to JSON or other formats.

---

## Testing with Swagger UI

Visit `http://localhost:3000/swagger-ui` to test all endpoints interactively with a web interface.

You can upload files, see request/response schemas, and test the API without writing any curl commands!

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `503`: Service Unavailable (Ollama not running or unreachable)

### Error Response Format

When an error occurs, the API returns a structured JSON response:

```json
{
  "error": "Ollama service unavailable",
  "message": "Failed to connect to Ollama. Please ensure Ollama is running (try 'ollama serve'). Error: connection refused"
}
```

### Common Error: Ollama Not Running

**Symptom:**
```bash
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@statement.csv"

# Returns:
# Status: 503 Service Unavailable
# {
#   "error": "Ollama service unavailable",
#   "message": "Failed to connect to Ollama. Please ensure Ollama is running (try 'ollama serve'). Error: ..."
# }
```

**Solution:**
```bash
# Start Ollama service
ollama serve

# Or run in background
ollama serve &

# Verify it's running
curl http://localhost:11434/api/tags

# Ensure model is available
ollama list
ollama pull llama3.2:3b  # If model not found
```

### Frontend Error Handling Example

```javascript
const response = await fetch('http://localhost:3000/analyze-transactions', {
  method: 'POST',
  body: formData
});

const data = await response.json();

if (!response.ok) {
  // Handle error
  console.error(`Error: ${data.error}`);
  alert(`${data.message}`);
} else {
  // Success
  displayResults(data);
}
```

Check the console output for detailed error messages and see `ERROR_HANDLING.md` for comprehensive troubleshooting.

---

## Performance Tips

1. **Use `/analyze-transactions` for single-use analysis** - It's the fastest option
2. **Use `/upload` + `/generate` if you need to analyze the same CSV multiple times** with different prompts
3. **Keep CSV files under 10MB** for best performance
4. **Ensure Ollama is running** before making requests to AI endpoints

---

## Example: Complete Workflow

```bash
# Step 1: Analyze transactions in one call
curl -X POST http://localhost:3000/analyze-transactions \
  -F "file=@my-statement.csv" \
  -F "description=January 2026" \
  | jq '.'

# Response:
# {
#   "analysis": "CATEGORIZED TRANSACTIONS:\n\nRestaurants:\n- 2025-12-04: UBER CANADA/UBEREATS, $53.40\n...",
#   "transaction_count": 87
# }

# Step 2 (optional): Upload once, analyze multiple times
curl -X POST http://localhost:3000/upload \
  -F "file=@my-statement.csv" \
  -F "description=January 2026" \
  > statement.json

# Analyze for spending patterns
CSV=$(jq -r '.csv_content' statement.json)
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d "{\"system_instructions\": \"Identify spending patterns\", \"user_data\": $(echo "$CSV" | jq -Rs .)}"

# Analyze for tax deductions
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d "{\"system_instructions\": \"Identify tax-deductible expenses\", \"user_data\": $(echo "$CSV" | jq -Rs .)}"
```
