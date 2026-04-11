import { randomUUID } from 'node:crypto';

function getBaseUrl(req: any) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  return `${proto}://${host}`;
}

export default function handler(req: any, res: any) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const scope = process.env.OAUTH_GITHUB_SCOPE || 'repo';
  const isSecure = (req.headers['x-forwarded-proto'] || 'https') === 'https';

  if (!clientId) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Missing OAUTH_GITHUB_CLIENT_ID');
    return;
  }

  const state = randomUUID();
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/oauth/callback`;
  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');

  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', scope);
  authorizeUrl.searchParams.set('state', state);

  res.statusCode = 302;
  const cookieParts = [`decap_oauth_state=${state}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=300'];
  if (isSecure) cookieParts.splice(3, 0, 'Secure');
  res.setHeader('Set-Cookie', [
    cookieParts.join('; '),
  ]);
  res.setHeader('Location', authorizeUrl.toString());
  res.end();
}
