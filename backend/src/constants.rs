// AI Model Configuration
// pub const MODEL_NAME: &str = "llama3.2:latest"; // Use larger model to avoid hallucinations
pub const MODEL_NAME: &str = "mistral:latest"; // Use larger model to avoid hallucinations

// OpenAI Model Configuration
// gpt-4o-mini
pub const OPENAI_MODEL: &str = "gpt-5-mini"; // Fast and cost-effective for JSON generation

pub const PROMPT_INSTRUCTIONS: &str = r#"You are a financial analyst. Analyze the credit card transaction CSV data I'm providing.

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no code blocks, no explanation, no extra text
2. Start your response with { and end with }
3. Follow the EXACT structure shown below
4. IGNORE transactions with negative amounts (refunds/payments)
5. ONLY process transactions where type = "Purchase"
6. Use ONLY these 6 categories: Gas, Restaurants, Groceries, Entertainment, Utilities, Miscellaneous
7. DO NOT create new categories like "Food", "Shopping", "Online Shopping", etc.
8. DO NOT repeat the same transaction multiple times
9. Process each CSV row ONCE and only ONCE

ANTI-HALLUCINATION RULES:
- Read the CSV carefully - each transaction appears ONCE in the data
- If you see "UBER CANADA/UBEREATS" with amount 69.87 on 2025-12-17, list it ONCE
- DO NOT invent duplicate transactions
- DO NOT repeat the same merchant/amount/date combination
- Each transaction in your response must correspond to EXACTLY ONE line in the CSV

CATEGORIZATION RULES:
Look at the "details" field (merchant name) and assign to ONE of these SIX categories:

- Gas: PETRO-CANADA, SHELL, ESSO, gas stations
- Restaurants: UBER EATS, restaurant names, cafes, food delivery
- Groceries: WHOLE FOODS, SAVE ON FOODS, T&T SUPERMARKET, H-MART, grocery stores
- Entertainment: SPOTIFY, NETFLIX, movies, golf courses, games, concerts
- Utilities: NOVUS, BCAA, phone/internet/insurance bills
- Miscellaneous: Everything else that doesn't fit above

REQUIRED OUTPUT FORMAT (copy this structure EXACTLY):

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
        {"date": "2025-12-04", "merchant": "UBER CANADA/UBEREATS", "amount": 53.40}
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

VALIDATION CHECKLIST:
✓ Response starts with { (not ```, not text, just {)
✓ Response ends with } (not ```, not text, just })
✓ EXACTLY 6 categories: Gas, Restaurants, Groceries, Entertainment, Utilities, Miscellaneous
✓ NO other categories like "Food", "Shopping", "Online Shopping"
✓ Each category has "transactions" array and "total" number
✓ Empty categories have empty array [] and total 0.00
✓ All amounts are numbers (not strings)
✓ All dates are strings in YYYY-MM-DD format
✓ grand_total equals sum of all category totals
✓ No negative amounts included
✓ No markdown formatting
✓ No duplicate transactions - each CSV row appears ONCE
✓ Transaction count matches CSV (not hundreds of duplicates)

ANALYZE THE CSV DATA NOW AND RETURN ONLY THE JSON. PROCESS EACH TRANSACTION ONCE."#;
