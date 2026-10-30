const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbxBLlVD844zKFWg1B_FFa9s5LLCRbs0jcouuMFprjqoLNacHrBSjbOlGskZMCb6sWxR/exec';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, message: 'Expense Chat API proxy is ready.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed.' });
  }

  const secret = process.env.APPS_SCRIPT_API_SECRET;
  if (!secret) {
    return res.status(500).json({ ok: false, message: 'Missing APPS_SCRIPT_API_SECRET in Vercel.' });
  }

  let payload = req.body;
  try {
    if (typeof payload === 'string') payload = JSON.parse(payload);
  } catch {
    return res.status(400).json({ ok: false, message: 'Invalid JSON request body.' });
  }

  try {
    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: payload.action,
        args: payload.args || [],
        secret: secret
      }),
      redirect: 'follow'
    });

    const responseText = await upstream.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return res.status(502).json({
        ok: false,
        message: 'Apps Script returned non-JSON. Ensure web app access is set to Anyone.'
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({
      ok: false,
      message: error && error.message ? error.message : 'Failed to communicate with Apps Script.'
    });
  }
}
