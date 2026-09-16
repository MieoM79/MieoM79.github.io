export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = proto + '://' + host;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const code = new URL(req.url, origin).searchParams.get('code');

  if (!code) {
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    return res.status(400).send('缺少 code 参数');
  }

  let data = {};
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    data = await tokenRes.json();
  } catch (e) {
    data = { error: 'network_error', error_description: String(e) };
  }

  const token = data.access_token || '';
  const ok = !!token;
  const payload = JSON.stringify({ token, provider: 'github' });
  const msg = ok
    ? 'authorization:github:success:' + payload
    : 'authorization:github:error:' + (data.error_description || data.error || '授权失败');

  const html =
    '<!DOCTYPE html><html lang="zh-CN"><body><script>' +
    '(function(){' +
    'var MSG = ' + JSON.stringify(msg) + ';' +
    'var echoHandler = function(e){' +
    '  if (e.data === "authorizing:github") {' +
    '    window.removeEventListener("message", echoHandler);' +
    '    if (window.opener) { window.opener.postMessage(MSG, "*"); }' +
    '    window.close();' +
    '  }' +
    '};' +
    'window.addEventListener("message", echoHandler);' +
    'if (window.opener) { window.opener.postMessage("authorizing:github", "*"); }' +
    '})();' +
    '<\/script>' +
    '<p>授权处理中，请稍候…若长时间无反应，请关闭窗口重试。</p></body></html>';

  res.setHeader('content-type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}