// 浏览量 + 点赞计数 API（Upstash Redis 存储）
// GET  /api/counter?key=/path/                  → { key, pv, like }
// GET  /api/counter?keys=/a/,/b/                → { items: [{key,pv,like},...] }  （批量，供首页卡片）
// POST /api/counter { key, action }             → { key, action, count }  action: 'pv' | 'like' | 'unlike'
module.exports = async (req, res) => {
  // CORS：GitHub Pages 会把 URL 主机名规范化为小写，浏览器 Origin 因此是小写域；
  // 这里按白名单大小写不敏感匹配并回显请求 Origin（硬编码大写域名会导致浏览器拒绝响应）
  const origin = req.headers.origin || '';
  const allowed =
    /^https:\/\/mieom79\.github\.io$/i.test(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // 兼容 Upstash 直连与 Vercel 官方 Redis(KV_*) 两种 REST 变量命名
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return res.status(500).json({ error: 'counter storage not configured' });
  }

  const auth = { Authorization: `Bearer ${token}` };
  const sanitize = (raw) => String(raw || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120) || 'unknown';

  // 简易限流：写操作 40 次/分钟/来源 IP，防刷
  if (req.method === 'POST') {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    const rlKey = `ctr:rl:${sanitize(ip)}`;
    try {
      const rl = await fetch(`${url}/incr/${encodeURIComponent(rlKey)}`, { headers: auth });
      const rlJ = await rl.json();
      if (parseInt(rlJ.result, 10) === 1) {
        await fetch(`${url}/expire/${encodeURIComponent(rlKey)}/60`, { headers: auth });
      } else if (parseInt(rlJ.result, 10) > 40) {
        return res.status(429).json({ error: 'too many requests' });
      }
    } catch (e) { /* 限流失败不阻断主流程 */ }
  }

  try {
    if (req.method === 'POST') {
      const key = sanitize(req.body && req.body.key);
      const action = req.body && req.body.action;

      if (action === 'unlike') {
        // 取消点赞：只有当前值 >0 才减，保证不小于 0
        const lua = "local v = tonumber(redis.call('GET', KEYS[1]) or '0'); if v > 0 then return redis.call('DECR', KEYS[1]) else return 0 end";
        const r = await fetch(`${url}/eval/${encodeURIComponent(lua)}/1/${encodeURIComponent(`ctr:like:${key}`)}`, { headers: auth });
        const j = await r.json();
        if (j.error) throw new Error(j.error);
        return res.status(200).json({ key, action: 'unlike', count: Number(j.result) });
      }

      const isLike = action === 'like';
      const counter = isLike ? `ctr:like:${key}` : `ctr:pv:${key}`;
      const r = await fetch(`${url}/incr/${encodeURIComponent(counter)}`, { headers: auth });
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      return res.status(200).json({ key, action: isLike ? 'like' : 'pv', count: Number(j.result) });
    }

    // GET：批量或单 key
    const keysParam = (req.query && req.query.keys) || '';
    if (keysParam) {
      const keys = keysParam.split(',').map(sanitize).filter((k, idx, arr) => k && arr.indexOf(k) === idx).slice(0, 50);
      if (keys.length > 0) {
        const restKeys = [];
        keys.forEach(k => { restKeys.push(`ctr:pv:${k}`, `ctr:like:${k}`); });
        const r = await fetch(`${url}/mget/${restKeys.map(k => encodeURIComponent(k)).join('/')}`, { headers: auth });
        const j = await r.json();
        if (j.error) throw new Error(j.error);
        const arr = j.result || [];
        const items = keys.map((k, i) => ({ key: k, pv: Number(arr[i * 2]) || 0, like: Number(arr[i * 2 + 1]) || 0 }));
        return res.status(200).json({ items });
      }
    }

    const raw = ((req.query && req.query.key) || '');
    const key = sanitize(raw);
    const r = await fetch(`${url}/mget/${encodeURIComponent(`ctr:pv:${key}`)}/${encodeURIComponent(`ctr:like:${key}`)}`, { headers: auth });
    const j = await r.json();
    if (j.error) throw new Error(j.error);
    const [pv, like] = (j.result || []).map(v => Number(v) || 0);
    return res.status(200).json({ key, pv, like });
  } catch (e) {
    return res.status(502).json({ error: 'storage unavailable' });
  }
};