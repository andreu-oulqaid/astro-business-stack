const express = require('express');
const axios = require('axios');
const app = express();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const AUTH_GATEWAY_URL = (process.env.AUTH_GATEWAY_URL || 'https://example.com').replace(/\/+$/, '');

// 1. Handle the initial Login Request
app.get('/api/auth', (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] Init Auth: Redirecting to GitHub`);
  const redirectUri = `${AUTH_GATEWAY_URL}/api/auth/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo,user&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(url);
});

// 2. Handle the Callback from GitHub
app.get('/api/auth/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    console.error('No code provided from GitHub');
    return res.status(400).send('Authentication failed: No code provided');
  }

  console.log(`[${new Date().toLocaleTimeString()}] Callback: Exchanging code for token`);

  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const accessToken = response.data.access_token;

    if (!accessToken) {
      throw new Error('No access token returned from GitHub');
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <body>
        <script>
          (function() {
            window.opener.postMessage("authorizing:github", "*");

            const responseData = {
              token: "${accessToken}",
              provider: "github"
            };

            const message = "authorization:github:success:" + JSON.stringify(responseData);
            window.opener.postMessage(message, "*");

            setTimeout(() => {
              window.close();
            }, 100);
          })();
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('OAuth Error:', err.response ? err.response.data : err.message);
    res.status(500).send('Login Failed during token exchange');
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`GATEWAY ONLINE - Listening on 0.0.0.0:${PORT}`);
});
