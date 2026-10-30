# Expense Chat v3.2 — Vercel frontend

This project extracts the existing Expense Chat v3.2 interface from Google Apps Script HTML Service and serves it as a standalone Vite frontend on Vercel.

The existing Apps Script business-logic files are not rewritten. Add the separate `Api.gs` file to the existing Apps Script project to expose the existing `api_*` functions through `doPost(e)`.

## Project structure

```text
finance-ai-v3/
├── api/
│   └── apps-script.js       # Vercel server-side proxy to Apps Script
├── src/
│   ├── index.html           # Extracted standalone HTML
│   ├── styles.css           # Styles.html + Client.html inline CSS
│   └── app.js               # Client.html JavaScript using fetch()
├── package.json
├── vercel.json
└── README.md
```

`Api.gs` is supplied separately. Add it to the existing Google Apps Script editor; it is not part of the Vercel static frontend.

## 1. Add the Apps Script bridge

1. Open the existing Expense Chat Google Apps Script project.
2. Do not edit or replace any existing `.gs` file.
3. Create a new script file named **Api.gs**.
4. Paste the complete contents of the supplied `Api.gs` into it.
5. Save the Apps Script project.
6. In the function selector, choose `generateApiBridgeSecret` and click **Run**.
7. Approve the requested authorization if Google prompts you.
8. Open the execution result/log and copy the generated `API_BRIDGE_SECRET` value. Keep it private.

Running `generateApiBridgeSecret` again rotates the secret. If you rotate it, update the Vercel environment variable to the new value and redeploy.

## 2. Deploy the Apps Script web app

The bridge is called through your existing web app deployment URL:

`https://script.google.com/macros/s/AKfycbxBLlVD844zKFWg1B_FFa9s5LLCRbs0jcouuMFprjqoLNacHrBSjbOlGskZMCb6sWxR/exec`

After adding `Api.gs`:

1. In Apps Script, choose **Deploy → Manage deployments**.
2. Edit the existing Web App deployment (or create a new Web App deployment if necessary).
3. Set **Execute as** to the account that owns the existing finance app and its data.
4. Set access to the audience that is permitted to use this app. The bridge secret is required for API calls, but it is not a substitute for user authentication.
5. Deploy the new version.
6. If Google gives you a different `/exec` URL, update `APPS_SCRIPT_URL` in Vercel as described below.

Do not delete or replace the existing business-logic files.

## 3. Push the frontend to GitHub

Create a GitHub repository, for example `finance-ai-v3`.

From a terminal, open the extracted `finance-ai-v3` folder and run:

```bash
git init
git add .
git commit -m "Add standalone Expense Chat v3.2 frontend"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/finance-ai-v3.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username and use the repository URL GitHub provides.

Do not commit the bridge secret. It belongs only in Apps Script Script Properties and Vercel environment variables.

## 4. Deploy on Vercel

1. Sign in to Vercel and choose **Add New → Project**.
2. Import the GitHub repository.
3. Keep the project root at the repository root (`finance-ai-v3`).
4. Vercel should detect the Vite build configuration. The included `vercel.json` sets the build command and output directory.
5. Before deploying, open **Project Settings → Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `APPS_SCRIPT_API_SECRET` | The value returned by `generateApiBridgeSecret` |
   | `APPS_SCRIPT_URL` | Your Apps Script `/exec` URL |

6. Apply the variables to Production (and Preview/Development if you intend to use those environments).
7. Deploy the project.

The frontend calls `/api/apps-script`. The Vercel function in `api/apps-script.js` forwards each request to the Apps Script URL and adds the secret server-side. This avoids browser-side cross-origin Apps Script requests.

## 5. Test the deployment

1. Open the Vercel deployment URL.
2. Wait for the startup splash to finish.
3. Check the Connection status in the sidebar.
4. Confirm the AI key and Sheet connection status appear as expected.
5. Test a harmless read/query first, then test a write only after confirming the correct Google Sheet is linked.

If the app reports an API error, check:
- `APPS_SCRIPT_URL` ends in `/exec`, not `/dev`.
- `Api.gs` was saved and the Web App was redeployed as a new version.
- `API_BRIDGE_SECRET` in Vercel exactly matches the generated Script Property.
- The web app deployment's access setting permits the server-side request.
- Vercel has been redeployed after changing environment variables.

## 6. Local development

Requirements: Node.js 18 or newer and npm.

```bash
npm install
npm run dev
```

The local Vite frontend uses `/api/apps-script`, so the API route itself must run in a Vercel-compatible environment to make live Apps Script calls. For a full local end-to-end test, use the Vercel CLI (`vercel dev`) after installing it, and configure the same environment variables locally.

Build the static frontend:

```bash
npm run build
```

The production output is written to `dist/`.

## Security and access warning

This project preserves the original backend's authorization and data-access behavior; it does not add user accounts or per-user authentication.

The bridge secret prevents callers from bypassing the Vercel proxy and directly invoking `doPost(e)` without the secret. However, the Vercel `/api/apps-script` route is still callable by visitors who can reach your deployed site, because the server adds the secret. **Do not treat the bridge secret as a login system.**

Expense data is sensitive. Restrict access to the Vercel deployment using an appropriate access-control mechanism before using it with real financial data. Also review the Apps Script Web App's **Execute as** and **Who has access** settings carefully. A deployment that executes as the owner may perform actions using the owner's permissions.

## Files and implementation notes

- `src/index.html` is extracted from the supplied `Index.html`; Apps Script template includes are replaced with static CSS and JavaScript references.
- `src/styles.css` combines the supplied `Styles.html` CSS and the inline CSS from `Client.html`.
- `src/app.js` retains the supplied client-side application logic and replaces `google.script.run` with JSON `fetch()` requests to the Vercel proxy.
- `api/apps-script.js` is a transport proxy only. It does not implement or change finance business logic.
- `Api.gs` dispatches only the existing `api_*` functions through an explicit allowlist. It does not duplicate their business logic.
