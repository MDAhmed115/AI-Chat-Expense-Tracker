(function () {
  'use strict';

  var LIMITS = { finance: 600, chat: 12000 };
  var MAX_LINES = 8;
  var MAX_QUEUE = 10;
  var CONTEXT = 10;
  var MAX_TITLE = 60;
  var CREDIT_URL = 'https://github.com/MDAhmed115';
  var SERVER_ERR = 'I could not reach the server. Check your connection and try again.';
  var TITLES = { finance: 'Finance Manager', chat: 'General Chatbot' };
  var HERO = { finance: 'What did you spend today?', chat: 'What can I help with?' };
  var HOLD = { finance: 'deduct 200 rs from nayapay for fries', chat: 'Ask me anything...' };

  /* Attachments */
  var IMG_MAX = 1600;                       // longest side in pixels after shrinking
  var FILE_MAX = 4 * 1024 * 1024;           // bytes per file (what is sent)
  var ORIGINAL_MAX = 25 * 1024 * 1024;      // biggest photo we will try to shrink
  var TOTAL_MAX = 10 * 1024 * 1024;         // bytes of all files in one message
  var MAX_FILES = { finance: 1, chat: 3 };
  var ACCEPT = {
    finance: 'image/*,.pdf',
    chat: 'image/*,.pdf,.docx,.pptx,.xlsx,.txt,.md,.csv,.tsv,.json,.xml,.html,.css,.js,.ts,.py,.java,.c,.cpp,.cs,.go,.php,.rb,.sql,.yaml,.yml,.log'
  };
  var IMG_EXT = { png: 1, jpg: 1, jpeg: 1, webp: 1, gif: 1, bmp: 1, heic: 1, heif: 1 };

  var ICON_CHECK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';
  var ICON_ALERT = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6v8M12 18h.01"/></svg>';
  var ICON_SUN = '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
  var ICON_MOON = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  var ICON_FIN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z"/><circle cx="16.5" cy="14.5" r="1" fill="currentColor"/></svg>';
  var ICON_CHAT = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';
  var ICON_PIN = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 17v5M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6z"/></svg>';
  var ICON_EDIT = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
  var ICON_TRASH = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';

  function $(id) { return document.getElementById(id); }
  var el = {
    body: document.body, splash: $('splash'), chatContainer: $('chatContainer'), sidebar: $('sidebar'),
    pane: $('messages'), form: $('composer'), input: $('input'), heroText: $('heroText'), topTitle: $('topTitle'),
    menuBtn: $('menuBtn'), closeSide: $('closeSide'), scrim: $('scrim'),
    dot: $('statusDot'), statusText: $('statusText'), overlay: $('overlay'),
    viewKey: $('view-key'), viewSheet: $('view-sheet'),
    keyForm: $('keyForm'), keyInput: $('keyInput'), keySave: $('keySave'), keyBack: $('keyBack'), keyMsg: $('keyMsg'),
    createBtn: $('createBtn'), haveBtn: $('haveBtn'), linkForm: $('linkForm'), sheetInput: $('sheetInput'),
    linkBtn: $('linkBtn'), sheetBack: $('sheetBack'), sheetMsg: $('sheetMsg'),
    setKey: $('setKey'), setSheet: $('setSheet'), sheetLink: $('sheetLink'),
    changeKey: $('changeKey'), changeSheet: $('changeSheet'), removeBtn: $('removeBtn'),
    creditSide: $('creditSide'), creditFoot: $('creditFoot'),
    themeToggle: $('themeToggle'), themeIcon: $('themeIcon'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    histPinnedBox: $('histPinnedBox'), histPinned: $('histPinned'), histRecent: $('histRecent'),
    histMsg: $('histMsg'), newChatBtn: $('newChatBtn'),
    attachBtn: $('attachBtn'), micBtn: $('micBtn'), fileInput: $('fileInput'),
    attachChips: $('attachChips'), composerMsg: $('composerMsg')
  };

  var status = { keySaved: false, sheetSaved: false, sheetUrl: '', ready: false };
  var queue = [];
  var working = false;
  var mode = 'finance';
  var sid = null;            // id of the open thread (also the server session id)
  var token = 0;             // changes whenever the window switches to another thread
  var chatHistory = [];      // [{role, text}] of the open General Chatbot thread
  var chatList = [];         // thread list from the server (both modes)
  var editingId = null;      // thread being renamed
  var pendingFiles = [];     // files waiting to be sent: [{id, name, mime, data}]
  var sessionAttachments = {}; // in-memory attachment cache, keyed by chat session id
  var msgTimer = null;

  if (el.creditSide) el.creditSide.href = CREDIT_URL;
  if (el.creditFoot) el.creditFoot.href = CREDIT_URL;

  function hideSplash() {
    if (el.splash) {
      el.splash.classList.add('fade-out');
      setTimeout(function () {
        if (el.splash && el.splash.parentNode) el.splash.parentNode.removeChild(el.splash);
      }, 420);
    }
  }

  /* ---------- Theme ---------- */
  function applyTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    if (el.themeIcon) el.themeIcon.innerHTML = isDark ? ICON_SUN : ICON_MOON;
    try { localStorage.setItem('ec_theme', isDark ? 'dark' : 'light'); } catch (e) {}
  }
  var savedTheme = (function () { try { return localStorage.getItem('ec_theme'); } catch (e) { return null; } })();
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme === 'dark' || (!savedTheme && prefersDark));
  if (el.themeToggle) el.themeToggle.addEventListener('click', function () { applyTheme(!document.body.classList.contains('dark')); });

  function makeId() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }

  /* ---------- HTTP API calls ---------- */
  function callServer(fn, args) {
    return fetch('/api/apps-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: fn, args: args || [] })
    }).then(function (response) {
      return response.text().then(function (body) {
        var data;
        try {
          data = body ? JSON.parse(body) : null;
        } catch (e) {
          throw new Error('The server returned an invalid response. Check the Apps Script deployment and Vercel API route.');
        }
        if (!response.ok) {
          throw new Error((data && data.message) || ('Request failed with HTTP ' + response.status));
        }
        if (data && data.transportError) {
          throw new Error(data.message || 'The Apps Script request failed.');
        }
        return data;
      });
    });
  }
