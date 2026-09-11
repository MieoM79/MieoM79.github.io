/* 首页全屏轮换背景驱动（Stellar 版）*/
(function () {
  // 当前存在的封面编号（1/5/9 曾在后台被删除）
  var nums = [2, 3, 4, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  // 只在首页运行
  if (document.body.getAttribute('data-page-type') !== 'index') return;
  var wrap = document.getElementById('bg-covers');
  if (!wrap) return;

  var slides = [];
  nums.forEach(function (n) {
    var img = new Image();
    img.onload = function () {
      var d = document.createElement('div');
      d.className = 'bg-slide';
      d.style.backgroundImage = 'url(/images/cover-' + n + '.jpg)';
      wrap.appendChild(d);
      if (slides.length === 0) d.classList.add('show');
      slides.push(d);
    };
    img.src = '/images/cover-' + n + '.jpg';
  });

  wrap.hidden = false;

  var i = 0;
  setInterval(function () {
    if (slides.length < 2) return;
    slides[i].classList.remove('show');
    i = (i + 1) % slides.length;
    slides[i].classList.add('show');
  }, 5000);
})();