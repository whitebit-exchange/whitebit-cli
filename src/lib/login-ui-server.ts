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
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#667eea',
            secondary: '#764ba2',
          }
        }
      }
    }
  </script>
</head>
<body class="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-primary to-secondary">
  <div class="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-primary tracking-tight">WhiteBIT</h1>
      <p class="text-slate-500 text-sm mt-2">Enter your API credentials to continue</p>
    </div>

    <form id="loginForm">
      <div class="mb-6">
        <label for="profile" class="block text-slate-700 text-sm font-semibold mb-2">Profile</label>
        <input
          type="text"
          id="profile"
          name="profile"
          value="${profile}"
          placeholder="default"
          class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-base transition-all bg-slate-50 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 placeholder-slate-400"
        />
      </div>

      <div class="mb-6">
        <label for="apiKey" class="block text-slate-700 text-sm font-semibold mb-2">API Key <span class="text-red-600">*</span></label>
        <input
          type="text"
          id="apiKey"
          name="apiKey"
          required
          placeholder="Enter your API key"
          class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-base transition-all bg-slate-50 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 placeholder-slate-400"
        />
      </div>

      <div class="mb-6">
        <label for="apiSecret" class="block text-slate-700 text-sm font-semibold mb-2">API Secret <span class="text-red-600">*</span></label>
        <input
          type="password"
          id="apiSecret"
          name="apiSecret"
          required
          placeholder="Enter your API secret"
          class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-base transition-all bg-slate-50 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 placeholder-slate-400"
        />
      </div>

      <div class="mb-6">
        <label for="apiUrl" class="block text-slate-700 text-sm font-semibold mb-2">API URL</label>
        <input
          type="text"
          id="apiUrl"
          name="apiUrl"
          value="${apiUrl}"
          placeholder="https://whitebit.com"
          class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-base transition-all bg-slate-50 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 placeholder-slate-400"
        />
      </div>

      <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg text-base transition-all shadow-lg shadow-primary/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/50 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
        Login
      </button>

      <div id="message" class="hidden mt-4 px-4 py-3 rounded-lg text-sm font-medium text-center"></div>
    </form>
  </div>
  
  <script>
    const form = document.getElementById('loginForm');
    const messageEl = document.getElementById('message');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    function showMessage(text, type) {
      messageEl.textContent = text;
      messageEl.classList.remove('hidden', 'bg-red-100', 'text-red-800', 'bg-green-100', 'text-green-800');
      if (type === 'error') {
        messageEl.classList.add('bg-red-100', 'text-red-800');
      } else if (type === 'success') {
        messageEl.classList.add('bg-green-100', 'text-green-800');
      }
    }

    function hideMessage() {
      messageEl.classList.add('hidden');
      messageEl.classList.remove('bg-red-100', 'text-red-800', 'bg-green-100', 'text-green-800');
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