/* ---------- DOM helpers ---------- */
  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function scrollDown() { el.pane.scrollTop = el.pane.scrollHeight; }
  function refreshFresh() { el.chatContainer.classList.toggle('fresh-session', el.pane.children.length === 0); }
  function leaveFresh() { el.chatContainer.classList.remove('fresh-session'); }
  function isLive(item) { return item.token === token; }

  /* Put a node right after the user's bubble (or at the end). */
  function place(node, item) {
    var pane = el.pane;
    if (item && item.anchor && item.anchor.parentNode === pane) {
      pane.insertBefore(node, item.anchor.nextSibling);
    } else {
      pane.appendChild(node);
    }
    if (item) item.anchor = node;
    scrollDown();
    return node;
  }

  function addUser(text) {
    leaveFresh();
    var n = h('div', 'msg-bubble user', text);
    el.pane.appendChild(n);
    scrollDown();
    return n;
  }

  /* Plain text with clickable http(s) links (built with DOM nodes, never innerHTML). */
  function linkInto(node, text) {
    var re = /https?:\/\/[^\s<>"']+/g;
    var last = 0, m;
    while ((m = re.exec(text))) {
      var url = m[0], tail = '';
      var t = url.match(/[.,;:!?)\]]+$/);
      if (t) { tail = t[0]; url = url.slice(0, url.length - tail.length); }
      node.appendChild(document.createTextNode(text.slice(last, m.index)));
      var a = h('a', null, url);
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      node.appendChild(a);
      if (tail) node.appendChild(document.createTextNode(tail));
      last = m.index + m[0].length;
    }
    node.appendChild(document.createTextNode(text.slice(last)));
  }

  /* Chatbot answers: plain text with ``` code fences drawn as code blocks. */
  function richInto(node, text) {
    var parts = String(text).split('```');
    parts.forEach(function (p, i) {
      if (i % 2 === 1) {
        var code = p.replace(/^[a-zA-Z0-9_+#.-]*\n/, '').replace(/\n$/, '');
        var pre = h('pre', 'code-block');
        pre.appendChild(h('code', null, code));
        node.appendChild(pre);
      } else {
        var t = p.replace(/^\n+|\n+$/g, '');
        if (t) { var d = h('div', 'chat-text'); linkInto(d, t); node.appendChild(d); }
      }
    });
    if (!node.firstChild) node.appendChild(h('div', 'chat-text', String(text)));
  }

  function makeBotBubble(text, kind) {
    var cls = 'msg-bubble bot' + (kind === 'review' ? ' review' : '') + (kind === 'error' ? ' error' : '') + (kind === 'chat' ? ' chat' : '');
    var n = h('div', cls);
    if (kind === 'chat') richInto(n, text); else n.textContent = text;
    return n;
  }

  function addBot(text, kind, item) {
    leaveFresh();
    return place(makeBotBubble(text, kind), item);
  }

  /* Transaction confirmation card */
  function addCard(c, item) {
    leaveFresh();
    var review = c.status === 'review';
    var card = h('div', 'confirm-card' + (review ? ' review' : ''));
    var head = h('div', 'card-header');
    var tick = h('span', 'status-tick');
    tick.innerHTML = review ? ICON_ALERT : ICON_CHECK;
    head.appendChild(tick);
    var label = c.type === 'Income' ? 'Income added' : (c.type === 'Transfer' ? 'Transfer added' : 'Expense added');
    head.appendChild(h('span', null, review ? 'Saved, needs review' : label));
    card.appendChild(head);
    card.appendChild(h('div', 'card-val', c.amount));
    var rows = h('dl', 'card-grid');
    [['Account', c.account], ['Category', c.category], ['Date', c.date]].forEach(function (r) {
      rows.appendChild(h('dt', null, r[0]));
      rows.appendChild(h('dd', null, r[1]));
    });
    card.appendChild(rows);
    if (c.actions && c.actions.edit && c.actions.delete) {
      var actions = h('div', 'card-actions');
      var edit = h('button', 'mini-action', 'Edit'); edit.type = 'button';
      var del = h('button', 'mini-action danger', 'Delete'); del.type = 'button';
      edit.addEventListener('click', function () { editTransaction(c.rowIndex || c.actions.edit.rowIndex, card); });
      del.addEventListener('click', function () { deleteTransaction(c.rowIndex || c.actions.delete.rowIndex, card); });
      actions.appendChild(edit); actions.appendChild(del); card.appendChild(actions);
    }
    return place(card, item);
  }

  /* Query / clear / saved report card */
  function addReport(c, item) {
    leaveFresh();
    var card = h('div', 'confirm-card report-card');
    var head = h('div', 'card-header');
    var tick = h('span', 'status-tick');
    tick.innerHTML = ICON_CHECK;
    head.appendChild(tick);
    head.appendChild(h('span', null, c.headLabel || 'Query completed'));
    card.appendChild(head);

    card.appendChild(h('div', 'report-title', c.title || 'Report'));
    if (c.subtitle) card.appendChild(h('div', 'report-sub', c.subtitle));
    card.appendChild(h('span', 'report-total-label', c.totalLabel || 'Total'));
    card.appendChild(h('div', 'card-val', c.totalAmount || ''));

    var rows = c.rows || [];
    if (rows.length) {
      var list = h('ul', 'report-rows custom-scroll');
      rows.forEach(function (r) {
        var li = h('li', 'report-row');
        var main = h('div', 'rr-main');
        main.appendChild(h('span', 'rr-label', r.label));
        if (r.meta) main.appendChild(h('span', 'rr-meta', r.meta));
        li.appendChild(main);
        li.appendChild(h('span', 'rr-val', r.value));
        if (r.actions && r.actions.edit && r.actions.delete) {
          var rowActions = h('div', 'row-actions');
          var rowEdit = h('button', 'mini-action', 'Edit'); rowEdit.type = 'button';
          var rowDelete = h('button', 'mini-action danger', 'Delete'); rowDelete.type = 'button';
          rowEdit.addEventListener('click', function () { editTransaction(r.rowIndex || r.actions.edit.rowIndex, li); });
          rowDelete.addEventListener('click', function () { deleteTransaction(r.rowIndex || r.actions.delete.rowIndex, li); });
          rowActions.appendChild(rowEdit); rowActions.appendChild(rowDelete); main.appendChild(rowActions);
        }
        list.appendChild(li);
      });
      card.appendChild(list);
    } else if (c.emptyText) {
      card.appendChild(h('div', 'report-empty', c.emptyText));
    }
    if (c.note) card.appendChild(h('div', 'report-note', c.note));
    return place(card, item);
  }


  function actionButton(label, cls, fn) {
    var b = h('button', 'mini-action' + (cls ? ' ' + cls : ''), label);
    b.type = 'button'; b.addEventListener('click', fn); return b;
  }

  function addBudgetCard(c, item) {
    leaveFresh();
    var card = h('div', 'confirm-card report-card budget-card');
    var head = h('div', 'card-header');
    var tick = h('span', 'status-tick'); tick.innerHTML = c.status === 'warning' ? ICON_ALERT : ICON_CHECK;
    head.appendChild(tick); head.appendChild(h('span', null, 'Monthly budget'));
    card.appendChild(head);
    card.appendChild(h('div', 'report-title', c.title || 'Monthly budget'));
    if (c.subtitle) card.appendChild(h('div', 'report-sub', c.subtitle));
    card.appendChild(h('span', 'report-total-label', c.totalLabel || 'Total budgeted'));
    card.appendChild(h('div', 'card-val', c.totalAmount || 'Rs 0'));
    if (c.spentAmount) card.appendChild(h('div', 'report-sub', 'Spent: ' + c.spentAmount));
    var rows = c.rows || [];
    if (rows.length) {
      var list = h('div', 'report-rows');
      rows.forEach(function (r) {
        var row = h('div', 'budget-row');
        var top = h('div', 'budget-row-head');
        top.appendChild(h('span', 'budget-name', r.label));
        top.appendChild(h('strong', null, r.value));
        row.appendChild(top);
        if (r.meta) row.appendChild(h('div', 'budget-numbers', r.meta));
        var track = h('div', 'budget-track');
        var fill = h('div', 'budget-fill' + (r.status === 'over' ? ' over' : (r.status === 'warning' ? ' warning' : '')));
        fill.style.width = Math.max(0, Math.min(100, Number(r.progress) || 0)) + '%';
        track.appendChild(fill); row.appendChild(track);
        row.appendChild(actionButton('Edit budget', '', function () { promptSetBudget(r.label); }));
        list.appendChild(row);
      });
      card.appendChild(list);
    } else if (c.emptyText) card.appendChild(h('div', 'report-empty', c.emptyText));
    var actions = h('div', 'budget-actions');
    actions.appendChild(actionButton('Set category budget', '', promptSetBudget));
    card.appendChild(actions);
    if (c.note) card.appendChild(h('div', 'report-note', c.note));
    return place(card, item);
  }

  function editTransaction(rowIndex, host) {
    if (!rowIndex) return;
    var field = window.prompt('Which field do you want to edit? Enter: amount, date, account, category, description, or toAccount');
    if (field === null) return;
    field = String(field).trim();
    var allowed = { amount: 1, date: 1, account: 1, category: 1, description: 1, toAccount: 1 };
    if (!allowed[field]) { window.alert('Use one of: amount, date, account, category, description, toAccount.'); return; }
    var value = window.prompt('Enter the new ' + field + (field === 'date' ? ' (YYYY-MM-DD)' : '') + '.');
    if (value === null) return;
    if (!String(value).trim()) { window.alert('No change made. A value is required.'); return; }
    var changes = {}; changes[field] = field === 'amount' ? Number(String(value).replace(/,/g, '')) : String(value).trim();
    if (field === 'amount' && !(changes.amount > 0)) { window.alert('Amount must be a positive number.'); return; }
    callServer('api_updateRow', [rowIndex, changes]).then(function (res) {
      if (!res || !res.ok) { window.alert((res && res.message) || 'Could not update the transaction.'); return; }
      if (host) {
        var note = h('div', 'report-note', 'Updated. Run the relevant query again to refresh the displayed values.');
        host.appendChild(note);
        var actions = host.querySelector('.card-actions, .row-actions'); if (actions) actions.remove();
      }
    }).catch(function () { window.alert(SERVER_ERR); });
  }

  function deleteTransaction(rowIndex, host) {
    if (!rowIndex || !window.confirm('Delete this transaction? This cannot be undone.')) return;
    callServer('api_deleteRow', [rowIndex]).then(function (res) {
      if (!res || !res.ok) { window.alert((res && res.message) || 'Could not delete the transaction.'); return; }
      if (host) {
        host.classList.add('off');
        var actions = host.querySelector('.card-actions, .row-actions'); if (actions) actions.remove();
        host.appendChild(h('div', 'report-note', 'Deleted. Run the relevant query again to refresh the report.'));
      }
    }).catch(function () { window.alert(SERVER_ERR); });
  }

  function currentPeriod() {
    var d = new Date(); return { month: d.getMonth() + 1, year: d.getFullYear() };
  }

  function showBudget() {
    var p = currentPeriod();
    callServer('api_getBudget', [p.month, p.year]).then(function (res) {
      if (!res || !res.ok) { addBot((res && res.message) || 'Could not load budgets.', 'error'); return; }
      if (res.reply) addBot(res.reply, 'query');
      if (res.card) addBudgetCard(res.card, null);
    }).catch(function () { addBot(SERVER_ERR, 'error'); });
  }

  function promptSetBudget(category) {
    var cat = category || window.prompt('Category name (must match your Categories tab):');
    if (cat === null || !String(cat).trim()) return;
    var amount = window.prompt('Monthly budget for ' + cat + ' in PKR:');
    if (amount === null) return;
    var n = Number(String(amount).replace(/,/g, '').trim());
    if (!(n > 0) || !isFinite(n)) { window.alert('Enter a positive budget amount.'); return; }
    callServer('api_setBudget', [String(cat).trim(), n]).then(function (res) {
      if (!res || !res.ok) { addBot((res && res.message) || 'Could not save that budget.', 'error'); return; }
      addBot(res.message || 'Budget saved.', 'added');
      if (res.card) addBudgetCard(res.card, null);
    }).catch(function () { addBot(SERVER_ERR, 'error'); });
  }

  function downloadReport() {
    var p = currentPeriod();
    var period = window.prompt('Month to export (YYYY-MM):', p.year + '-' + (p.month < 10 ? '0' : '') + p.month);
    if (period === null) return;
    var m = String(period).trim().match(/^(\d{4})-(\d{2})$/);
    if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) { window.alert('Use YYYY-MM, for example 2026-10.'); return; }
    var format = window.prompt('Export format: pdf, html, or text', 'pdf');
    if (format === null) return;
    format = String(format).trim().toLowerCase();
    if (['pdf', 'html', 'text', 'txt'].indexOf(format) < 0) { window.alert('Choose PDF, HTML or text.'); return; }
    callServer('api_exportReport', [Number(m[2]), Number(m[1]), format]).then(function (res) {
      if (!res || !res.ok) { window.alert((res && res.message) || 'Could not export the report.'); return; }
      var blob;
      if (res.base64) {
        var raw = atob(res.base64), bytes = new Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        blob = new Blob([bytes], { type: res.mimeType || 'application/pdf' });
      } else blob = new Blob([res.content || ''], { type: res.mimeType || 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob), a = h('a');
      a.href = url; a.download = res.filename || 'Expense-Chat-Report';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      addBot('Report downloaded: ' + a.download, 'added');
    }).catch(function () { window.alert(SERVER_ERR); });
  }

  function installFinanceTools() {
    if (!el.sidebar || $('financeToolsSection')) return;
    var section = h('section'); section.id = 'financeToolsSection';
    section.appendChild(h('p', 'side-label', 'Finance tools'));
    var col = h('div', 'finance-tools');
    var budget = h('button', 'glass-btn', 'Budget status'); budget.type = 'button';
    var set = h('button', 'glass-btn', 'Set category budget'); set.type = 'button';
    var report = h('button', 'glass-btn', 'Export monthly report'); report.type = 'button';
    budget.addEventListener('click', function () { setSide(false); showBudget(); });
    set.addEventListener('click', function () { setSide(false); promptSetBudget(); });
    report.addEventListener('click', function () { setSide(false); downloadReport(); });
    col.appendChild(budget); col.appendChild(set); col.appendChild(report); section.appendChild(col);
    var connection = el.dot && el.dot.closest('section');
    if (connection && connection.parentNode === el.sidebar) el.sidebar.insertBefore(section, connection);
    else el.sidebar.appendChild(section);
  }

  /* ---------- Preview card: review extracted receipt / statement rows, then Save ---------- */
  function mkSelect(options, value, placeholder, label) {
    var s = h('select', 'pv-in');
    s.setAttribute('aria-label', label);
    var o0 = h('option', null, placeholder); o0.value = '';
    s.appendChild(o0);
    options.forEach(function (x) { var o = h('option', null, x); o.value = x; s.appendChild(o); });
    s.value = value || '';
    return s;
  }

  function addPreview(p, item) {
    leaveFresh();
    var card = h('div', 'confirm-card preview-card');
    var head = h('div', 'card-header');
    var tick = h('span', 'status-tick');
    tick.innerHTML = ICON_ALERT;
    head.appendChild(tick);
    head.appendChild(h('span', null, 'Review before saving'));
    card.appendChild(head);
    var rowsData = p.rows || [];
    card.appendChild(h('div', 'report-sub', rowsData.length + ' found. Nothing is saved yet. Untick any row you do not want.'));

    var list = h('div', 'pv-list custom-scroll');
    var refs = [];
    rowsData.forEach(function (r, i) {
      var row = h('div', 'pv-row' + (r.skip ? ' off' : ''));
      var top = h('div', 'pv-top');
      var chk = h('input'); chk.type = 'checkbox'; chk.checked = !r.skip; chk.setAttribute('aria-label', 'Include row ' + (i + 1));
      var desc = h('input', 'pv-in'); desc.type = 'text'; desc.value = r.description || ''; desc.maxLength = 60; desc.placeholder = 'Description'; desc.setAttribute('aria-label', 'Description');
      var amt = h('input', 'pv-in'); amt.type = 'number'; amt.step = '0.01'; amt.min = '0'; amt.value = r.amount; amt.style.maxWidth = '120px'; amt.setAttribute('aria-label', 'Amount in rupees');
      top.appendChild(chk); top.appendChild(desc); top.appendChild(amt);
      row.appendChild(top);

      var grid = h('div', 'pv-grid');
      var date = h('input', 'pv-in'); date.type = 'date'; date.value = r.date || ''; date.setAttribute('aria-label', 'Date');
      var type = mkSelect(['Expense', 'Income'], r.type, 'Type', 'Type'); type.options[0].disabled = true;
      var acc = mkSelect(p.accounts || [], r.account, 'Choose account', 'Account');
      var cat = mkSelect(p.categories || [], r.category, 'Choose category', 'Category');
      function syncType() { cat.disabled = type.value === 'Income'; if (cat.disabled) cat.value = ''; }
      type.addEventListener('change', syncType); syncType();
      chk.addEventListener('change', function () { row.classList.toggle('off', !chk.checked); });
      grid.appendChild(date); grid.appendChild(type); grid.appendChild(acc); grid.appendChild(cat);
      row.appendChild(grid);

      var flags = (r.flags || []).filter(function (f) { return f; });
      if (flags.length) row.appendChild(h('div', 'pv-flag', flags.join('. ') + '.'));
      list.appendChild(row);
      refs.push({ chk: chk, desc: desc, amt: amt, date: date, type: type, acc: acc, cat: cat, row: row });
    });
    card.appendChild(list);

    var actions = h('div', 'pv-actions');
    var msg = h('span', 'pv-msg');
    var discard = h('button', 'glass-btn', 'Discard'); discard.type = 'button';
    var save = h('button', 'glass-btn primary', 'Save selected'); save.type = 'button';
    actions.appendChild(msg); actions.appendChild(discard); actions.appendChild(save);
    card.appendChild(actions);

    function setBusy(on) {
      refs.forEach(function (r) { [r.chk, r.desc, r.amt, r.date, r.type, r.acc].forEach(function (n) { n.disabled = on; }); r.cat.disabled = on || r.type.value === 'Income'; });
      save.disabled = on; discard.disabled = on;
    }
    function finish(text) {
      setBusy(true);
      refs.forEach(function (r) { r.cat.disabled = true; });
      actions.innerHTML = '';
      actions.appendChild(h('span', 'pv-done', text));
    }

    discard.addEventListener('click', function () { finish('Discarded. Nothing was saved.'); });

    save.addEventListener('click', function () {
      var out = [], bad = '';
      refs.forEach(function (r, i) {
        if (!r.chk.checked || bad) return;
        var a = parseFloat(r.amt.value);
        var n = 'Row ' + (i + 1) + ': ';
        if (!(a > 0)) bad = n + 'check the amount.';
        else if (!r.date.value) bad = n + 'choose a date.';
        else if (!r.acc.value) bad = n + 'choose an account.';
        else if (r.type.value === 'Expense' && !r.cat.value) bad = n + 'choose a category.';
        else if (!r.type.value) bad = n + 'choose a type.';
        else out.push({ type: r.type.value, amount: a, date: r.date.value, account: r.acc.value, category: r.type.value === 'Expense' ? r.cat.value : '', description: r.desc.value });
      });
      if (bad) { msg.textContent = bad; return; }
      if (!out.length) { msg.textContent = 'Tick at least one row.'; return; }
      msg.textContent = 'Saving...';
      msg.style.color = 'var(--text-muted)';
      setBusy(true);
      callServer('api_saveExtracted', [out, item.sid]).then(function (res) {
        if (res && res.ok) {
          finish('Saved ' + out.length + (out.length === 1 ? ' row.' : ' rows.'));
          if (isLive(item)) showResult(res, { anchor: card });
          callServer('api_historySave', [item.sid, item.mode, 'Saved ' + out.length + ' rows from the attached file', res.reply]).then(function (r) { if (r && r.ok) loadHistoryList(); }).catch(function () {});
        } else {
          setBusy(false);
          msg.style.color = 'var(--err-color)';
          msg.textContent = (res && res.reply) || 'Could not save. Please try again.';
        }
      }).catch(function () {
        setBusy(false);
        msg.style.color = 'var(--err-color)';
        msg.textContent = SERVER_ERR;
      });
    });

    return place(card, item);
  }

  function showTyping(item) {
    hideTyping();
    var t = h('div', 'msg-bubble bot typing-indicator');
    t.id = 'typingIndicator';
    t.appendChild(h('span')); t.appendChild(h('span')); t.appendChild(h('span'));
    place(t, { anchor: item.anchor });
  }

  function hideTyping() {
    var t = $('typingIndicator');
    if (t && t.parentNode) t.parentNode.removeChild(t);
  }

  /* ---------- Sidebar ---------- */
  function setSide(open) {
    el.body.classList.toggle('side-open', open);
    if (el.menuBtn) el.menuBtn.setAttribute('aria-expanded', String(open));
    if (open && status.ready) { refreshFull(); loadHistoryList(); }
  }
  if (el.menuBtn) el.menuBtn.addEventListener('click', function () { setSide(!el.body.classList.contains('side-open')); });
  if (el.closeSide) el.closeSide.addEventListener('click', function () { setSide(false); });
  if (el.scrim) el.scrim.addEventListener('click', function () { setSide(false); });

  function applyStatus(s) {
    status = { keySaved: !!(s && s.keySaved), sheetSaved: !!(s && s.sheetSaved), sheetUrl: (s && s.sheetUrl) || status.sheetUrl || '', ready: !!(s && s.ready) };
    if (el.dot) el.dot.className = 'dot' + (status.ready ? ' ok' : '');
    if (el.statusText) el.statusText.textContent = status.ready ? 'Connected' : 'Setup needed';
    if (el.setKey) el.setKey.textContent = status.keySaved ? 'Saved' : 'Not set';
    if (el.setSheet) el.setSheet.textContent = status.sheetSaved ? 'Linked' : 'Not linked';
    if (el.sheetLink) {
      if (status.sheetUrl && status.sheetSaved) { el.sheetLink.href = status.sheetUrl; el.sheetLink.classList.remove('hidden'); }
      else el.sheetLink.classList.add('hidden');
    }
    return status;
  }
  function refreshFull() { return callServer('api_getStatusFull').then(applyStatus).catch(function () {}); }
  function refreshStatus() { return callServer('api_getStatus').then(applyStatus); }

  /* ---------- Composer message line ---------- */
  function composerMsg(text, sticky) {
    if (!el.composerMsg) return;
    clearTimeout(msgTimer);
    if (!text) { el.composerMsg.classList.add('hidden'); el.composerMsg.textContent = ''; return; }
    el.composerMsg.textContent = text;
    el.composerMsg.classList.remove('hidden');
    if (!sticky) msgTimer = setTimeout(function () { composerMsg(''); }, 7000);
  }

  /* ---------- Threads and modes ---------- */
  function autoGrow() {
    el.input.style.height = 'auto';
    el.input.style.height = Math.min(el.input.scrollHeight, 140) + 'px';
  }

  function applyModeUI() {
    Array.prototype.forEach.call(el.modeBtns, function (b) {
      var on = b.getAttribute('data-mode') === mode;
      b.classList.toggle('active', on);
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    el.topTitle.textContent = TITLES[mode];
    el.heroText.textContent = HERO[mode];
    var financeTools = $('financeToolsSection');
    if (financeTools) financeTools.classList.toggle('hidden', mode !== 'finance');
    el.input.placeholder = HOLD[mode];
    el.input.maxLength = LIMITS[mode];
    if (el.fileInput) { el.fileInput.accept = ACCEPT[mode]; el.fileInput.multiple = mode === 'chat'; }
    pendingFiles = [];
    renderChips();
    composerMsg('');
    try { localStorage.setItem('ec_mode', mode); } catch (e) {}
  }

  /* Opens a clean window for a brand-new thread in mode m. The previous thread
     is already saved (it is saved after every reply) and shows under Recent. */
  function newThread(m) {
    mode = m;
    sid = makeId();
    token += 1;
    chatHistory = [];
    editingId = null;
    hideTyping();
    el.pane.innerHTML = '';
    setHistMsg('');
    applyModeUI();
    refreshFresh();
    renderHistory();
    if (status.ready) loadHistoryList();
  }

  Array.prototype.forEach.call(el.modeBtns, function (b) {
    b.addEventListener('click', function () {
      var m = b.getAttribute('data-mode');
      if (m !== mode) newThread(m);
      setSide(false);
    });
  });

  if (el.newChatBtn) el.newChatBtn.addEventListener('click', function () { newThread(mode); setSide(false); });

  function openThread(id) {
    setHistMsg('');
    callServer('api_historyOpen', [id]).then(function (res) {
      if (!res || !res.ok) { setHistMsg((res && res.message) || 'Could not open that chat.'); return; }
      mode = res.mode === 'chat' ? 'chat' : 'finance';   // reopening switches to the thread's own mode
      sid = id;
      token += 1;
      editingId = null;
      hideTyping();
      var msgs = res.messages || [];
      chatHistory = mode === 'chat' ? msgs.map(function (m) { return { role: m.role, text: m.text }; }) : [];
      el.pane.innerHTML = '';
      msgs.forEach(function (m) {
        if (m.role === 'user') el.pane.appendChild(h('div', 'msg-bubble user', m.text));
        else el.pane.appendChild(makeBotBubble(m.text, mode === 'chat' ? 'chat' : 'added'));
      });
      applyModeUI();
      refreshFresh();
      scrollDown();
      renderHistory();
      setSide(false);
    }).catch(function () { setHistMsg(SERVER_ERR); });
  }

  /* ---------- Chat history list ---------- */
  function setHistMsg(t) { if (el.histMsg) el.histMsg.textContent = t || ''; }

  function loadHistoryList() {
    return callServer('api_historyList').then(function (res) {
      chatList = (res && res.chats) || [];
      if (!editingId) renderHistory();
    }).catch(function () {});
  }

  function actBtn(cls, label, icon, fn) {
    var b = h('button', 'hist-act' + (cls ? ' ' + cls : ''));
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.title = label;
    b.innerHTML = icon;
    b.addEventListener('click', function (e) { e.stopPropagation(); fn(); });
    return b;
  }

  function buildHistItem(c) {
    var li = h('li', 'hist-item' + (c.id === sid ? ' active' : ''));
    var ico = h('span', 'hist-ico ' + c.mode);
    ico.innerHTML = c.mode === 'chat' ? ICON_CHAT : ICON_FIN;
    ico.title = c.mode === 'chat' ? 'General Chatbot' : 'Finance Manager';
    li.appendChild(ico);

    if (editingId === c.id) {
      var inp = h('input', 'hist-rename');
      inp.type = 'text';
      inp.value = c.title || '';
      inp.maxLength = MAX_TITLE;
      inp.setAttribute('aria-label', 'Chat name');
      var finished = false;
      function commit() {
        if (finished) return; finished = true;
        var v = inp.value.replace(/\s+/g, ' ').trim();
        editingId = null;
        if (v && v !== c.title) renameThread(c.id, v); else renderHistory();
      }
      function cancel() { if (finished) return; finished = true; editingId = null; renderHistory(); }
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); commit(); }
        else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
      });
      inp.addEventListener('blur', commit);
      li.appendChild(inp);
      setTimeout(function () { inp.focus(); inp.select(); }, 0);
    } else {
      var main = h('button', 'hist-main', c.title || 'New chat');
      main.type = 'button';
      main.title = c.title || '';
      main.addEventListener('click', function () { openThread(c.id); });
      li.appendChild(main);
      li.appendChild(actBtn(c.pinned ? 'on' : '', c.pinned ? 'Unpin chat' : 'Pin chat', ICON_PIN, function () { togglePin(c.id); }));
      li.appendChild(actBtn('', 'Rename chat', ICON_EDIT, function () { editingId = c.id; renderHistory(); }));
      li.appendChild(actBtn('del', 'Delete chat', ICON_TRASH, function () { deleteThread(c.id); }));
    }
    return li;
  }

  function renderHistory() {
    el.histPinned.innerHTML = '';
    el.histRecent.innerHTML = '';
    var pinned = chatList.filter(function (c) { return c.pinned; });
    var recent = chatList.filter(function (c) { return !c.pinned; });
    el.histPinnedBox.classList.toggle('hidden', pinned.length === 0);
    pinned.forEach(function (c) { el.histPinned.appendChild(buildHistItem(c)); });
    if (!recent.length) {
      var msg = status.sheetSaved ? 'No saved chats yet.' : 'Link a Sheet to save chats.';
      el.histRecent.appendChild(h('li', 'hist-empty', pinned.length ? 'Nothing else yet.' : msg));
    }
    recent.forEach(function (c) { el.histRecent.appendChild(buildHistItem(c)); });
  }

  function togglePin(id) {
    setHistMsg('');
    callServer('api_historyPin', [id]).then(function (res) {
      if (res && res.ok === false) setHistMsg(res.message || 'Could not change the pin.');
      return loadHistoryList();
    }).catch(function () { setHistMsg(SERVER_ERR); });
  }

  function renameThread(id, title) {
    setHistMsg('');
    chatList.forEach(function (c) { if (c.id === id) c.title = title; });   // show it at once
    renderHistory();
    callServer('api_historyRename', [id, title]).then(function (res) {
      if (res && res.ok === false) setHistMsg(res.message || 'Could not rename the chat.');
      return loadHistoryList();
    }).catch(function () { setHistMsg(SERVER_ERR); });
  }

  function deleteThread(id) {
    if (!window.confirm('Delete this chat? This cannot be undone.')) return;
    setHistMsg('');
    callServer('api_historyDelete', [id]).then(function (res) {
      if (res && res.ok === false) { setHistMsg(res.message || 'Could not delete the chat.'); return; }
      chatList = chatList.filter(function (c) { return c.id !== id; });
      if (id === sid) newThread(mode); else renderHistory();
      return loadHistoryList();
    }).catch(function () { setHistMsg(SERVER_ERR); });
  }

  /* ---------- Setup screens ---------- */
  function setMsg(node, text, bad) {
    if (!node) return;
    node.textContent = text || '';
    node.style.color = bad ? 'var(--err-color)' : 'var(--text-muted)';
  }

  function showView(name) {
    if (el.viewKey) el.viewKey.classList.toggle('hidden', name !== 'key');
    if (el.viewSheet) el.viewSheet.classList.toggle('hidden', name !== 'sheet');
    if (el.keyBack) el.keyBack.classList.toggle('hidden', !status.ready);
    if (el.sheetBack) el.sheetBack.classList.toggle('hidden', !status.ready);
    setMsg(el.keyMsg, ''); setMsg(el.sheetMsg, '');
    if (el.overlay) el.overlay.classList.remove('hidden');
  }
  function hideOverlay() { if (el.overlay) el.overlay.classList.add('hidden'); }
  function routeSetup() {
    if (!status.keySaved) showView('key');
    else if (!status.sheetSaved) showView('sheet');
    else hideOverlay();
  }

  /* ---------- Attachments ---------- */
  function extOf(name) { var m = String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/); return m ? m[1] : ''; }
  function baseOf(name) { return String(name || 'file').replace(/\.[^.]*$/, '').slice(0, 60) || 'file'; }
  function isImageFile(f) { return (f.type || '').indexOf('image/') === 0 || !!IMG_EXT[extOf(f.name)]; }
  function approxBytes(b64) { return Math.round(b64.length * 0.75); }

  function readAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(String(fr.result).split(',')[1] || ''); };
      fr.onerror = function () { reject(new Error('I could not read "' + file.name + '".')); };
      fr.readAsDataURL(file);
    });
  }

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, ht = img.naturalHeight;
        var s = Math.min(1, IMG_MAX / Math.max(w, ht));
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(ht * s));
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        var data = c.toDataURL('image/jpeg', 0.85).split(',')[1] || '';
        resolve({ name: baseOf(file.name) + '.jpg', mime: 'image/jpeg', data: data });
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('I could not open "' + file.name + '". Try a JPEG or PNG photo.')); };
      img.src = url;
    });
  }

  function prepFile(file) {
    var ext = extOf(file.name);
    if (isImageFile(file)) {
      if (file.size > ORIGINAL_MAX) return Promise.reject(new Error('"' + file.name + '" is too big.'));
      return compressImage(file);
    }
    if (mode === 'finance' && ext !== 'pdf') return Promise.reject(new Error('Finance Manager reads images and PDFs only.'));
    if (file.size > FILE_MAX) return Promise.reject(new Error('"' + file.name + '" is over 4 MB.'));
    return readAsBase64(file).then(function (data) { return { name: file.name, mime: file.type || '', data: data }; });
  }

  function renderChips() {
    if (!el.attachChips) return;
    el.attachChips.innerHTML = '';
    var cached = mode === 'chat' ? (sessionAttachments[sid] || []) : [];
    el.attachChips.classList.toggle('hidden', pendingFiles.length === 0 && cached.length === 0);
    if (pendingFiles.length) el.attachChips.appendChild(h('span', 'context-label', 'Ready to send'));
    pendingFiles.forEach(function (f, i) {
      var chip = h('span', 'chip'); chip.appendChild(h('span', 'chip-name', f.name));
      var x = h('button', 'chip-x', '\u00D7'); x.type = 'button';
      x.setAttribute('aria-label', 'Remove ' + f.name);
      x.addEventListener('click', function () { pendingFiles.splice(i, 1); renderChips(); });
      chip.appendChild(x); el.attachChips.appendChild(chip);
    });
    if (cached.length) el.attachChips.appendChild(h('span', 'context-label', 'Saved in this chat · click Reuse to attach again'));
    cached.forEach(function (f) {
      var chip = h('span', 'chip'); chip.appendChild(h('span', 'chip-name', f.name));
      var already = pendingFiles.some(function (x) { return x.id === f.id; });
      var use = h('button', 'chip-use', already ? 'Added' : 'Reuse'); use.type = 'button'; use.disabled = already;
      use.addEventListener('click', function () {
        if (!pendingFiles.some(function (x) { return x.id === f.id; })) pendingFiles.push(f);
        renderChips(); composerMsg('Attachment added for your next message.');
      });
      var remove = h('button', 'chip-x', '\u00D7'); remove.type = 'button'; remove.setAttribute('aria-label', 'Forget ' + f.name);
      remove.addEventListener('click', function () { sessionAttachments[sid] = (sessionAttachments[sid] || []).filter(function (x) { return x.id !== f.id; }); renderChips(); });
      chip.appendChild(use); chip.appendChild(remove); el.attachChips.appendChild(chip);
    });
  }

  if (el.attachBtn) el.attachBtn.addEventListener('click', function () { if (el.fileInput) el.fileInput.click(); });

  if (el.fileInput) {
    el.fileInput.addEventListener('change', function () {
      var list = Array.prototype.slice.call(el.fileInput.files || []);
      el.fileInput.value = '';
      if (!list.length) return;
      var max = MAX_FILES[mode];
      if (mode === 'finance') pendingFiles = [];
      var room = max - pendingFiles.length;
      if (room <= 0) { composerMsg('You can attach up to ' + max + ' files here.'); return; }
      if (list.length > room) { composerMsg('You can attach up to ' + max + ' file' + (max === 1 ? '' : 's') + ' here. Extra files were skipped.'); list = list.slice(0, room); }
      composerMsg('Preparing your file...', true);
      var errors = [];
      Promise.all(list.map(function (f) {
        return prepFile(f).then(function (r) { return r; }, function (e) { errors.push(e.message || 'Could not use that file.'); return null; });
      })).then(function (res) {
        var total = pendingFiles.reduce(function (n, f) { return n + approxBytes(f.data); }, 0);
        res.forEach(function (r) {
          if (!r) return;
          if (approxBytes(r.data) > FILE_MAX) { errors.push('"' + r.name + '" is over 4 MB after shrinking.'); return; }
          if (total + approxBytes(r.data) > TOTAL_MAX) { errors.push('Too much data in one message. Send fewer files.'); return; }
          total += approxBytes(r.data);
          if (!r.id) r.id = 'att_' + makeId();
          pendingFiles.push(r);
        });
        renderChips();
        composerMsg(errors.length ? errors[0] : '');
      });
    });
  }

  /* ---------- Voice dictation ---------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var rec = null, listening = false, baseText = '';

  function setMicUI(on) {
    listening = on;
    if (el.micBtn) {
      el.micBtn.classList.toggle('rec', on);
      el.micBtn.setAttribute('aria-pressed', String(on));
      el.micBtn.title = on ? 'Stop dictation' : 'Dictate';
    }
  }

  function stopMic() { if (rec) { try { rec.stop(); } catch (e) {} } }

  function startMic() {
    try {
      rec = new SR();
      rec.lang = navigator.language || 'en-US';
      rec.interimResults = true;
      rec.continuous = true;
      baseText = el.input.value;
      rec.onresult = function (e) {
        var t = '';
        for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        var sep = baseText && !/\s$/.test(baseText) ? ' ' : '';
        el.input.value = (baseText + sep + t).slice(0, LIMITS[mode]);
        autoGrow();
      };
      rec.onerror = function (e) {
        var code = e && e.error;
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          composerMsg('The microphone is blocked inside this page. Use the microphone key on your keyboard instead.');
        } else if (code === 'no-speech') {
          composerMsg('I did not hear anything. Try again.');
        } else if (code !== 'aborted') {
          composerMsg('Voice input stopped (' + code + ').');
        }
      };
      rec.onend = function () { setMicUI(false); el.input.focus(); };
      rec.start();
      setMicUI(true);
    } catch (e) {
      setMicUI(false);
      composerMsg('Voice input could not start here. Use the microphone key on your keyboard instead.');
    }
  }

  if (!SR && el.micBtn) {
    el.micBtn.classList.add('hidden');
  } else if (el.micBtn) {
    el.micBtn.addEventListener('click', function () { if (listening) stopMic(); else startMic(); });
  }

  /* ---------- Sending (one queue for both modes) ---------- */
  function enqueue(text, files) {
    if (queue.length >= MAX_QUEUE) { addBot('Queue full. Please wait.', 'error'); return false; }
    files.forEach(function (f) {
      if (!f.id) f.id = 'att_' + makeId();
      if (mode === 'chat') {
        if (!sessionAttachments[sid]) sessionAttachments[sid] = [];
        if (!sessionAttachments[sid].some(function (x) { return x.id === f.id; })) sessionAttachments[sid].push(f);
      }
    });
    var names = files.map(function (f) { return f.name + ' [ID: ' + f.id + ']'; });
    var shown = text + (names.length ? (text ? '\n' : '') + '\uD83D\uDCCE ' + files.map(function (f) { return f.name; }).join(', ') : '');
    var hist = text + (names.length ? (text ? '\n' : '') + '[Attached: ' + names.join(', ') + ']' : '');
    var bubble = addUser(shown);
    bubble.classList.add('queued');
    queue.push({ text: text, files: files, histText: hist, mode: mode, sid: sid, token: token, anchor: bubble });
    pump();
    return true;
  }

  function showResult(res, item) {
    res = res || {};
    var kind = res.kind || (res.ok ? 'added' : 'error');
    addBot(res.reply || 'No reply.', kind, item);
    if (res.preview) addPreview(res.preview, item);
    var cards = res.cards || (res.card ? [res.card] : []);
    cards.forEach(function (c) {
      if (c && c.cardType === 'budget') addBudgetCard(c, item);
      else if (c && c.cardType === 'report') addReport(c, item);
      else if (c) addCard(c, item);
    });
  }

  /* After a reply: remember it for chat context and save it to the Sheet in the background. */
  function afterReply(item, res, live) {
    if (!(res && res.ok && res.reply && res.kind !== 'setup')) return;
    if (live && item.mode === 'chat') {
      chatHistory.push({ role: 'user', text: item.histText });
      chatHistory.push({ role: 'bot', text: res.reply });
    }
    callServer('api_historySave', [item.sid, item.mode, item.histText, res.reply]).then(function (r) {
      if (r && r.ok) loadHistoryList();
    }).catch(function () {});
  }

  function pump() {
    if (working || !queue.length) return;
    working = true;
    var item = queue.shift();
    var live = isLive(item);
    if (live) { item.anchor.classList.remove('queued'); showTyping(item); }

    var call;
    if (item.mode === 'chat') {
      var hist = live ? chatHistory.slice(-CONTEXT) : [];
      call = callServer('api_sendChat', [item.text, hist, item.sid, item.files]);
    } else if (item.files.length) {
      call = callServer('api_sendFinanceFile', [item.text, item.files, item.sid]);
    } else {
      call = callServer('api_sendMessage', [item.text, item.sid]);
    }

    call.then(function (res) {
      var stillLive = isLive(item);
      hideTyping();
      if (stillLive) showResult(res, item);
      afterReply(item, res, stillLive);
    }).catch(function () {
      hideTyping();
      if (isLive(item)) addBot(SERVER_ERR, 'error', item);
    }).then(function () {
      item.files = null;   // free the memory
      working = false;
      pump();
    });
  }

  function handleSubmit() {
    if (listening) stopMic();
    var text = el.input.value.trim();
    var files = pendingFiles.slice();
    if (!text && !files.length) return;
    if (text.length > LIMITS[mode]) { addBot('That message is too long. Please shorten it.', 'error'); return; }
    if (mode === 'finance' && text.split(/\r?\n/).length > MAX_LINES) { addBot('Please keep it to ' + MAX_LINES + ' lines or fewer.', 'error'); return; }
    if (enqueue(text, files)) {
      el.input.value = '';
      pendingFiles = [];
      renderChips();
      composerMsg('');
      autoGrow();
    }
    el.input.focus();
  }

  if (el.form) {
    el.form.addEventListener('submit', function (e) { e.preventDefault(); handleSubmit(); });
  }
  if (el.input) {
    el.input.addEventListener('input', autoGrow);
    el.input.addEventListener('keydown', function (e) {
      // Desktop: Enter sends, Shift+Enter adds a line. Touch screens: Enter adds a line, the button sends.
      var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && fine) { e.preventDefault(); handleSubmit(); }
    });
  }

  /* ---------- Setup form handlers ---------- */
  if (el.keyForm) {
    el.keyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = el.keyInput.value.trim();
      if (!val) return;
      el.keySave.disabled = true;
      setMsg(el.keyMsg, 'Checking your key...');
      callServer('api_saveKey', [val]).then(function (res) {
        el.keySave.disabled = false;
        if (res && res.ok) {
          el.keyInput.value = '';
          setMsg(el.keyMsg, '');
          refreshStatus().then(routeSetup);
        } else {
          setMsg(el.keyMsg, (res && res.message) || 'Could not save the key.', true);
        }
      }).catch(function () { el.keySave.disabled = false; setMsg(el.keyMsg, SERVER_ERR, true); });
    });
  }

  if (el.createBtn) {
    el.createBtn.addEventListener('click', function () {
      el.createBtn.disabled = true;
      setMsg(el.sheetMsg, 'Creating your Sheet...');
      callServer('api_createSheet').then(function (res) {
        el.createBtn.disabled = false;
        if (res && res.ok) {
          if (res.url) status.sheetUrl = res.url;
          setMsg(el.sheetMsg, '');
          refreshStatus().then(routeSetup);
        } else {
          setMsg(el.sheetMsg, (res && res.message) || 'Could not create the Sheet.', true);
        }
      }).catch(function () { el.createBtn.disabled = false; setMsg(el.sheetMsg, SERVER_ERR, true); });
    });
  }

  if (el.haveBtn) el.haveBtn.addEventListener('click', function () { if (el.linkForm) el.linkForm.classList.toggle('hidden'); });

  if (el.linkForm) {
    el.linkForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = el.sheetInput.value.trim();
      if (!val) return;
      el.linkBtn.disabled = true;
      setMsg(el.sheetMsg, 'Checking your Sheet...');
      callServer('api_linkSheet', [val]).then(function (res) {
        el.linkBtn.disabled = false;
        if (res && res.ok) {
          if (res.url) status.sheetUrl = res.url;
          el.sheetInput.value = '';
          setMsg(el.sheetMsg, '');
          refreshStatus().then(function (s) { routeSetup(); chatList = []; renderHistory(); return s; });
        } else {
          setMsg(el.sheetMsg, (res && res.message) || 'Could not link the Sheet.', true);
        }
      }).catch(function () { el.linkBtn.disabled = false; setMsg(el.sheetMsg, SERVER_ERR, true); });
    });
  }

  if (el.keyBack) el.keyBack.addEventListener('click', hideOverlay);
  if (el.sheetBack) el.sheetBack.addEventListener('click', hideOverlay);
  if (el.changeKey) el.changeKey.addEventListener('click', function () { setSide(false); showView('key'); });
  if (el.changeSheet) el.changeSheet.addEventListener('click', function () { setSide(false); showView('sheet'); });
  if (el.removeBtn) {
    el.removeBtn.addEventListener('click', function () {
      if (!window.confirm('Remove your saved AI key and Sheet link? Your Sheet itself is not deleted.')) return;
      callServer('api_resetSetup', ['all']).then(function (s) {
        status.sheetUrl = '';
        applyStatus(s);
        chatList = []; renderHistory();
        setSide(false);
        routeSetup();
      }).catch(function () { addBot(SERVER_ERR, 'error'); });
    });
  }

  /* ---------- App initialization ---------- */
  var startMode = (function () { try { return localStorage.getItem('ec_mode'); } catch (e) { return null; } })();
  mode = startMode === 'chat' ? 'chat' : 'finance';
  sid = makeId();
  installFinanceTools();
  applyModeUI();
  refreshFresh();
  renderHistory();

  refreshStatus().then(function (s) {
    hideSplash();
    if (!s.ready) routeSetup();
  }).catch(function () {
    hideSplash();
  });
})();