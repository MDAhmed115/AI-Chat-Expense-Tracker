import crypto from 'node:crypto';

import {
  getConfig,
  requestGoogleToken,
  getCookie,
  setCookie,
  clearCookie,
  encryptToken,
  STATE_COOKIE,
  SESSION_COOKIE,
  setNoStore
} from './_utils.js';

export default async function handler(req, res) {
  setNoStore(res);

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  const savedState = getCookie(req, STATE_COOKIE);
  const receivedState = String(req.query.state || '');

  clearCookie(res, STATE_COOKIE);

  const statesMatch =
    savedState &&
    receivedState &&
    Buffer.byteLength(savedState) === Buffer.byteLength(receivedState) &&
    crypto.timingSafeEqual(
      Buffer.from(savedState),
      Buffer.from(receivedState)
    );

  if (!statesMatch) {
    res.writeHead(302, {
      Location: '/?auth_error=state'
    });

    return res.end();
  }

  if (req.query.error) {
    res.writeHead(302, {
      Location: '/?auth_error=denied'
    });

    return res.end();
  }

  try {
    const config = getConfig();
    const code = String(req.query.code || '');

    if (!code) {
      throw new Error('Google did not return an authorization code.');
    }

    const result = await requestGoogleToken({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code'
    });

    if (!result.refresh_token) {
      res.writeHead(302, {
        Location: '/?auth_error=refresh_token'
      });

      return res.end();
    }

    const encryptedToken = encryptToken(result.refresh_token);

    setCookie(
      res,
      SESSION_COOKIE,
      encryptedToken,
      15552000
    );

    res.writeHead(302, {
      Location: '/'
    });

    return res.end();

  } catch (error) {
    console.error(
      'OAuth callback error:',
      error.code || error.message
    );

    res.writeHead(302, {
      Location: '/?auth_error=callback'
    });

    return res.end();
  }
}
