 <div align="center">
  <img src="./expense_chat_logo.jpg" alt="Expense Chat Logo" width="220">

  # Expense Chat

  **Your finances, in a conversation.**

  A personal finance manager and AI chatbot that turns everyday messages into organised financial records — powered by Google Gemini and your own Google Sheets.

  [**Open the Live App**](https://ai-chat-expense-tracker.vercel.app/) · [Report a Bug](https://github.com/MDAhmed115/AI-Chat-Expense-Tracker/issues) · [Request a Feature](https://github.com/MDAhmed115/AI-Chat-Expense-Tracker/issues)

  ![Vite](https://img.shields.io/badge/Frontend-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
  ![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat-square&logo=googlegemini&logoColor=white)
  ![Google Sheets](https://img.shields.io/badge/Data-Google%20Sheets-34A853?style=flat-square&logo=googlesheets&logoColor=white)
  ![Vercel](https://img.shields.io/badge/Hosting-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
</div>

---

## Overview

**Expense Chat** makes personal expense tracking as simple as sending a message.

Instead of navigating forms and manually entering every transaction, describe what happened in plain language. Google Gemini interprets your message and converts it into structured financial records stored directly in a Google Sheet that you own.

Expense Chat also includes a separate general-purpose AI chatbot for everyday questions, supported file attachments, and Google Search grounding.

**Your spreadsheet. Your Google account. Your Gemini API key. Your data.**

## Features

### Finance Manager
- **Natural-language tracking:** Record expenses, income, and transfers through ordinary messages.
- **Financial queries:** Ask about account balances, spending totals, and category breakdowns.
- **Monthly budgets:** Set and monitor category budgets.
- **Transaction management:** Review, edit, delete, and undo recent transactions.
- **Receipt and statement imports:** Extract transaction details from supported images and PDFs, then review before saving.
- **Chat history:** Revisit, pin, rename, and delete saved conversations.

### General Chatbot
- Ask general questions and get AI-powered responses.
- Attach supported images, PDFs, and common document formats.
- Use Google Search grounding for information retrieval when supported.
- Maintain separate conversation history.

### User Experience
- Responsive desktop and mobile interface.
- Light and dark themes.
- Voice dictation where supported by the browser.
- Google Sheets integration.
- Asia/Karachi timezone support.

## See It in Action

Try messages like these in Finance Manager:

| Message | Result |
|---|---|
| `Spent 850 on groceries from cash` | Records an expense |
| `Received 12000 salary in bank` | Records income |
| `Transfer 2000 from cash to savings` | Records a transfer |
| `How much did I spend this month?` | Calculates spending |
| `What is my bank balance?` | Checks account balance |
| `Show spending by category` | Generates a category breakdown |

The app uses the accounts and categories configured in your spreadsheet to validate financial entries. Always review extracted transaction details before relying on them.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Build Tool | Vite |
| AI Engine | Google Gemini API |
| Financial Database | Google Sheets API v4 |
| Authentication | Google Identity Services |
| Spreadsheet Selection | Google Picker |
| Spreadsheet Creation | Google Drive API v3 |
| File Processing | JSZip |
| Deployment | Vercel |

Expense Chat uses a static, browser-based architecture. Its core operations communicate directly with Google's APIs rather than relying on an Apps Script proxy or custom serverless backend.

## Privacy & Data Ownership

Expense Chat is designed around individual user accounts.

- Financial records are stored in the user's own Google Sheet.
- Conversation history and budgets are stored in hidden spreadsheet tabs.
- Each user provides their own Gemini API key.
- The Gemini API key and selected spreadsheet ID are stored in browser local storage.
- Google OAuth access tokens remain in JavaScript memory.
- Google authentication requests the `drive.file` permission scope rather than unrestricted Drive access.

**Important:** Browser local storage is not a secure credential vault. A compromised device or same-origin XSS vulnerability could expose a stored Gemini API key. Use trusted devices and protect your credentials.

Removing saved credentials does not delete the spreadsheet or its existing records.

## Getting Started

### Requirements

- Node.js 20 or newer
- npm
- Google Cloud project
- Google OAuth 2.0 Web Client ID
- Google Picker API key
- Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/MDAhmed115/AI-Chat-Expense-Tracker.git
cd AI-Chat-Expense-Tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.local` in the project root:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_OAUTH_CLIENT_ID
VITE_GOOGLE_API_KEY=YOUR_GOOGLE_PICKER_API_KEY
VITE_GOOGLE_PROJECT_NUMBER=YOUR_GOOGLE_CLOUD_PROJECT_NUMBER
```

These values are public browser configuration, not private secrets. Never place an OAuth client secret or service-account key in a `VITE_` variable.

Each user enters their own Gemini API key inside the application.

### 4. Configure Google Cloud

1. Enable Google Sheets API.
2. Enable Google Drive API.
3. Enable Google Picker API.
4. Configure Google Auth Platform and the OAuth consent screen.
5. Create an OAuth Client ID using the **Web application** type.
6. Add your development and production URLs to Authorized JavaScript origins.

For local development:

```text
http://localhost:5173
```

For the deployed application:

```text
https://ai-chat-expense-tracker.vercel.app
```

7. Configure the OAuth application for the `drive.file` scope.
8. Create a Picker API key and restrict it by HTTP referrer and API access.

Follow Google's current publishing and verification requirements for your intended audience.

### 5. Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

### 6. Build for production

```bash
npm run build
npm run preview
```

The production build is generated inside `dist/`.

## Deployment

Expense Chat can be deployed through Vercel:

1. Import the GitHub repository into Vercel.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Add the three environment variables listed above.
5. Configure the deployed domain in Google Cloud.
6. Deploy the project.

Remember that `VITE_` variables are exposed in the browser. Restrict the Google API key through Google Cloud rather than treating Vercel environment-variable settings as a way to hide it.

## Spreadsheet Template

New users can create their own Expense Chat spreadsheet using the included Excel template:

[`Finance_Tracker-template.xlsx`](./Finance_Tracker-template.xlsx)

The application expects a compatible spreadsheet containing:

- `Transactions`
- `Accounts`
- `Categories`

Additional hidden tabs are used for conversation history and budgets.

## Current Limitations

- Clear confirmation currently supports clearing transaction rows, not accounts, categories, or budgets.
- Monthly reports use printable HTML rather than direct PDF generation.
- Receipt and statement extraction requires user review before saving.
- Speech recognition depends on browser support.
- Gemini model availability, quotas, and API policies are subject to Google's changes.

Test with a separate Google account and spreadsheet before using the application as the sole record of important financial information.

## Project Structure

```text
.
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example
├── src/
│   ├── app.js
│   ├── cloud.js
│   ├── main.js
│   └── styles.css
├── expense_chat_logo.jpg
├── logo.png
└── Finance_Tracker-template.xlsx
```

## Contributing

Suggestions, bug reports, and improvements are welcome.

When reporting a bug, include:

- Steps to reproduce the issue.
- Expected behaviour.
- Actual behaviour.
- Browser and operating system.
- Relevant console errors.

**Never include API keys, access tokens, spreadsheet IDs, or personal financial information in an issue.**

## License

No license has currently been specified. Unless a license is added, the repository remains subject to default copyright rules. Public visibility does not automatically grant permission to reuse or redistribute the code.

---

<div align="center">

  **Expense Chat**

  *Track smarter. Stay in control.*

  Built by [Ahmed Ashfaq](https://github.com/MDAhmed115)

</div>
