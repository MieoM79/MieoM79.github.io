// 文章页 游览量 + 点赞（数据来自 oauth-proxy /api/counter）
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
      pvEl.textContent = d.pv;
      likeNEl.textContent = d.like;
    })
    .catch(function () { pvEl.textContent = '–'; likeNEl.textContent = '–'; });

  // 计一次浏览（同一会话只计一次）
  var counted = false;
  try { counted = sessionStorage.getItem('pv:' + path) === '1'; } catch (e) {}
  if (!counted) {
    post('pv').then(function (d) { if (d && d.action === 'pv') pvEl.textContent = d.count; });
    try { sessionStorage.setItem('pv:' + path, '1'); } catch (e) {}
  }

  likeBtn.addEventListener('click', function () {
    if (liked) return;
    post('like').then(function (d) {
      if (!d) return;
      likeNEl.textContent = d.count;
      liked = true;
      likeBtn.classList.add('done');
      try { localStorage.setItem('liked:' + path, '1'); } catch (e) {}
    });
  });
})();
