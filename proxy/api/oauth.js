// 仅允许来自本站后台的登录请求（防止被别处当作登录中转）
// 大小写不敏感（GitHub Pages 会把主机名规范化为小写），并限定域名边界防伪装后缀
const ALLOWED_ORIGIN_RE = /^https:\/\/mieom79\.github\.io(\/|$)/i;

function sourceAllowed(req) {
  const ref = String(req.headers['referer'] || req.headers['origin'] || '');
  // 没有来源信息时不拦截（避免浏览器策略差异误伤自己的登录）
  if (!ref) return true;
  return ALLOWED_ORIGIN_RE.test(ref);
}

export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = proto + '://' + host;
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!sourceAllowed(req)) {
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    return res.status(403).send('来源不被允许');
  }

  if (!clientId) {
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    return res.status(500).send('GITHUB_CLIENT_ID 未配置：请到 Vercel 项目 Settings → Environment Variables 添加后重新部署。');
  }

  const q = new URL(req.url, origin).searchParams;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: origin + '/api/oauth/callback',
    scope: q.get('scope') || 'repo',
    state: q.get('state') || '0',
  });
  return res.redirect(302, 'https://github.com/login/oauth/authorize?' + params.toString());
}