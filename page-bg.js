/* 页面背景轮换驱动（背景层，与文章封面无关）
   只保留构图开阔、色调接近、不抢内容的 3 张背景 */
(function () {
  var nums = [3, 13, 19];
  var wrap = document.getElementById('page-bg');
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

  var i = 0;
  setInterval(function () {
    if (slides.length < 2) return;
    slides[i].classList.remove('show');
    i = (i + 1) % slides.length;
    slides[i].classList.add('show');
  }, 9000);
})();