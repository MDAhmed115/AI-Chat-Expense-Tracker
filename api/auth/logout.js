import {
  getConfig,
  getCookie,
  decryptToken,
  clearCookie,
  SESSION_COOKIE,
  setNoStore,
  isSameOrigin
} from './_utils.js';

export default async function handler(req, res) {
  setNoStore(res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  if (!isSameOrigin(req)) {
    return res.status(403).json({
      error: 'Invalid request origin.'
    });
  }

  const encryptedToken = getCookie(req, SESSION_COOKIE);

  clearCookie(res, SESSION_COOKIE);

  if (encryptedToken) {
    try {
      getConfig();

      const refreshToken = decryptToken(encryptedToken);

      await fetch(
        'https://oauth2.googleapis.com/revoke',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            token: refreshToken
          })
        }
      );

    } catch (error) {
      console.error(
        'Google logout/revoke error:',
        error.message
      );
    }
  }

  return res.status(200).json({
    ok: true
  });
}
