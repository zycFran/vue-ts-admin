/**
 * 一直覆盖在当前地图视野的Canvas对象
 *
 * @author nikai (@胖嘟嘟的骨头, nikai@baidu.com)
 *
 * @param
 * {
 *     map 地图实例对象
 * }
 */

function CanvasLayer(options) {
  this.options = options || {};
  this.paneName = this.options.paneName || 'labelPane';
  this.zIndex = this.options.zIndex || 0;
  this._map = options.map;
  this._lastDrawTime = null;
  this.show();
}

CanvasLayer.prototype = new BMap.Overlay();

CanvasLayer.prototype.initialize = function (map) {
  this._map = map;
  const canvas = this.canvas = document.createElement('canvas');
  const ctx = this.ctx = this.canvas.getContext('2d');
  canvas.style.cssText = `${'position:absolute;' +
      'left:0;' +
      'top:0;' +
      'z-index:'}${this.zIndex};`;
  this.adjustSize();
  this.adjustRatio(ctx);
  map.getPanes()[this.paneName].appendChild(canvas);
  const that = this;
  map.addEventListener('resize', () => {
    that.adjustSize();
    that._draw();
  });
  return this.canvas;
};

CanvasLayer.prototype.adjustSize = function () {
  const size = this._map.getSize();
  const canvas = this.canvas;
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;
};

CanvasLayer.prototype.adjustRatio = function (ctx) {
  const backingStore = ctx.backingStorePixelRatio ||
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1;
  const pixelRatio = (window.devicePixelRatio || 1) / backingStore;
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  ctx.canvas.width = canvasWidth * pixelRatio;
  ctx.canvas.height = canvasHeight * pixelRatio;
  ctx.canvas.style.width = `${canvasWidth}px`;
  ctx.canvas.style.height = `${canvasHeight}px`;
  ctx.scale(pixelRatio, pixelRatio);
};

CanvasLayer.prototype.draw = function () {
  const self = this;
  const args = arguments;

  clearTimeout(self.timeoutID);
  self.timeoutID = setTimeout(() => {
    self._draw(...args);
  }, 15);
};

CanvasLayer.prototype._draw = function () {
  const map = this._map;
  this.canvas.style.left = `${-map.offsetX}px`;
  this.canvas.style.top = `${-map.offsetY}px`;
  this.dispatchEvent('draw');
  this.options.update && this.options.update.apply(this, arguments);
};

CanvasLayer.prototype.getContainer = function () {
  return this.canvas;
};

CanvasLayer.prototype.show = function () {
  if (!this.canvas) {
    this._map.addOverlay(this);
  }
  this.canvas.style.display = 'block';
};

CanvasLayer.prototype.hide = function () {
  this.canvas.style.display = 'none';
  // this._map.removeOverlay(this);
};

CanvasLayer.prototype.setZIndex = function (zIndex) {
  this.canvas.style.zIndex = zIndex;
};

CanvasLayer.prototype.getZIndex = function () {
  return this.zIndex;
};
