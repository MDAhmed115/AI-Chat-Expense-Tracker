# Expense Chat — client-side edition

This project replaces the Apps Script/Vercel proxy bridge with a static Vite application. Google Sheets and Gemini requests are made directly from each visitor's browser. Each visitor supplies their own Gemini key, connects their own Google account, and creates or selects a spreadsheet in their own Drive.

## Important before publishing

This is a functional client-side migration build, but it is **not yet a verified 1:1 replacement** for every v3.3 Apps Script behavior. The original project contains a substantial server-side finance engine. This build ports the primary transaction/query/budget/history flows, but some advanced natural-language clarification/clear scopes and certain import edge cases still need regression testing against your actual template. Test it with a copy of your spreadsheet before replacing a production deployment.

## Requirements

- Node.js 20 or newer
- Google Cloud project with Google Sheets API, Google Drive API, and Google Picker API enabled
- OAuth 2.0 Web client ID
- Google Picker API key
- Gemini API key supplied separately by each visitor

## Environment variables

Create `.env.local` from `.env.example` for local development:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_WEB_OAUTH_CLIENT_ID
VITE_GOOGLE_API_KEY=YOUR_PICKER_API_KEY
VITE_GOOGLE_PROJECT_NUMBER=YOUR_GOOGLE_CLOUD_PROJECT_NUMBER
```

These three Google values are public browser configuration, not secrets. Do not add an OAuth client secret. The Gemini API key is entered by each visitor inside Expense Chat and is stored only in that visitor's browser localStorage.

For Vercel, add the same three variables under Project → Settings → Environment Variables, then redeploy.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Production build

```bash
npm run build
npm run preview
```

Vercel uses `npm run build` and publishes `dist/`.

## Google Cloud configuration

1. Enable Google Sheets API, Google Drive API, and Google Picker API in the same Cloud project.
2. Configure Google Auth Platform. Set the audience to External. Add test users while testing. For public access, complete the applicable publishing/verification requirements and publish the OAuth app.
3. Create an OAuth Client ID of type Web application.
4. Add these Authorized JavaScript origins:
   - `http://localhost:5173`
   - `https://ai-chat-expense-tracker.vercel.app`
   - Add your custom domain if you use one.
5. Do not use the OAuth client secret. The app uses Google's browser token client and requests only `drive.file`.
6. Create an API key for Google Picker. Restrict it to HTTP referrers for your production domain and localhost. Restrict APIs to Google Picker API, Google Drive API and Google Sheets API.
7. Add the OAuth client ID, Picker API key and project number to Vercel as the three `VITE_` variables above.

## Data and credential model

- Gemini API key: browser localStorage (`ec_api_key`).
- Selected spreadsheet ID: browser localStorage (`ec_sheet_id`).
- Google OAuth access token: JavaScript memory only; it is not persisted in localStorage.
- The app requests `https://www.googleapis.com/auth/drive.file`, not full Drive access.
- The app does not contain an API route, serverless function, database, Apps Script URL, service-account key, or owner-side spreadsheet credential.
- Chat history and budgets are stored in hidden tabs in the visitor's own spreadsheet.
- “Remove saved key and Sheet link” clears local credentials and attempts to revoke the current Google access token. It does not delete the spreadsheet.

## Current behavior notes

- Create Sheet imports the published XLSX template into the connected visitor's Drive and converts it to a Google spreadsheet.
- Select existing Sheet uses Google Picker; it does not ask the visitor to share the spreadsheet with the developer.
- Monthly PDF export is delivered as printable HTML; the visitor can use the browser print dialog to save as PDF.
- Finance attachment import supports image/PDF extraction with a review preview. General chat supports images, PDFs, text and common Office documents through JSZip text extraction.
- Clear confirmation currently supports clearing all transaction rows only (`clear` → `CONFIRM CLEAR`). It does not clear accounts, categories or budgets.
- Undo removes the most recent transaction row.
- Browser storage is not a secure vault: a same-origin XSS vulnerability could expose a locally stored Gemini key. Keep the app's dependencies and DOM handling reviewed, and never enter a key on an untrusted device.

## Before public release

1. Rotate the OAuth client secret that was accidentally disclosed; this app does not use the replacement secret.
2. Restrict the Picker API key by website referrer and API.
3. Publish the OAuth consent screen and complete any verification Google requires for public users.
4. Test with a separate Google account and a new spreadsheet. Confirm that the spreadsheet is created in that account's Drive and is not shared with the developer.
5. Test in an incognito window, with an invalid Gemini key, with a removed spreadsheet, and after token expiry.
