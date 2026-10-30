/**
 * Vercel serverless proxy for the Google Apps Script web app.
 *
 * The browser calls this same-origin endpoint. This function forwards the
 * request server-to-server so the browser does not have to handle Apps Script
 * cross-origin redirects/CORS behavior.
 */

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbxBLlVD844zKFWg1B_FFa9s5LLCRbs0jcouuMFprjqoLNacHrBSjbOlGskZMCb6sWxR/exec';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed.' });
  }

  const secret = process.env.APPS_SCRIPT_API_SECRET;
  if (!secret) {
    return res.status(500).json({
      ok: false,
      transportError: true,
      message: 'Missing APPS_SCRIPT_API_SECRET environment variable in Vercel.'
    });
  }

  let payload = req.body;
  try {
    if (typeof payload === 'string') payload = JSON.parse(payload);
  } catch {
    return res.status(400).json({ ok: false, message: 'Invalid JSON request body.' });
  }

  if (!payload || typeof payload.action !== 'string' || !Array.isArray(payload.args)) {
    return res.status(400).json({ ok: false, message: 'Request must include action and args.' });
  }

  try {
    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: payload.action,
        args: payload.args,
        secret
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
        transportError: true,
        message: 'Apps Script did not return JSON. Check its web app deployment access and URL.'
      });
    }

    if (!upstream.ok) {
      return res.status(502).json({
        ok: false,
        transportError: true,
        message: 'Apps Script returned HTTP ' + upstream.status + '.'
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({
      ok: false,
      transportError: true,
      message: error && error.message ? error.message : 'Could not reach the Apps Script web app.'
    });
  }
}
