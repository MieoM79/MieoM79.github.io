/* 把 source/_data/background.yml 输出为 /bg-config.json
   供前端背景层（page-bg.js）读取，实现"后台改配置 → 站点生效" */
hexo.extend.generator.register('bg_config', function (locals) {
  var data = (locals.data && locals.data.background) || {};

  var images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
  // 兼容 Decap 的图片列表（可能是字符串或对象）
  images = images.map(function (item) {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') return item.image || item.url || item.src || '';
    return '';
  }).filter(Boolean);

  var cfg = {
    images: images,
    opacity: typeof data.opacity === 'number' ? data.opacity : 0.62,
    blur: typeof data.blur === 'number' ? data.blur : 3,
    interval: typeof data.interval === 'number' ? data.interval : 9
  };

  return {
    path: 'bg-config.json',
    data: JSON.stringify(cfg),
    layout: false
  };
});