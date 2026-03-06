# 🔧 Troubleshooting Guide

## Common Issues and Solutions

---

## ⏱️ Timeout Error: "Request timed out"

### Symptoms
- Browser shows: "Request timed out. The AI analysis is taking longer than expected"
- Upload spinner runs for 5 minutes then fails
- Backend may still be processing

### Causes
1. **Wrong OpenAI Model Name** - Backend using invalid model
2. **Large CSV File** - Too many transactions for quick processing
3. **Slow API Response** - OpenAI API experiencing delays
4. **Network Issues** - Intermittent connection problems

### Solutions

#### 1. Fix Model Name (Most Common Issue)

**Check Backend:**
```bash
cd backend
grep "OPENAI_MODEL" src/constants.rs
```

**Should be one of these valid models:**
```rust
pub const OPENAI_MODEL: &str = "gpt-5-mini";  // ✅ Fast, if you have access
pub const OPENAI_MODEL: &str = "gpt-4o-mini"; // ✅ Alternative
pub const OPENAI_MODEL: &str = "gpt-4o";      // ✅ More capable, slower
```

**Check backend logs to verify model is working:**
```bash
# Backend terminal should show OpenAI API calls
# Look for successful responses or model errors
```

#### 2. Check What's Actually Happening

**Frontend Console (Browser F12):**
Look for these logs:
```
📤 [1/3] Starting upload for: transactions.csv
📊 File size: 45.23 KB
🤖 Sending to OpenAI for AI analysis...
⏱️  This typically takes 1-5 minutes depending on file size
🔗 Endpoint: http://localhost:3000/analyze-transactions-openai
⏳ [2/3] Uploading and waiting for OpenAI response...
```

If you see these, the upload IS working - just need to wait longer.

**Backend Terminal:**
Look for:
```
Running on http://localhost:3000
[Some indication of receiving request]
[OpenAI API call happening]
```

If backend shows activity, OpenAI is processing - **be patient!**

#### 3. Increase Timeout

Current timeout: **5 minutes**

For large files or slow OpenAI responses, increase it:

Edit `frontend/src/config/api.ts`:
```typescript
export const API_CONFIG = {
  timeout: 600000, // 10 minutes (increase from 5)
};
```

Then restart frontend:
```bash
npm run dev
```

#### 4. Reduce File Size

If your CSV has 500+ transactions:
- Split into smaller files
- Remove old transactions
- Keep only recent months

#### 5. Check Backend Logs

Look for these errors in backend terminal:
```
❌ "OpenAI API error"
   → Check OPENAI_API_KEY is set
   
❌ "Invalid model"
   → Model name is wrong (see Solution 1)
   
❌ "Rate limit exceeded"
   → Wait a few minutes, try again
   
❌ "Invalid API key"
   → Check your OpenAI API key
```

---

## 🔑 OpenAI API Key Issues

### Error: "Failed to connect to OpenAI API"

#### Check if key is set:
```bash
echo $OPENAI_API_KEY
```

#### If empty, set it:
```bash
# Bash/Zsh
export OPENAI_API_KEY="sk-your-key-here"

# Or add to backend/.env
echo "OPENAI_API_KEY=sk-your-key-here" > backend/.env
```

#### Restart backend:
```bash
cargo run
```

#### Verify key is valid:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

Should return list of models. If error, key is invalid.

---

## 🌐 Network Errors

### Error: "Network error. Please check that the backend server is running"

#### 1. Check backend is running:
```bash
curl http://localhost:3000/
```

Should return: `<html><body><h1>Check Source test</h1></body></html>`

If not, start backend:
```bash
cd backend
cargo run
```

#### 2. Check correct port:
Backend should show:
```
Running on http://localhost:3000
```

Frontend should use:
```
VITE_API_URL=http://localhost:3000
```

#### 3. Check CORS:
Backend has CORS enabled by default. If you see CORS errors:
- Make sure frontend is on `localhost:5173`
- Don't use `127.0.0.1` (use `localhost`)

---

## 📄 CSV Format Issues

### Error: "Failed to parse CSV"

#### Required columns:
Your CSV MUST have:
- `Date` (any format)
- `Merchant` or `Description` or `Details`
- `Amount`

#### Example valid CSV:
```csv
Date,Merchant,Amount
2025-12-04,UBER CANADA/UBEREATS,53.40
2025-12-06,WHOLE FOODS MARKET,14.67
```

#### Common issues:
❌ Missing headers
❌ Wrong column names
❌ Amounts as text with $ signs
❌ Empty rows

#### Fix:
1. Open CSV in text editor
2. Ensure first row has: `Date,Merchant,Amount`
3. Remove any $ signs from amounts
4. Remove empty rows
5. Save and re-upload

