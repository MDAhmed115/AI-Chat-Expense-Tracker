<div align="center">

  <img src="./expense_chat_logo.jpg" alt="Expense Chat Logo" width="200">

  # Expense Chat

  ### Just say what you spent. It handles the rest.

  A conversational finance manager and AI chatbot. Type a normal sentence, and Google Gemini turns it into a clean record in **your own Google Sheet**. No forms, no spreadsheets to fiddle with, no backend that holds your data.

  <br>

  [**Open the Live App**](https://ai-chat-expense-tracker.vercel.app/) &nbsp;·&nbsp; [Report a Bug](https://github.com/MDAhmed115/AI-Chat-Expense-Tracker/issues) &nbsp;·&nbsp; [Request a Feature](https://github.com/MDAhmed115/AI-Chat-Expense-Tracker/issues)

  <br>

  ![Vite](https://img.shields.io/badge/Frontend-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
  ![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat-square&logo=googlegemini&logoColor=white)
  ![Google Sheets](https://img.shields.io/badge/Data-Google%20Sheets-34A853?style=flat-square&logo=googlesheets&logoColor=white)
  ![Vercel](https://img.shields.io/badge/Hosting-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
  ![No Backend](https://img.shields.io/badge/Backend-None-4F5B2A?style=flat-square)

</div>

---

## Why Expense Chat?

Most expense trackers make you open an app, pick a category, choose an account, type an amount, and press save. By the time you finish, you have stopped bothering.

Expense Chat works the way you already think:

```text
You:   deduct 200 rs from nayapay for fries
App:   Expense added: Rs 200 from NayaPay · Food & Restaurants.
```

Everything lands in a Google Sheet that **you own**, using **your own Gemini API key**. There is no Expense Chat server, no account to create, and no one else reading your numbers.

## What You Can Do

### Finance Manager

| You type | What happens |
|---|---|
| `Spent 850 on groceries from cash` | Records an expense |
| `Received 12000 salary in bank` | Records income |
| `Transfer 2000 from cash to savings` | Records a transfer between accounts |
| `200 fries` | Asks which account (see below) before saving |
| `How much did I spend this month?` | Calculates your total |
| `What is my bank balance?` | Shows account balances |
| `Show spending by category` | Breaks down spending by category |
| `undo` | Removes your most recent transaction |

Plus:

- **Asks before guessing.** If you leave out the account (or category), nothing is saved yet. You get a card with one button per account, read live from your Accounts tab, so one tap finishes the entry. Prefer to sort it out later? Tap **Keep for review** and it is saved in orange for you to fix.
- **Multiple items in one message.** Several expenses in one sentence become several rows.
- **Monthly budgets.** Set a budget per category and watch progress bars turn amber, then red, as you get close.
- **Edit and delete.** Every saved entry has Edit and Delete buttons right on its card.
- **Receipt and statement import.** Attach a photo or PDF. Gemini extracts the transactions, flags possible duplicates, and shows them for review. Nothing is saved until you press **Save selected**.
- **Monthly report export.** Download a printable report for any month.
- **Safe clearing.** Wiping your transactions needs a second `CONFIRM CLEAR` within 60 seconds.

### General Chatbot

A separate private assistant in the same app:

- Ask anything and get well-formatted answers (headings, lists, tables, code blocks).
- Attach up to 3 files: images, PDFs, Word, PowerPoint, Excel, and common text and code files.
- Live questions (news, prices, scores) use Google Search grounding, with sources listed.
- Keeps its own conversation history, separate from Finance Manager.

### Everything Else

- **Chat history.** Pin, rename, reopen, and delete past conversations, saved in your Sheet.
- **Voice dictation** wherever your browser supports it.
- **Light and dark themes** with a glass-style interface, built for both phone and desktop.
- **Automatic model fallback.** If one Gemini model is busy or out of quota, the next one answers.
- **Pakistan-friendly.** Rupee formatting, `40k` style amounts, and Asia/Karachi dates.

## How It Works

```text
   Your message
        │
        ▼
 ┌──────────────┐   extracts type, amount,    ┌────────────────────┐
 │ Google Gemini│ ──account, category, date──▶│  Validated against │
 └──────────────┘                             │ your Accounts and  │
                                              │ Categories tabs    │
                                              └─────────┬──────────┘
                                                        │
                          missing something? ◀──────────┤
                          ask with buttons              │ complete
                                                        ▼
                                              ┌────────────────────┐
                                              │  Your Google Sheet │
                                              └────────────────────┘
```

The AI only reads and classifies your message. It cannot invent an account or category: anything that does not match your Sheet is checked with you first.

Expense Chat is a static, browser-based app. It talks directly to Google's APIs, with no Apps Script proxy and no custom server in between.

## Privacy & Data Ownership

- Your financial records live in **your** Google Sheet.
- Chat history and budgets are kept in hidden tabs of that same Sheet.
- **You** supply the Gemini API key. It is never sent to any server of ours.
- Your Gemini key and Sheet ID are saved in this browser's local storage.
- Google access tokens stay in memory only and are gone when you close the tab.
- Sign-in uses the `drive.file` scope, so the app can only touch the Sheet you create or select, not your whole Drive.

> **Heads up:** local storage is not a vault. If your device is compromised, a saved API key could be exposed. Use trusted devices, and restrict your Gemini key in Google AI Studio if you can.

"Remove saved key and Sheet link" clears the browser's copy. It does not delete your Sheet.

## Quick Start (as a User)

1. Open the [live app](https://ai-chat-expense-tracker.vercel.app/).
2. **Connect your Google account.**
3. Paste a free **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey).
4. Download the **template** from the app, upload it to Google Drive, and open it with Google Sheets.
5. Press **Select my Google Sheet** and pick it.
6. Start typing: `spent 300 on lunch from cash`.

Your **Accounts** tab holds up to 10 accounts (rows 6 to 15), and your **Categories** tab up to 20 categories. Edit those two tabs and the app picks the changes up. Refresh the page if you add an account while the app is open.

## Run It Yourself

### Requirements

- Node.js 20 or newer, and npm
- A Google Cloud project with an OAuth 2.0 Web Client ID and a Picker API key

### 1. Clone and install

```bash
git clone https://github.com/MDAhmed115/AI-Chat-Expense-Tracker.git
cd AI-Chat-Expense-Tracker
npm install
```

### 2. Add environment variables

Create `.env.local` in the project root:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_OAUTH_CLIENT_ID
VITE_GOOGLE_API_KEY=YOUR_GOOGLE_PICKER_API_KEY
VITE_GOOGLE_PROJECT_NUMBER=YOUR_GOOGLE_CLOUD_PROJECT_NUMBER
```

These are public browser settings, not secrets. Never put an OAuth client secret or service-account key in a `VITE_` variable. Each user enters their own Gemini key inside the app.

### 3. Configure Google Cloud

1. Enable the **Google Sheets API**, **Google Drive API**, and **Google Picker API**.
2. Set up the OAuth consent screen and request the `drive.file` scope.
3. Create an OAuth Client ID of type **Web application**.
4. Add your origins to **Authorized JavaScript origins**:
   - Local: `http://localhost:5173`
   - Production: your deployed URL
5. Create a Picker API key and restrict it by HTTP referrer and API.

Follow Google's current publishing and verification rules for your intended audience.

### 4. Run

```bash
npm run dev       # development at http://localhost:5173
npm run build     # production build into dist/
npm run preview   # preview the production build
```

### Deploy to Vercel

1. Import the repository into Vercel.
2. Build command: `npm run build`. Output directory: `dist`.
3. Add the three environment variables above.
4. Add your Vercel domain to the Authorized JavaScript origins in Google Cloud.
5. Deploy.

`VITE_` variables are visible in the browser, so protect the Picker key with Google Cloud restrictions instead of relying on Vercel to hide it.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript |
| Build tool | Vite |
| AI | Google Gemini API (with model fallback and Google Search grounding) |
| Database | Google Sheets API v4 |
| Sign-in | Google Identity Services |
| Sheet selection | Google Picker |
| Sheet creation | Google Drive API v3 |
| Office file reading | JSZip |
| Hosting | Vercel |

## Project Structure

```text
.
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example
├── src/
│   ├── main.js        # entry point
│   ├── app.js         # interface: chat, cards, history, setup
│   ├── cloud.js       # Google + Gemini logic, all data operations
│   └── styles.css     # liquid-glass theme, light and dark
├── expense_chat_logo.jpg
├── logo.png
└── Finance_Tracker-template.xlsx
```

## Good to Know

- Always glance at what the AI extracted before relying on it, especially for receipts and statements.
- Receipt and statement import reads up to 30 transactions at a time, from one file of up to 4 MB.
- Each saved conversation keeps its most recent 10 messages.
- Monthly reports are printable HTML (use your browser's Print and Save as PDF).
- `CONFIRM CLEAR` only clears transactions. Accounts, categories, and budgets are untouched.
- Voice dictation depends on browser support.
- Gemini model availability, quotas, and policies are controlled by Google and can change.

Try it with a spare Google account and test Sheet first, before trusting it with records that matter.

## Contributing

Bug reports and ideas are welcome. When reporting a bug, please include the steps to reproduce it, what you expected, what happened instead, your browser and OS, and any console errors.

**Never include API keys, access tokens, Sheet IDs, or personal financial data in an issue.**

## License

No license has been specified yet. Until one is added, default copyright applies: public visibility does not grant permission to reuse or redistribute the code.

---

<div align="center">

  **Expense Chat**

  *Say it. Send it. Done.*

  Built by [Ahmed Ashfaq](https://github.com/MDAhmed115)

</div>
