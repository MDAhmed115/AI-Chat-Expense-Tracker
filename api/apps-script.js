const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbxBLlVD844zKFWg1B_FFa9s5LLCRbs0jcouuMFprjqoLNacHrBSjbOlGskZMCb6sWxR/exec';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      message: 'Expense Chat API route is deployed.',
      endpoint: '/api/apps-script',
      method: 'POST'
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({
      ok: false,
      message: 'Method not allowed.'
    });
  }

  const secret = process.env.APPS_SCRIPT_API_SECRET;

  if (!secret) {
    console.error('[Apps Script Proxy] Missing APPS_SCRIPT_API_SECRET');
    return res.status(500).json({
      ok: false,
      code: 'MISSING_SECRET',
      message: 'Missing APPS_SCRIPT_API_SECRET in Vercel.'
    });
  }

  let payload = req.body;

  try {
    if (typeof payload === 'string') {
      payload = JSON.parse(payload);
    }
  } catch {
    return res.status(400).json({
      ok: false,
      message: 'Invalid JSON request body.'
    });
  }

  if (
    !payload ||
    typeof payload.action !== 'string' ||
    !Array.isArray(payload.args)
  ) {
    return res.status(400).json({
      ok: false,
      message: 'Request must include action and args.'
    });
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(APPS_SCRIPT_URL);

    if (
      parsedUrl.protocol !== 'https:' ||
      parsedUrl.hostname !== 'script.google.com'
    ) {
      throw new Error('Unexpected Apps Script URL host.');
    }
  } catch (error) {
    console.error('[Apps Script Proxy] Invalid URL:', error.message);

    return res.status(500).json({
      ok: false,
      code: 'INVALID_APPS_SCRIPT_URL',
      message: 'APPS_SCRIPT_URL is invalid. Check your Vercel environment variable.'
    });
  }

  try {
    console.log('[Apps Script Proxy] Sending request:', {
      action: payload.action,
      target: parsedUrl.hostname
    });

    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: payload.action,
        args: payload.args,
        userApiKey: payload.userApiKey || '',
        userSheetUrl: payload.userSheetUrl || '',
        secret: secret
      }),
      redirect: 'follow'
    });

    const responseText = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'unknown';

    let finalHost = 'unknown';

    try {
      finalHost = new URL(upstream.url).hostname;
    } catch {
      // Keep diagnostic host as unknown
    }

    console.log('[Apps Script Proxy] Upstream response:', {
      action: payload.action,
      status: upstream.status,
      contentType: contentType,
      finalHost: finalHost,
      redirected: upstream.redirected
    });

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      const looksLikeLogin =
        /accounts\.google\.com|ServiceLogin|signin/i.test(
          upstream.url + ' ' + responseText.slice(0, 1000)
        );

      console.error('[Apps Script Proxy] Non-JSON upstream response:', {
        status: upstream.status,
        contentType: contentType,
        finalHost: finalHost,
        looksLikeLogin: looksLikeLogin
      });

      return res.status(502).json({
        ok: false,
        code: looksLikeLogin
          ? 'GAS_LOGIN_REQUIRED'
          : 'GAS_NON_JSON_RESPONSE',
        message: looksLikeLogin
          ? 'Google Apps Script redirected to a login page. Check Web App access permissions.'
          : 'Apps Script returned a non-JSON response. Check its deployment and execution logs.',
        upstreamStatus: upstream.status,
        contentType: contentType,
        finalHost: finalHost
      });
    }

    if (!upstream.ok) {
      console.error('[Apps Script Proxy] Upstream HTTP error:', {
        status: upstream.status,
        finalHost: finalHost
      });

      return res.status(502).json({
        ok: false,
        code: 'GAS_HTTP_ERROR',
        message: 'Google Apps Script returned HTTP ' + upstream.status + '.',
        upstreamStatus: upstream.status,
        finalHost: finalHost
      });
    }

    if (
      data &&
      (
        data.code === 'UNAUTHORIZED' ||
        data.message === 'Unauthorized request.'
      )
    ) {
      console.error('[Apps Script Proxy] Bridge secret rejected.');

      return res.status(401).json({
        ok: false,
        code: 'GAS_BRIDGE_UNAUTHORIZED',
        message: 'Apps Script rejected the bridge secret. Check both secret settings.'
      });
    }

    console.log('[Apps Script Proxy] Request completed:', {
      action: payload.action,
      success: true
    });

    return res.status(200).json(data);

  } catch (error) {
    console.error('[Apps Script Proxy] Fetch failed:', {
      name: error.name,
      message: error.message,
      cause: error.cause
        ? String(error.cause.message || error.cause)
        : 'none'
    });

    return res.status(502).json({
      ok: false,
      code: 'GAS_FETCH_FAILED',
      message: error.message || 'Could not reach Google Apps Script.'
    });
  }
}