---

## 🔄 Backend Won't Start

### Error: "failed to bind to address"

#### Port 3000 already in use:
```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
lsof -ti:3000 | xargs kill -9

# Start backend again
cargo run
```

### Error: "package not found"

#### Update Rust dependencies:
```bash
cargo update
cargo build
```

### Error: "OpenAI API unavailable"

#### Check OpenAI status:
Visit: https://status.openai.com/

If down, switch to Ollama:
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama
ollama serve

# Pull model
ollama pull mistral

# Update frontend/src/config/api.ts
export const CURRENT_PROVIDER: ApiProvider = "ollama";
```

---

## 💻 Frontend Won't Start

### Error: "Cannot find module"

#### Clear and reinstall:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev
```

### Error: "Port 5173 already in use"

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Start again
npm run dev
```

---

## 📊 Visualization Issues

### Charts not rendering

#### 1. Check data format:
Open browser console (F12), look for errors

#### 2. Check `analysis` field:
Should be valid JSON string:
```json
{
  "analysis": "{\"categories\":{...}}",
  "transaction_count": 89
}
```

#### 3. Clear browser cache:
```
Chrome: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
```

### Categories missing

OpenAI must return these exact categories:
- Gas
- Restaurants
- Groceries
- Entertainment
- Utilities
- Miscellaneous

If AI returns different categories, backend will fail validation.

---

## 🐛 Debug Mode

### Enable verbose logging:

#### Backend:
```bash
RUST_LOG=debug cargo run
```

#### Frontend:
Open browser console (F12), check:
- Network tab for API calls
- Console tab for errors
- Application tab for stored data

---

## 🔍 Quick Diagnostic

Run this checklist:

```bash
# 1. Backend running?
curl http://localhost:3000/
# Should return HTML

# 2. API key set?
echo $OPENAI_API_KEY
# Should show: sk-...

# 3. OpenAI model correct?
grep "OPENAI_MODEL" backend/src/constants.rs
# Should show: gpt-4o-mini

# 4. Frontend running?
curl http://localhost:5173/
# Should return HTML

# 5. Can upload work?
curl -X POST http://localhost:3000/analyze-transactions-openai \
  -F "file=@test.csv" \
  -F "description=test"
# Should return JSON (may take 30-60 seconds)
```

---

## ⚡ Quick Fixes

### Just want it to work?

**1. Use Ollama (No API key needed):**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
ollama pull mistral

# Change frontend/src/config/api.ts
export const CURRENT_PROVIDER: ApiProvider = "ollama";

# Restart frontend
npm run dev
```

**2. Check model name:**
```bash
# Edit backend/src/constants.rs
# Set: pub const OPENAI_MODEL: &str = "gpt-4o-mini";
cargo run
```

**3. Increase timeout:**
```bash
# Edit frontend/src/config/api.ts
# Set: timeout: 600000 (10 minutes)
npm run dev
```

---

## 📞 Still Not Working?

### Check These:

1. **Backend Logs** - Any red error messages?
2. **Frontend Console** - Any JavaScript errors?
3. **Network Tab** - Is request reaching backend?
4. **CSV File** - Is format correct?
5. **API Key** - Is it valid and has credits?

### Important: Check if it's ACTUALLY failing

**Before assuming failure:**

1. **Check browser console (F12)**
   - Look for the progress logs
   - See if it says "waiting for OpenAI response"
   - If yes, it's working - just slow!

2. **Check backend terminal**
   - Is it showing activity?
   - Any OpenAI API logs?
   - If yes, it's processing - be patient!

3. **How long did you wait?**
   - First upload can take 3-5 minutes
   - Large files (100+ transactions) take longer
   - OpenAI sometimes has delays

4. **Only if truly stuck after 10+ minutes:**
   - Then it's a real timeout
   - Check error messages
   - Try solutions above

### Get Help:

1. Copy error message from backend terminal
2. Copy error message from browser console (F12)
3. Share your CSV format (first 3 rows)
4. Share how long you waited
5. Share backend logs during upload
6. Open an issue with all above info

---

## ✅ Success Checklist

When everything works, you should see:

- ✅ Backend: `Running on http://localhost:3000`
- ✅ Frontend: `Local: http://localhost:5173/`
- ✅ Upload: Browser console shows progress logs
- ✅ Upload: File status shows "Analyzing with AI... (may take 2-3 min)"
- ✅ Upload: After 1-5 minutes, status changes to "Ready"
- ✅ Chart: Pie chart renders with colors
- ✅ Tables: Categories expand to show transactions
- ✅ Console: No red errors

---

**Last Updated**: March 5, 2026
**Version**: 1.0.0