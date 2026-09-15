// 文章页 游览量 + 点赞（数据来自 oauth-proxy /api/counter）
// 特点：点赞可取消(toggle)、乐观更新、失败回滚、PV 延迟计数(停留/滚动才计入)、数字千分位格式化
(function () {
  var art = document.querySelector('article.md-text') || document.querySelector('main article');
  if (!art) return; // 只在文章页生效

  var API = 'https://oauth-proxy-tan.vercel.app/api/counter';
  var path = location.pathname;

  var box = document.createElement('div');
  box.id = 'visitor-stats';
  box.innerHTML =
    '<span class="vs-item" title="浏览量">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/></svg>' +
    '<b id="vs-pv">…</b>次浏览</span>' +
    '<button id="vs-like" class="vs-item" type="button" title="喜欢这篇">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.7-9.3-9C1.3 7.9 3 5 6 5c2 0 3.2 1 4 2.2h4c.8-1.2 2-2.2 4-2.2 3 0 4.7 2.9 3.3 6.5-1.8 4.3-9.3 9-9.3 9z" transform="scale(0.92) translate(1,1)"/></svg>' +
    '<b id="vs-like-n">…</b>喜欢</button>';
  art.insertAdjacentElement('afterend', box);

  var pvEl = document.getElementById('vs-pv');
  var likeNEl = document.getElementById('vs-like-n');
  var likeBtn = document.getElementById('vs-like');

  // 数字格式化：≥1000 显示 1.2k
  function fmt(n) {
    n = Number(n) || 0;
    if (n >= 1000) {
      var s = (n / 1000).toFixed(1).replace(/\.0$/, '');
      return s + 'k';
    }
    return String(n);
  }

  var liked = false;
  try { liked = localStorage.getItem('liked:' + path) === '1'; } catch (e) {}
  if (liked) likeBtn.classList.add('done');

  function post(action) {
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: path, action: action })
    }).then(function (r) { return r.ok ? r.json() : null; });
  }

  // 先读当前数
  fetch(API + '?key=' + encodeURIComponent(path))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d) { pvEl.textContent = '–'; likeNEl.textContent = '–'; return; }
      pvEl.textContent = fmt(d.pv);
      likeNEl.textContent = fmt(d.like);
    })
    .catch(function () { pvEl.textContent = '–'; likeNEl.textContent = '–'; });

  // 计一次浏览：延迟触发——页面可见停留 5 秒，或发生滚动/点击后立即计（同一会话只计一次）
  var counted = false;
  try { counted = sessionStorage.getItem('pv:' + path) === '1'; } catch (e) {}
  if (!counted) {
    var fired = false;
    var fire = function () {
      if (fired) return;
      fired = true;
      post('pv').then(function (d) { if (d && d.action === 'pv') pvEl.textContent = fmt(d.count); });
      try { sessionStorage.setItem('pv:' + path, '1'); } catch (e) {}
    };
    var delayed = setTimeout(fire, 5000);
    // 页面不可见时暂停计时，回到可见再重新计时
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { clearTimeout(delayed); }
      else if (!fired) { delayed = setTimeout(fire, 5000); }
    });
    window.addEventListener('scroll', fire, { passive: true });
    window.addEventListener('click', fire);
  }

  // 点赞 toggle：乐观更新 + 失败回滚
  var busy = false;
  likeBtn.addEventListener('click', function () {
    if (busy) return;
    busy = true;
    var prevShown = likeNEl.textContent;
    var oldCount = Number(likeNEl.textContent) || 0;
    // 乐观更新
    likeNEl.textContent = fmt(oldCount + (liked ? -1 : 1));
    var wasLiked = liked;
    likeBtn.classList.toggle('done', !wasLiked);

    post(wasLiked ? 'unlike' : 'like').then(function (d) {
      busy = false;
      if (!d) {
        // 失败回滚
        likeNEl.textContent = fmt(prevShown);
        likeBtn.classList.toggle('done', wasLiked);
        return;
      }
      likeNEl.textContent = fmt(d.count);
      liked = d.action === 'like';
      try {
        if (liked) localStorage.setItem('liked:' + path, '1');
        else localStorage.removeItem('liked:' + path);
      } catch (e) {}
    }).catch(function () {
      busy = false;
      likeNEl.textContent = fmt(prevShown);
      likeBtn.classList.toggle('done', wasLiked);
    });
  });
})();