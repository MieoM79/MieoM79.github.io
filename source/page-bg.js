/* 页面背景轮换驱动（背景层，与文章封面无关）
   图片名单与浓淡/模糊/间隔由 /bg-config.json 提供
   → 来自后台「站点设置 → 背景壁纸」（source/_data/background.yml） */
(function () {
  var wrap = document.getElementById('page-bg');
  if (!wrap) return;

  var FALLBACK = {
    images: ['/images/cover-3.jpg', '/images/cover-13.jpg', '/images/cover-19.jpg'],
    opacity: 0.62,
    blur: 3,
    interval: 9
  };

  function num(v, d) {
    return typeof v === 'number' && isFinite(v) ? v : d;
  }

  function start(cfg) {
    cfg = cfg || {};
    var images = (cfg.images && cfg.images.length) ? cfg.images : FALLBACK.images;
    var opacity = Math.min(1, Math.max(0, num(cfg.opacity, FALLBACK.opacity)));
    var blur = Math.max(0, num(cfg.blur, FALLBACK.blur));
    var interval = Math.max(2, num(cfg.interval, FALLBACK.interval)) * 1000;
    var slides = [];

    images.forEach(function (src) {
      var probe = new Image();
      probe.onload = function () {
        var d = document.createElement('div');
        d.className = 'bg-slide';
        d.style.backgroundImage = 'url("' + src + '")';
        d.style.filter = 'blur(' + blur + 'px) saturate(0.95) brightness(0.95)';
        d.style.setProperty('--slide-opacity', opacity);
        wrap.appendChild(d);
        if (slides.length === 0) d.classList.add('show');
        slides.push(d);
      };
      probe.src = src;
    });

    var i = 0;
    setInterval(function () {
      if (slides.length < 2) return;
      slides[i % slides.length].classList.remove('show');
      i = (i + 1) % slides.length;
      slides[i].classList.add('show');
    }, interval);
  }

  fetch('/bg-config.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (cfg) { start(cfg); })
    .catch(function () { start(null); });
})();