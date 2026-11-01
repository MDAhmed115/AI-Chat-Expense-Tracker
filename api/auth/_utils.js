import crypto from 'node:crypto';

export const SESSION_COOKIE = '__Host-ec_google_session';
export const STATE_COOKIE = '__Host-ec_oauth_state';

const COOKIE_BASE = 'Path=/; HttpOnly; Secure; SameSite=Lax';

export function getConfig() {
  const config = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  };

  if (
    !config.clientId ||
    !config.clientSecret ||
    !config.redirectUri
  ) {
    throw new Error('Google OAuth environment variables are missing.');
  }

  getEncryptionKey();

  return config;
}

function getEncryptionKey() {
  const secret = process.env.AUTH_COOKIE_SECRET || '';

  if (!/^[a-f0-9]{64}$/i.test(secret)) {
    throw new Error('AUTH_COOKIE_SECRET must contain 64 hexadecimal characters.');
  }

  return Buffer.from(secret, 'hex');
}

export function createState() {
  return crypto.randomBytes(32).toString('hex');
}

export function encryptToken(token) {
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(token, 'utf8'),
    cipher.final()
  ]);

  return [
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    encrypted.toString('base64url')
  ].join('.');
}

export function decryptToken(value) {
  const parts = String(value || '').split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid Google session.');
  }

  const [iv, authTag, encrypted] = parts.map(part =>
    Buffer.from(part, 'base64url')
  );

  if (iv.length !== 12 || authTag.length !== 16 || !encrypted.length) {
    throw new Error('Invalid Google session.');
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    iv
  );

  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]).toString('utf8');
}

export function getCookie(req, name) {
  const cookies = (req.headers.cookie || '').split(';');

  for (const item of cookies) {
    const index = item.indexOf('=');

    if (index < 0) continue;

    const key = item.slice(0, index).trim();

    if (key === name) {
      return decodeURIComponent(item.slice(index + 1).trim());
    }
  }

  return '';
}

function appendSetCookie(res, cookie) {
  const current = res.getHeader('Set-Cookie');

  if (!current) {
    res.setHeader('Set-Cookie', [cookie]);
  } else {
    const existing = Array.isArray(current) ? current : [current];
    res.setHeader('Set-Cookie', [...existing, cookie]);
  }
}

export function setCookie(res, name, value, maxAge) {
  appendSetCookie(
    res,
    `${name}=${encodeURIComponent(value)}; ${COOKIE_BASE}; Max-Age=${maxAge}`
  );
}

export function clearCookie(res, name) {
  appendSetCookie(
    res,
    `${name}=; ${COOKIE_BASE}; Max-Age=0`
  );
}

export function setNoStore(res) {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, private'
  );

  res.setHeader('Pragma', 'no-cache');
}

export function isSameOrigin(req) {
  const origin = req.headers.origin;

  if (!origin) return false;

  const host =
    req.headers['x-forwarded-host'] ||
    req.headers.host;

  const protocol =
    req.headers['x-forwarded-proto'] ||
    'https';

  return origin === `${protocol}://${host}`;
}

export async function requestGoogleToken(params) {
  const response = await fetch(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(params)
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.error_description ||
      data.error ||
      'Google token request failed.'
    );

    error.code = data.error;

    throw error;
  }

  return data;
}
