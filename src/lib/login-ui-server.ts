import type { Server } from 'bun';

const DEFAULT_API_URL = 'https://whitebit.com';
const DEFAULT_PROFILE = 'default';

export interface LoginUIResult {
  profile: string;
  apiKey: string;
  apiSecret: string;
  apiUrl: string;
}

export interface LoginUIServerResult {
  promise: Promise<LoginUIResult>;
  server: Server<undefined>;
}

interface LoginUIServerDefaults {
  profile?: string;
  apiUrl?: string;
}

const getHTMLPage = (defaults: LoginUIServerDefaults): string => {
  const profile = defaults.profile ?? DEFAULT_PROFILE;
  const apiUrl = defaults.apiUrl ?? DEFAULT_API_URL;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WhiteBIT Login</title>
  <style>
    :root {
      color-scheme: light;
      --bg-a: #0f172a;
      --bg-b: #1e293b;
      --panel: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --border: #dbe2ea;
      --brand-a: #2563eb;
      --brand-b: #4f46e5;
      --danger-bg: #fee2e2;
      --danger-text: #991b1b;
      --ok-bg: #dcfce7;
      --ok-text: #166534;
    }

    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 20px;
      background: linear-gradient(140deg, var(--bg-a), var(--bg-b));
    }

    .panel {
      width: 100%;
      max-width: 440px;
      background: var(--panel);
      border-radius: 14px;
      border: 1px solid var(--border);
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.35);
      padding: 30px;
    }

    h1 {
      margin: 0;
      color: var(--text);
      font-size: 28px;
      letter-spacing: -0.02em;
      text-align: center;
    }

    .sub {
      margin: 8px 0 24px;
      text-align: center;
      color: var(--muted);
      font-size: 14px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: var(--text);
      font-size: 14px;
      font-weight: 600;
    }

    .field {
      margin-bottom: 16px;
    }

    input {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 11px 12px;
      font-size: 14px;
      outline: none;
    }

    input:focus {
      border-color: var(--brand-a);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    button {
      width: 100%;
      border: 0;
      border-radius: 8px;
      background: linear-gradient(120deg, var(--brand-a), var(--brand-b));
      color: white;
      padding: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.7;
      cursor: default;
    }

    #message {
      display: none;
      margin-top: 14px;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
    }

    #message.error {
      display: block;
      background: var(--danger-bg);
      color: var(--danger-text);
    }

    #message.success {
      display: block;
      background: var(--ok-bg);
      color: var(--ok-text);
    }
  </style>
</head>
<body>
  <div class="panel">
    <div>
      <h1>WhiteBIT</h1>
      <p class="sub">Enter your API credentials to continue</p>
    </div>

    <form id="loginForm">
      <div class="field">
        <label for="profile">Profile</label>
        <input
          type="text"
          id="profile"
          name="profile"
          value="${profile}"
          placeholder="default"
        />
      </div>

      <div class="field">
        <label for="apiKey">API Key *</label>
        <input
          type="text"
          id="apiKey"
          name="apiKey"
          required
          placeholder="Enter your API key"
        />
      </div>

      <div class="field">
        <label for="apiSecret">API Secret *</label>
        <input
          type="password"
          id="apiSecret"
          name="apiSecret"
          required
          placeholder="Enter your API secret"
        />
      </div>

      <div class="field">
        <label for="apiUrl">API URL</label>
        <input
          type="text"
          id="apiUrl"
          name="apiUrl"
          value="${apiUrl}"
          placeholder="https://whitebit.com"
        />
      </div>

      <button type="submit">
        Login
      </button>

      <div id="message"></div>
    </form>
  </div>
  
  <script>
    const form = document.getElementById('loginForm');
    const messageEl = document.getElementById('message');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    function showMessage(text, type) {
      messageEl.textContent = text;
      messageEl.className = type === 'success' ? 'success' : 'error';
    }

    function hideMessage() {
      messageEl.className = '';
    }
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMessage();
      
      const formData = new FormData(form);
      const profile = formData.get('profile').trim() || '${profile}';
      const apiKey = formData.get('apiKey').trim();
      const apiSecret = formData.get('apiSecret').trim();
      const apiUrl = formData.get('apiUrl').trim() || '${apiUrl}';
      
      if (!apiKey || !apiSecret) {
        showMessage('API key and secret are required', 'error');
        return;
      }
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';
      
      try {
        const response = await fetch('/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile,
            apiKey,
            apiSecret,
            apiUrl,
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          showMessage('Login successful! Closing window...', 'success');
          submitBtn.textContent = 'Success!';
          setTimeout(() => {
            window.close();
          }, 1500);
        } else {
          showMessage(data.error || 'Login failed', 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Login';
        }
      } catch (error) {
        showMessage('Network error: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      }
    });
  </script>
</body>
</html>`;
};

export const startLoginUIServer = (defaults: LoginUIServerDefaults = {}): LoginUIServerResult => {
  let server: Server<undefined>;
  let resolvePromise: (result: LoginUIResult) => void;
  let rejectPromise: (error: Error) => void;
  let hasResolved = false;

  const resultPromise = new Promise<LoginUIResult>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const cleanup = () => {
    if (server) {
      server.stop(true);
    }
    process.off('SIGINT', handleSigInt);
  };

  const handleSigInt = () => {
    cleanup();
    if (!hasResolved) {
      hasResolved = true;
      rejectPromise(new Error('Login UI server interrupted by user'));
    }
  };

  process.on('SIGINT', handleSigInt);

  server = Bun.serve({
    port: 0,
    hostname: '127.0.0.1',
    fetch(req): Response | Promise<Response> {
      const url = new URL(req.url);

      if (url.pathname === '/') {
        return new Response(getHTMLPage(defaults), {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      if (url.pathname === '/submit' && req.method === 'POST') {
        return req.json().then((body: unknown) => {
          const bodyData = body as Record<string, unknown>;
          if (
            !bodyData.apiKey ||
            typeof bodyData.apiKey !== 'string' ||
            bodyData.apiKey.trim().length === 0
          ) {
            return Response.json({
              success: false,
              error: 'API key is required',
            });
          }

          if (
            !bodyData.apiSecret ||
            typeof bodyData.apiSecret !== 'string' ||
            bodyData.apiSecret.trim().length === 0
          ) {
            return Response.json({
              success: false,
              error: 'API secret is required',
            });
          }

          if (hasResolved) {
            return Response.json({ success: true });
          }

          hasResolved = true;

          const result: LoginUIResult = {
            profile:
              (typeof bodyData.profile === 'string' && bodyData.profile) ||
              defaults.profile ||
              DEFAULT_PROFILE,
            apiKey: bodyData.apiKey.trim(),
            apiSecret: bodyData.apiSecret.trim(),
            apiUrl:
              (typeof bodyData.apiUrl === 'string' && bodyData.apiUrl) ||
              defaults.apiUrl ||
              DEFAULT_API_URL,
          };

          resolvePromise(result);

          setTimeout(() => {
            cleanup();
          }, 100);

          return Response.json({ success: true });
        });
      }

      return new Response('Not Found', { status: 404 });
    },
  });

  return { promise: resultPromise, server };
};
