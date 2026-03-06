# 🚀 Quick Start Guide - Credit Card Visualizer

Get up and running in 5 minutes!

---

## Prerequisites

- **Rust** (latest stable): https://rustup.rs/
- **Node.js** 20+: https://nodejs.org/
- **OpenAI API Key**: https://platform.openai.com/api-keys

---

## 1. Clone & Setup (1 minute)

```bash
# Clone the repository
git clone <your-repo-url>
cd creditcard_visualizer

# Set up environment variables
cd backend
echo "OPENAI_API_KEY=sk-your-key-here" > .env
cd ..
```

---

## 2. Start Backend (30 seconds)

```bash
cd backend
cargo run
```

✅ You should see: `Running on http://localhost:3000`

---

## 3. Start Frontend (30 seconds)

**New terminal window:**

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

✅ You should see: `Local: http://localhost:5173/`

---

## 4. Test It Out! (3 minutes)

1. **Open browser**: http://localhost:5173/
2. **Upload CSV**: Drag and drop your credit card CSV file
3. **Wait**: OpenAI analyzes your transactions (30-60 seconds)
4. **Explore**: View charts, click categories, see transactions!

---

## CSV Format Example

Your CSV needs these columns:

```csv
Date,Merchant,Amount
2025-12-04,UBER CANADA/UBEREATS,53.40
2025-12-06,WHOLE FOODS MARKET,14.67
2025-12-30,PETRO-CANADA,64.04
```

---

## Troubleshooting

### Backend won't start?
```bash
# Check Rust is installed
rustc --version

# Update dependencies
cargo update
```

### Frontend won't start?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### "OpenAI API error"?
```bash
# Check your API key
echo $OPENAI_API_KEY

# Or set it again
export OPENAI_API_KEY="sk-your-key-here"
```

### Upload fails?
- ✅ Check CSV has Date, Merchant, Amount columns
- ✅ Check backend is running on port 3000
- ✅ Check browser console for errors

---

## What's Next?

### Switch to Free Ollama (No API Key)

**1. Install Ollama:**
```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Or download from: https://ollama.com/download
```

**2. Start Ollama:**
```bash
ollama serve
```

**3. Pull model:**
```bash
ollama pull mistral
```

**4. Update frontend:**
Edit `frontend/src/config/api.ts`:
```typescript
export const CURRENT_PROVIDER: ApiProvider = "ollama"; // Change from "openai"
```

**5. Restart frontend:**
```bash
# Frontend terminal
npm run dev
```

Now you're using free, local AI! 🎉

---

## Production Deployment

### Backend
```bash
cd backend
cargo build --release
./target/release/creditcard_visualizer
```

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel, Netlify, etc.
```

---

## Features Overview

✅ **Upload CSV** - Drag-and-drop credit card statements
✅ **AI Analysis** - OpenAI categorizes transactions automatically
✅ **Visual Charts** - Interactive pie chart with Recharts
✅ **Transaction Details** - Expandable tables by category
✅ **Responsive** - Mobile-friendly, works on all devices
✅ **Dark Mode** - Automatic based on system preference
✅ **Fast** - Rust backend, optimized React frontend

---

## Keyboard Shortcuts

- `Tab` - Navigate through UI
- `Enter`/`Space` - Activate buttons, expand categories
- `Esc` - Close modals (when implemented)

---

## File Structure

```
creditcard_visualizer/
├── backend/               # Rust + Axum + OpenAI
│   ├── src/
│   │   ├── main.rs       # API endpoints
│   │   └── constants.rs  # AI prompts
│   └── Cargo.toml
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── config/       # API config
│   │   ├── styles/       # CSS files
│   │   └── App.tsx       # Main app
│   └── package.json
└── README.md
```

---

## Commands Cheatsheet

### Backend
```bash
cargo run           # Start dev server
cargo build         # Build debug
cargo build --release  # Build production
cargo test          # Run tests
```

### Frontend
```bash
npm run dev         # Start dev server
npm run build       # Build production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

---

## Cost Estimate

### OpenAI (GPT-5-mini)
- ~$0.01-0.05 per file analysis
- 100 files = ~$1-5

### Ollama (Free)
- $0 - runs locally
- One-time download (~4GB)
- Slightly slower than OpenAI

---

## Common Issues

### Port 3000 already in use?
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Port 5173 already in use?
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### "Cannot find module" error?
```bash
cd frontend
npm install --legacy-peer-deps
```

---

## Documentation

- 📘 **Full Integration Guide**: `BACKEND_INTEGRATION_COMPLETE.md`
- 📗 **Frontend Setup**: `frontend/SETUP_COMPLETE.md`
- 📙 **API Documentation**: http://localhost:3000/swagger-ui
- 📕 **Component Docs**: `frontend/src/components/README.md`

---

## Need Help?

1. Check backend logs (terminal running `cargo run`)
2. Check frontend console (browser DevTools)
3. Review `BACKEND_INTEGRATION_COMPLETE.md`
4. Test with sample CSV file

---

## You're All Set! 🎉

```bash
# Terminal 1: Backend
cd backend && cargo run

# Terminal 2: Frontend  
cd frontend && npm run dev

# Browser
open http://localhost:5173
```

**Upload a CSV and watch the magic happen!** ✨

---

**Version**: 1.0.0
**Last Updated**: March 5, 2026
**Status**: ✅ Production Ready