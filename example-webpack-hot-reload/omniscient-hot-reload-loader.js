module.exports = function (src) {

  var reloadableComponentStr = "" + (function () {
    var c = reloadableComponent.apply(null, arguments);
    if (module.hot) {
      module.hot.accept(function (err) {
        if (err) console.error(err);
      });
      module.hot.dispose(function () {
        setTimeout(c.reload, 0);
      });
    }
    return c;
  });

  return src.replace(
    /module\.exports = component\(/g,
    'module.exports = ' + reloadableComponentStr + '(');
};
