function parseCookies(cookieHeader: string | undefined) {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach((part) => {
    const index = part.indexOf('=');
    if (index === -1) return;

    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    cookies[key] = decodeURIComponent(value);
  });

  return cookies;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getBaseUrl(req: any) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  return `${proto}://${host}`;
}

function buildErrorPage(message: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OAuth error</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #000;
        color: #fff;
        font-family: Inter, system-ui, sans-serif;
        padding: 24px;
        text-align: center;
      }
      .card {
        max-width: 560px;
        padding: 24px;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 20px;
        background: rgba(255,255,255,0.04);
      }
      p { color: #d1d5db; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Authentication error</h1>
      <p>${escapeHtml(message)}</p>
    </div>
  </body>
</html>`;
}

function buildGitHubErrorMessage(tokenPayload: any, status: number) {
  if (tokenPayload?.error_description) {
    return `GitHub token exchange failed: ${tokenPayload.error_description}`;
  }

  if (tokenPayload?.error) {
    return `GitHub token exchange failed with error: ${tokenPayload.error}`;
  }

  return `GitHub did not return an access token. HTTP status: ${status}.`;
}

export default async function handler(req: any, res: any) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(buildErrorPage('Missing OAUTH_GITHUB_CLIENT_ID or OAUTH_GITHUB_CLIENT_SECRET.'));
    return;
  }

  const { code, state } = req.query || {};
  const cookies = parseCookies(req.headers.cookie);
  const expectedState = cookies.decap_oauth_state;
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/oauth/callback`;

  if (!code || !state || !expectedState || state !== expectedState) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(buildErrorPage('Invalid or missing OAuth state.'));
    return;
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'clube-arte-luta-v2',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state,
      redirect_uri: redirectUri,
    }),
  });

  const tokenPayload = await tokenResponse.json().catch(() => null);
  const token = tokenPayload?.access_token;

  if (!token) {
    console.error('[OAuth] GitHub token exchange failed', {
      status: tokenResponse.status,
      error: tokenPayload?.error,
      error_description: tokenPayload?.error_description,
      error_uri: tokenPayload?.error_uri,
      redirect_uri: redirectUri,
    });

    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(buildErrorPage(buildGitHubErrorMessage(tokenPayload, tokenResponse.status)));
    return;
  }

  const successMessage = `authorization:github:success:${JSON.stringify({
    token,
    provider: 'github',
  })}`;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Authorizing...</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #000;
        color: #fff;
        font-family: Inter, system-ui, sans-serif;
      }
    </style>
  </head>
  <body>
    <script>
      (function () {
        var message = ${JSON.stringify(successMessage)};
        var finished = false;

        if (!window.opener) {
          document.body.textContent = 'You can close this window.';
          return;
        }

        function finish(targetOrigin) {
          if (finished) return;
          finished = true;
          window.opener.postMessage(message, targetOrigin);
          window.close();
        }

        function receiveMessage(event) {
          window.removeEventListener('message', receiveMessage, false);
          finish(event.origin);
        }

        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', '*');

        setTimeout(function () {
          if (window.opener && !finished) {
            finish(window.location.origin);
          }
        }, 1500);
      })();
    </script>
  </body>
</html>`);
}
