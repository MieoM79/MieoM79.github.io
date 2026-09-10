(function () {
  var covers = [
    '/images/cover-2.jpg',
    '/images/cover-3.jpg',
    '/images/cover-4.jpg',
    '/images/cover-6.jpg',
    '/images/cover-7.jpg',
    '/images/cover-8.jpg',
    '/images/cover-10.jpg',
    '/images/cover-11.jpg',
    '/images/cover-12.jpg',
    '/images/cover-13.jpg',
    '/images/cover-14.jpg'
  ];
  var h = document.getElementById('page-header');
  // 只在首页(有 #site-info 的登陆页)跑轮播，文章页不轮换
  if (!h || !document.getElementById('site-info')) return;
  // 先探测图片能否加载，后台删图后自动跳过，避免 404 黑块
  var ok = new Array(covers.length);
  var pending = covers.length;
  var started = false;
  covers.forEach(function (src, i) {
    var probe = new Image();
    probe.onload = function () { ok[i] = src; done(); };
    probe.onerror = function () { done(); };
    probe.src = src;
  });
  function done() {
    if (--pending || started) return;
    started = true;
    var slides = [];
    ok.forEach(function (src) {
      if (!src) return;
      var d = document.createElement('div');
      d.className = 'cover-slide';
      d.style.backgroundImage = 'url(' + src + ')';
      if (!slides.length) d.classList.add('show');
      h.insertBefore(d, h.firstChild);
      slides.push(d);
    });
    if (!slides.length) return;
    var idx = 0;
    setInterval(function () {
      slides[idx].classList.remove('show');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('show');
    }, 5000);
  }
})();
