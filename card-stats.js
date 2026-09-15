// 首页文章卡片：批量显示 浏览/喜欢 热度（数据来自 oauth-proxy /api/counter 批量接口）
(function () {
  var API = 'https://oauth-proxy-tan.vercel.app/api/counter';
  var cards = document.querySelectorAll('a.post-card[href]');
  if (!cards.length) return;

  // 与后端一致的 key 清洗规则（后端 sanitize）
  function sanitize(raw) {
    return String(raw).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
  }

  // 收集卡片 key → 卡片元素列表
  var map = {};   // sanitizedKey -> [a, ...]
  var paths = []; // 原始 path 列表
  cards.forEach(function (a) {
    var p = a.getAttribute('href');
    if (!p || p.charAt(0) !== '/') return;
    var key = sanitize(p);
    if (!key) return;
    if (!map[key]) { map[key] = []; paths.push(p); }
    map[key].push(a);
  });
  if (!paths.length) return;

  function fmt(n) {
    n = Number(n) || 0;
    if (n >= 1000) {
      var s = (n / 1000).toFixed(1).replace(/\.0$/, '');
      return s + 'k';
    }
    return String(n);
  }

  function apply(key, pv, like) {
    var list = map[key];
    if (!list) return;
    list.forEach(function (a) {
      if (a.querySelector('.card-stats')) return;
      var meta = a.querySelector('.meta') || a.querySelector('.md-text');
      if (!meta) return;
      var s = document.createElement('span');
      s.className = 'card-stats';
      s.textContent = fmt(pv) + ' 浏览 · ' + fmt(like) + ' 喜欢';
      meta.appendChild(s);
    });
  }

  // 分段批量请求（每批 50 个 key）
  var i = 0;
  function next() {
    var chunk = paths.slice(i, i + 50);
    if (!chunk.length) return;
    i += 50;
    fetch(API + '?keys=' + chunk.map(encodeURIComponent).join(','))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.items) {
          d.items.forEach(function (it) { if (it) apply(it.key, it.pv, it.like); });
        }
      })
      .catch(function () { /* 静默失败，不显示热度 */ })
      .then(function () { if (i < paths.length) next(); });
  }
  next();
})();