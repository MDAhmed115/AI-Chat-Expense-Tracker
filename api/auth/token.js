import {
  getConfig,
  requestGoogleToken,
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

  if (!encryptedToken) {
    return res.status(401).json({
      error: 'Google account is not connected.'
    });
  }

  try {
    const config = getConfig();
    const refreshToken = decryptToken(encryptedToken);

    const result = await requestGoogleToken({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    return res.status(200).json({
      access_token: result.access_token,
      expires_in: result.expires_in || 3600
    });

  } catch (error) {
    if (
      error.code === 'invalid_grant' ||
      error.message === 'Invalid Google session.'
    ) {
      clearCookie(res, SESSION_COOKIE);
    }

    console.error(
      'Google token refresh error:',
      error.code || error.message
    );

    return res.status(
      error.code === 'invalid_grant' ? 401 : 502
    ).json({
      error:
        error.code === 'invalid_grant'
          ? 'Google authorization expired. Reconnect your account.'
          : 'Could not refresh your Google session.'
    });
  }
}
