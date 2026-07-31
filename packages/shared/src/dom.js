function h(t, c, a) {
  const e = document.createElement(t);
  if (c) e.className = c;
  if (a) e.append(a);
  return e;
}

'div/td/tr/th/tbody/thead/tfoot/table/ol/ul/li/input/select/textarea/button/span/nav/dialog'
  .split('/')
  .forEach((v) => (window[v] = (c, a) => h(v, c, a)));

function option(v, a, s = false) {
  const e = h('option');
  if (v) e.value = v;
  if (a) e.textContent = a;
  e.selected = s;
  return e;
}

function checkbox(c, v) {
  const e = h('input', c);
  e.type = 'checkbox';
  e.checked = !!v;
  return e;
}

Node.prototype.on = function (n, e, o) {
  return (this.addEventListener(n, e, o), this);
};

Node.prototype.tap = function (f) {
  return (f(this), this);
};

HTMLElement.prototype.child = function (...a) {
  return (this.append(...a), this);
};

HTMLElement.prototype.attr = function (n, p) {
  return (this.setAttribute(n, p), this);
};

HTMLElement.prototype.css = function (s) {
  this.style.cssText = s;
  return this;
};
