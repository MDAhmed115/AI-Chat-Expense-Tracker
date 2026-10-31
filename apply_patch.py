from pathlib import Path
import shutil
import sys

ROOT = Path.cwd()

def replace_once(path, old, new):
    file_path = ROOT / path
    source = file_path.read_text(encoding="utf-8")
    if source.count(old) != 1:
        raise SystemExit(f"Expected exactly one matching block in {path}; found {source.count(old)}. No changes made.")
    backup = file_path.with_suffix(file_path.suffix + ".backup")
    shutil.copy2(file_path, backup)
    file_path.write_text(source.replace(old, new, 1), encoding="utf-8")
    print(f"Updated {path}; backup saved as {backup.name}")

old_html = '''          <div class="btn-col">
            <button type="button" class="glass-btn primary" id="createBtn">Create my Sheet</button>
            <button type="button" class="glass-btn" id="haveBtn">Select my existing Sheet</button>
          </div>'''
new_html = '''          <div class="btn-col">
            <a class="glass-btn primary" id="downloadTemplateBtn" href="https://github.com/MDAhmed115/AI-Chat-Expense-Tracker/raw/refs/heads/main/Finance_Tracker-template.xlsx" download="Expense-Chat-Template.xlsx" style="display:flex;align-items:center;justify-content:center;text-align:center;">Download Template</a>
            <button type="button" class="glass-btn" id="haveBtn">Select my Google Sheet</button>
          </div>
          <div class="template-guide hidden" id="templateGuide" role="status" aria-live="polite">
            <strong>Almost there — add the template to your Google Drive</strong>
            <ol>
              <li>Download the Excel template to your device.</li>
              <li>Open <a href="https://drive.google.com/drive/my-drive" target="_blank" rel="noopener">Google Drive</a> using the same Google account you connected above.</li>
              <li>Select <strong>New → File upload</strong> and upload the downloaded <strong>Expense-Chat-Template.xlsx</strong>.</li>
              <li>After uploading, right-click the file and choose <strong>Open with → Google Sheets</strong>. If prompted, save or convert it as a Google Sheets file.</li>
              <li>Return here and click <strong>Select my Google Sheet</strong>. Choose the converted spreadsheet.</li>
            </ol>
            <p>Once linked, Expense Chat can use that spreadsheet to store your transactions, budgets, and chat history.</p>
          </div>'''

old_refs = "    createBtn: $('createBtn'), haveBtn: $('haveBtn'),"
new_refs = "    downloadTemplateBtn: $('downloadTemplateBtn'), templateGuide: $('templateGuide'), haveBtn: $('haveBtn'),"

old_handler = '''  if (el.createBtn) {
    el.createBtn.addEventListener('click', function () {
      el.createBtn.disabled = true;
      setMsg(el.sheetMsg, 'Creating your Sheet...');
      callServer('api_createSheet').then(function (res) {
        el.createBtn.disabled = false;
        if (res && res.ok && res.id) {
          saveCredentials(null, res.id);       // stored in THIS browser only
          setMsg(el.sheetMsg, '');
          chatList = [];
          refreshStatus().then(function () { routeSetup(); renderHistory(); });
        } else {
          setMsg(el.sheetMsg, (res && res.message) || 'Could not create the Sheet.', true);
        }
      }).catch(function () { el.createBtn.disabled = false; setMsg(el.sheetMsg, SERVER_ERR, true); });
    });
  }'''
new_handler = '''  if (el.downloadTemplateBtn) {
    el.downloadTemplateBtn.addEventListener('click', function () {
      if (el.templateGuide) el.templateGuide.classList.remove('hidden');
      setMsg(el.sheetMsg, 'Template download started. Follow the steps below before selecting your Sheet.');
    });
  }'''

old_css = "  .status-line { min-height: 1.3em; margin: 10px 0 0; font-size: 14px; }"
new_css = '''  .status-line { min-height: 1.3em; margin: 10px 0 0; font-size: 14px; }
  .template-guide {
    margin-top: 14px; padding: 14px 16px; border: 1px solid var(--glass-border-dark);
    border-radius: 16px; background: rgba(255, 255, 255, 0.48);
    color: var(--text-main); font-size: 13px; line-height: 1.55;
  }
  body.dark .template-guide { background: rgba(0, 0, 0, 0.22); }
  .template-guide strong { color: var(--olive-primary); }
  .template-guide ol { margin: 9px 0 8px; padding-left: 20px; }
  .template-guide li { margin: 5px 0; }
  .template-guide p { margin: 8px 0 0; color: var(--text-muted); }'''

checks = [
    ("index.html", old_html),
    ("src/app.js", old_refs),
    ("src/app.js", old_handler),
    ("src/styles.css", old_css),
]
for path, old in checks:
    file_path = ROOT / path
    if not file_path.exists():
        raise SystemExit(f"Missing file: {path}")
    count = file_path.read_text(encoding="utf-8").count(old)
    if count != 1:
        raise SystemExit(f"Pre-check failed for {path}: expected one match, found {count}. No files changed.")

replace_once("index.html", old_html, new_html)
replace_once("src/app.js", old_refs, new_refs)
replace_once("src/app.js", old_handler, new_handler)
replace_once("src/styles.css", old_css, new_css)

print("\\nPatch applied. Run npm run build, test the download and sheet-selection flow, then commit and push.")
