(function () {
  var covers = [
    '/images/cover-1.jpg',
    '/images/cover-2.jpg',
    '/images/cover-3.jpg',
    '/images/cover-4.jpg',
    '/images/cover-5.jpg',
    '/images/cover-6.jpg',
    '/images/cover-7.jpg',
    '/images/cover-8.jpg',
    '/images/cover-9.jpg',
    '/images/cover-10.jpg',
    '/images/cover-11.jpg',
    '/images/cover-12.jpg',
    '/images/cover-13.jpg',
    '/images/cover-14.jpg'
  ];
  var h = document.getElementById('page-header');
  // 只在首页(有 #site-info 的登陆页)跑轮播，文章页不轮换
  if (!h || !document.getElementById('site-info')) return;
  var slides = [];
  covers.forEach(function (src, i) {
    var d = document.createElement('div');
    d.className = 'cover-slide';
    d.style.backgroundImage = 'url(' + src + ')';
    if (i === 0) d.classList.add('show');
    h.insertBefore(d, h.firstChild);
    slides.push(d);
  });
  var idx = 0;
  setInterval(function () {
    slides[idx].classList.remove('show');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('show');
  }, 5000);
})();
