import {
  getConfig,
  createState,
  setCookie,
  STATE_COOKIE,
  setNoStore
} from './_utils.js';

export default function handler(req, res) {
  setNoStore(res);

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  try {
    const config = getConfig();
    const state = createState();

    setCookie(res, STATE_COOKIE, state, 600);

    const url = new URL(
      'https://accounts.google.com/o/oauth2/v2/auth'
    );

    url.search = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/drive.file',
      access_type: 'offline',
      prompt: 'consent select_account',
      include_granted_scopes: 'true',
      state
    }).toString();

    res.writeHead(302, {
      Location: url.toString()
    });

    return res.end();

  } catch (error) {
    console.error('OAuth start error:', error.message);

    return res.status(500).send(
      'Google authentication could not be started. Check your Vercel environment variables.'
    );
  }
}
