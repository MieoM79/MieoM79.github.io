/* 页面背景轮换驱动（背景层，与文章封面无关）
   图以极低不透明度作为氛围底色，全站生效，不影响正文可读性 */
(function () {
  var nums = [2, 3, 4, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
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