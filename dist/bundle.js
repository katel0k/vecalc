/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

class VectorMathTypeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VectorMathTypeError';
  }
}
module.exports.VectorMathTypeError = VectorMathTypeError;
class VectorMathError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VectorMathError';
  }
}
module.exports.VectorMathError = VectorMathError;
class VectorMathBracketSequenceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VectorMathBracketSequenceError';
  }
}
module.exports.VectorMathBracketSequenceError = VectorMathBracketSequenceError;
function Num(value) {
  this.value = value;
  this.calc = function () {
    if (typeof this.value == 'number') return this.value;
    let matched = this.value.match(/v(\d+)(s?[xy]|abs|angle)/i);
    if (matched != null) return vectors[Number(matched[1]) - 1][matched[2]].calc();
    if (value == 'pi') return Math.PI;
    return Number(this.value);
  };
}
module.exports.Num = Num;
function calcBracket(arr) {
  // reduces situations like +-Num
  let tmpArr = [];
  Object.defineProperty(tmpArr, 'last', {
    get() {
      return this[this.length - 1];
    }
  });
  arr = arr.reduce((a, b, i) => {
    if (b instanceof Action) {
      if (a.last instanceof Action) {
        if ([a.last, b].every(a => [unarPlus, plus, unarMinus, minus].includes(a))) {
          if ([[unarPlus, plus], [unarMinus, minus]].some(arr => [a.last, b].every(c => arr.insludes(c)))) a.push(unarPlus);else a.push(unarMinus);
        }
      } else if (i == 0) a.push(b == minus ? unarMinus : unarPlus);else a.push(b);
    } else a.push(b);
    return a;
  }, tmpArr);
  arr = arr.map(a => [Brackets, Root, ComplexDiv, Pow].some(b => a instanceof b) ? a.calc() : a);
  if (arr.filter(a => a instanceof Vector || a instanceof Num || a instanceof Brackets).length != arr.filter(a => a instanceof Action && !a.unary).length + 1) throw new VectorMathError('Неверное кол-во действий');
  let findMxByPriority = a => a.indexOf(a.reduce((a, b) => b instanceof Action && b.priority > a.priority ? b : a, {
    priority: 0
  }));
  while (arr.length > 1) {
    let index = findMxByPriority(arr);
    if (!arr[index].unary) arr.splice(index - 1, 3, arr[index].calc(arr[index - 1].calc(), arr[index + 1].calc()));else if (arr[index].unary) arr.splice(index, 2, arr[index].calc(arr[index + 1].calc()));
  }
  return arr[0];
}
class Formule extends Array {
  constructor(content = [new Num(0)]) {
    if (content.length != 1) super(...content);else {
      super();
      this[0] = content[0];
    }
  }
  calc() {
    let arr = [];
    for (let i = 0; i < this.length; i++) {
      arr.push(this[i]);
    }
    return calcBracket(arr);
  }
  static get [Symbol.species]() {
    return Array;
  }
}
module.exports.Formule = Formule;
class Brackets extends Array {
  constructor(content = [new Num(0)], closed = true) {
    super(...content);
    this.closed = closed;
  }
  calc() {
    if (!this.closed) throw new VectorMathBracketSequenceError('Скобка не закрыта');
    let arr = [];
    for (let i = 0; i < this.length; i++) arr.push(this[i]);
    return calcBracket(arr);
  }
  static get [Symbol.species]() {
    return Array;
  }
}
module.exports.Brackets = Brackets;
function ComplexDiv(tp = [], bp = []) {
  this.tp = new Formule(tp);
  this.bp = new Formule(bp);
  this.calc = function () {
    let bpCalced = this.bp.calc(),
      tpCalced = this.tp.calc();
    if (bpCalced instanceof Vector || tpCalced instanceof Vector) throw new VectorMathTypeError('В делении не совпадают типы');
    if (bpCalced instanceof Num && bpCalced.value == 0) throw new VectorMathError('Нельзя делить на ноль!');
    return new Num(tpCalced.calc() / bpCalced.calc());
  };
}
module.exports.ComplexDiv = ComplexDiv;
function Root(content = []) {
  this.content = new Formule(content);
  this.calc = function () {
    let contentCalced = this.content.calc();
    if (!(contentCalced instanceof Num)) throw new VectorMathTypeError('Под корнем должно быть число');
    return new Num(Math.pow(contentCalced.calc(), 0.5));
  };
}
module.exports.Root = Root;
function Pow(basis = [], power = []) {
  this.power = new Formule(power);
  this.basis = new Formule(basis);
  this.calc = function () {
    let powerCalced = this.power.calc();
    let basisCalced = this.basis.calc();
    if (basisCalced instanceof Vector) throw new VectorMathTypeError('Нельзя возводить вектор в степень');else if (powerCalced instanceof Vector) throw new VectorMathTypeError('Нельзя возводить число в степень вектора');
    return new Num(Math.pow(basisCalced.calc(), powerCalced.calc()));
  };
}
module.exports.Pow = Pow;
function getColor() {
  let colors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#bdc3c7', '#000'];
  return colors[Math.floor(Math.random() * (colors.length - 1))];
}
let proxyCollection = new Map();
function createProxy(target, handler, revocable = false) {
  let proxy = new Proxy(target, handler);
  proxyCollection.set(proxy, target);
  return proxy;
}

/**
 * class Vect
 * @param {Formule}  options.vx         [description]
 * @param {Formule}  options.vy         [description]
 * @param {Formule}  options.sx         [description]
 * @param {Formule}  options.sy         [description]
 * @param {Formule}  options.formule    [description]
 * @param {Boolean}   options.calc       [description]
 * @param {Formule}  options.abs        [description]
 * @param {Formule}  options.angle      [description]
 * @param {string}    options.color      [description]
 * @param {Boolean}   options.rad        [description]
 * @param {Boolean}   options.locked     [description]
 * @param {Number}    options.mode       0: orts mode 1: abs and angle mode 2: formule mode
 * @param {...[type]} options.options	} [description]
 */
function Vect({
  vx = new Formule(),
  vy = new Formule(),
  sx = new Formule(),
  sy = new Formule(),
  formule = new Formule(),
  abs = new Formule(),
  angle = new Formule(),
  color = getColor(),
  rad = true,
  locked = false,
  mode = 1,
  calc = true,
  index = -1,
  ...options
} = {}) {
  /*[{vx: new Formule(), vy: new Formule(), abs: new Formule(),
  		angle: new Formule(), sx: new Formule(), sy: new Formule(), __proto__: Vect}]*/
  let tmp;
  if (mode & 1) tmp = {
    vx: vx.calc(),
    vy: vy.calc()
  };else if (mode & 2) tmp = {
    abs: abs.calc(),
    angle: angle.calc()
  };else if (mode & 4) {
    if (calc) {
      let v;
      if (formule) v = formule.calc();else v = new Formule([Vect()]);
      tmp = {
        vx: v.vx,
        vy: v.vy,
        abs: v.abs,
        angle: v.angle
      };
      sx = v.sx;
      sy = v.sy;
    } else tmp = {
      vx,
      vy,
      abs,
      angle
    };
  }
  let res = {
    rad,
    color,
    locked,
    get mode() {
      return mode;
    },
    set mode(value) {
      if (value & 1) {
        vx = new Formule([this.vx]);
        vy = new Formule([this.vy]);
        try {
          tmp = {
            vx: vx.calc()
          };
        } catch (e) {
          errors.set({
            index,
            pl: 'vx'
          }, e);
        }
        try {
          tmp.vy = vy.calc();
        } catch (e) {
          errors.set({
            index,
            pl: 'vy'
          }, e);
        }
      } else if (value & 2) {
        abs = new Formule([this.abs]);
        angle = new Formule([this.angle]);
        try {
          tmp = {
            abs: abs.calc()
          };
        } catch (e) {
          errors.set({
            index,
            pl: 'abs'
          }, e);
        }
        try {
          tmp.angle = angle.calc();
        } catch (e) {
          errors.set({
            index,
            pl: 'angle'
          }, e);
        }
      } else if (value & 4) {
        let v;
        try {
          v = formule.calc();
          if (!v || !(v instanceof Vector)) throw new VectorMathTypeError('В формуле должен получаться вектор');
          tmp = {
            vx: v.vx,
            vy: v.vy,
            abs: v.abs,
            angle: v.angle
          };
          sx = new Formule([new Num(v.sx.calc())]);
          sy = new Formule([new Num(v.sy.calc())]);
        } catch (e) {
          errors.set({
            index,
            pl: 'formule'
          }, e);
        }
      }
      mode = value;
    },
    get sx() {
      return sx.calc();
    },
    set sx(value) {
      sx = value;
    },
    get sy() {
      return sy.calc();
    },
    set sy(value) {
      sy = value;
    },
    get vx() {
      if (mode & 1) return vx.calc();
      if (mode & 2) return new Num(tmp.abs.calc() * Math.cos(tmp.angle.calc()));
      if (mode & 4) return tmp.vx;
    },
    set vx(value) {
      if (mode & 1) {
        try {
          tmp.vx = value.calc();
        } catch (e) {
          errors.set({
            index,
            pl: 'vx'
          }, e);
        }
        vx = value;
      }
    },
    get vy() {
      if (mode & 1) return vy.calc();
      if (mode & 2) return new Num(tmp.abs.calc() * Math.sin(tmp.angle.calc()));
      if (mode & 4) return tmp.vy;
    },
    set vy(value) {
      if (mode & 1) {
        try {
          tmp.vy = value.calc();
        } catch (e) {
          errors.set({
            index,
            pl: 'vy'
          }, e);
        }
        vy = value;
      }
    },
    get abs() {
      if (mode & 1) {
        let x = tmp.vx.calc(),
          y = tmp.vy.calc();
        return new Num(Math.sqrt(x ** 2 + y ** 2));
      }
      if (mode & 2) return abs.calc();
      if (mode & 4) return tmp.abs;
    },
    set abs(value) {
      if (mode & 2) {
        try {
          tmp.abs = value.calc();
        } catch (e) {
          errors.set({
            index,
            pl: 'abs'
          }, e);
        }
        abs = value;
      }
    },
    get angle() {
      let res;
      if (mode & 1) res = new Num(Math.atan2(tmp.vy.calc(), tmp.vx.calc()));
      if (mode & 2) res = angle.calc();
      if (mode & 4) res = tmp.angle;
      return res;
    },
    set angle(value) {
      if (mode & 2) {
        try {
          tmp.angle = value.calc();
        } catch (e) {
          errors.set({
            index,
            pl: 'angle'
          }, e);
        }
        angle = value;
      }
    },
    get formule() {
      return formule;
    },
    set formule(value) {
      tmp.formule = formule = value;
      let v;
      try {
        v = value.calc();
        if (!v || !(v instanceof Vector)) throw new VectorMathTypeError('В формуле должен получаться вектор');
        tmp = {
          vx: v.vx,
          vy: v.vy,
          abs: v.abs,
          angle: v.angle
        };
        sx = new Formule([new Num(v.sx.calc())]);
        sy = new Formule([new Num(v.sy.calc())]);
      } catch (e) {
        errors.set({
          index,
          pl: 'formule'
        }, e);
      }
    },
    get sx_f() {
      return sx;
    },
    get sy_f() {
      return sy;
    },
    get vx_f() {
      return mode & 1 ? vx : this.vx;
    },
    get vy_f() {
      return mode & 1 ? vy : this.vy;
    },
    get abs_f() {
      return mode & 2 ? abs : this.abs;
    },
    get angle_f() {
      return mode & 2 ? angle : this.angle;
    },
    get formule_f() {
      return formule;
    },
    calc() {
      return this;
    },
    numMultip(num) {
      return new Vector({
        formule: new Formule([this, mul, new Num(num)]),
        mode: 4,
        vx: new Num(this.vx.calc() * num),
        vy: new Num(this.vy.calc() * num),
        sx: new Formule([new Num(this.sx)]),
        sy: new Formule([new Num(this.sy)]),
        abs: new Num(this.abs.calc() * num),
        angle: this.angle,
        calc: false
      });
    },
    toString() {
      return '';
    },
    tmp,
    color,
    __proto__: Vect
  };
  document.addEventListener('vectorMathChange', function (e) {
    if (!locked && e.detail && e.detail.index != index) {
      tmp = {};
      if (mode & 1) {
        try {
          tmp.vx = vx.calc();
        } catch (e) {
          errors.set({
            index,
            pl: 'vx'
          }, e);
        }
        try {
          tmp.vy = vy.calc();
        } catch (e) {
          errors.set({
            index,
            pl: 'vy'
          }, e);
        }
      } else if (mode & 2) {
        try {
          tmp.abs = abs.calc();
        } catch (e) {
          errors.set({
            index,
            pl: 'abs'
          }, e);
        }
        try {
          tmp.angle = angle.calc();
        } catch (e) {
          errors.set({
            index,
            pl: 'angle'
          }, e);
        }
      } else if (mode & 4) {
        let v;
        try {
          v = formule.calc();
          if (!v || !(v instanceof Vector)) throw new VectorMathTypeError('В формуле должен получаться вектор');
          tmp = {
            vx: v.vx,
            vy: v.vy,
            abs: v.abs,
            angle: v.angle
          };
          sx = new Formule([new Num(v.sx.calc())]);
          sy = new Formule([new Num(v.sy.calc())]);
        } catch (e) {
          errors.set({
            index,
            pl: 'formule'
          }, e);
        }
      }
    }
  });
  return res;
}
Object.defineProperty(Vect, Symbol.hasInstance, {
  value(obj) {
    if (proxyCollection.has(obj)) obj = proxyCollection.get(obj);
    return obj.__proto__ == Vect;
  }
});
function Vector() {
  let index = arguments[0].index;
  return createProxy(new Vect(...arguments), {
    set(target, param, value) {
      Reflect.set(...arguments);
      if (/[vs][xy]|formule|abs|angle|mode|rad/.test(param)) if (!target.locked) document.dispatchEvent(new CustomEvent('vectorMathChange', {
        detail: {
          index
        }
      }));
    }
  });
}
Object.defineProperty(Vector, Symbol.hasInstance, {
  value: obj => obj instanceof Vect
});
module.exports.Vector = Vector;
function Action(calc, priority, unary = false) {
  this.calc = calc;
  this.priority = priority;
  this.unary = unary;
}
let plus = new Action((a, b) => {
    if (typeof a == 'number' && typeof b == 'number') return new Num(a + b);
    if (a instanceof Vector && b instanceof Vector) {
      let avx = a.vx.calc(),
        bvx = b.vx.calc(),
        avy = a.vy.calc(),
        bvy = b.vy.calc();
      return new Vector({
        vx: new Num(avx + bvx),
        vy: new Num(avy + bvy),
        sx: a.sx,
        sy: a.sy,
        abs: new Num(Math.sqrt(Math.pow(avx + bvx, 2) + Math.pow(avy + bvy, 2))),
        angle: new Num(avx + bvx != 0 ? Math.atan2(avy + bvy, avx + bvx) : Math.PI / 2 * Math.sign(avy + bvy)),
        formule: new Formule([a, plus, b]),
        mode: 4,
        calc: false
      });
    }
    throw new VectorMathTypeError('В сложении не совпадают типы');
  }, 3),
  minus = new Action((a, b) => {
    if (typeof a == 'number' && typeof b == 'number') return new Num(a - b);
    if (a instanceof Vector && b instanceof Vector) {
      let avx = a.vx.calc(),
        bvx = b.vx.calc(),
        avy = a.vy.calc(),
        bvy = b.vy.calc();
      return new Vector({
        vx: new Num(avx - bvx),
        vy: new Num(avy - bvy),
        sx: a.sx,
        sy: a.sy,
        abs: new Num(Math.sqrt(Math.pow(avx - bvx, 2) + Math.pow(avy - bvy, 2))),
        angle: new Num(avx - bvx != 0 ? Math.atan2(avy - bvy, avx - bvx) : Math.PI / 2 * Math.sign(avy - bvy)),
        formule: new Formule([a, plus, b]),
        mode: 4,
        calc: false
      });
    }
    throw new VectorMathTypeError('В вычитании не совпадают типы');
  }, 3),
  mul = new Action((a, b) => {
    if (typeof a == 'number' && typeof b == 'number') return new Num(a * b);
    if (typeof a == 'number' && b instanceof Vector) return b.numMultip(a);
    if (typeof b == 'number' && a instanceof Vector) return a.numMultip(b);
  }, 4),
  div = new Action((a, b) => {
    if (typeof a == 'number' && typeof b == 'number') {
      if (b == 0) throw new VectorMathError('Нельзя делить на 0');
      return new Num(a / b);
    }
    throw new VectorMathTypeError('В делении не совпадают типы');
  }, 4),
  scMultip = new Action((a, b) => {
    if (typeof a == 'number' || typeof b == 'number') throw new VectorMathTypeError('В скалярном произведении не совпадают типы');
    return new Num(a.abs.calc() * b.abs.calc() * Math.cos(a.angle.calc() * b.angle.calc()));
  });
unarMinus = new Action(a => {
  if (typeof a == 'number') return new Num(-a);else if (a instanceof Vector) return a.numMultip(-1);
}, 6, true), unarPlus = new Action(a => a, 6, true);
function funcAction(func) {
  this.priority = 7;
  this.calc = function (a) {
    if (!(typeof a == 'number')) throw new VectorMathTypeError('Нельзя подставлять в тригонометрические функции вектора');
    return new Num(func(a));
  };
  this.unary = true;
}
let sin = new funcAction(Math.sin),
  cos = new funcAction(Math.cos),
  tan = new funcAction(Math.tan);
let vectors = [];
module.exports.newVector = function () {
  vectors.push(new Vector({
    index: vectors.length
  }));
  document.dispatchEvent(new CustomEvent('vectorMathChange'));
};
module.exports.pushVector = function (vector = new Vector()) {
  vectors.push(vector);
  document.dispatchEvent(new CustomEvent('vectorMathChange'));
};
module.exports.deleteVector = function (i) {
  vectors.splice(i, 1);
  document.dispatchEvent(new CustomEvent(`vector${i}Deleted`));
  document.dispatchEvent(new CustomEvent(`vectorDeleted`));
  document.dispatchEvent(new CustomEvent('vectorMathChange'));
};
module.exports.changeVector = function (i, param, value) {
  vectors[i][param] = value;
};
module.exports.getVectorsList = () => vectors.slice();
let errors = new Map();
module.exports.errors = errors;
module.exports.makeErrProxy = function (callback) {
  errors.set = function () {
    Map.prototype.set.call(this, ...arguments);
    callback(...arguments);
  };
};
let obj = {
  plus,
  minus,
  mul,
  div,
  sin,
  cos,
  tan
};
for (let key in obj) module.exports[key] = obj[key];

/***/ }),
/* 2 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const VM = __webpack_require__(1),
  emmet = __webpack_require__(3),
  SVGE = __webpack_require__(4);
function convertHTE(DOM) {
  class Arr extends Array {
    get last() {
      return this[this.length - 1];
    }
    set last(value) {
      this[this.length - 1] = value;
    }
  }
  if (DOM.children.length == 0 || DOM.children.length == 1 && DOM.children[0] == cursor) return new VM.Formule();
  return new VM.Formule(function req(DOM) {
    let arr = new Arr(),
      bracketsOpened = new Arr();
    push = Array.prototype.push;
    arr.push = function (item) {
      let l = bracketsOpened.last;
      if (item == '(') {
        let bracket = new VM.Brackets([], false);
        if (l && !l.closed) l.push(bracket);else push.call(arr, bracket);
        bracketsOpened.push(bracket);
      } else {
        if (l && !l.closed) {
          if (item == ')') {
            l.closed = true;
            bracketsOpened.splice(l.length - 1, 1);
          } else l.push(item);
        } else push.call(arr, item);
      }
    };
    return [].reduce.call(DOM.children, function (a, b) {
      if (b.classList.contains('fi__num')) {
        if (a.last instanceof VM.Num) a.last = new VM.Num(a.last.value + b.innerText);else a.push(new VM.Num(b.innerText));
      } else if (b.classList.contains('fi__pi')) a.push(new VM.Num('pi'));else if (b.classList.contains('fi__act')) switch (b.innerText) {
        case '+':
          a.push(VM.plus);
          break;
        case '/':
          a.push(VM.div);
          break;
        case '-':
          a.push(VM.minus);
          break;
        case '*':
          a.push(VM.mul);
          break;
        case ',':
          a.push(VM.scMultip);
          break;
      } else if (b.classList.contains('fi__sup')) a.splice(a.length - 1, 1, new VM.Pow([a.last], req(b)));else if (b.classList.contains('fi__div')) a.push(new VM.ComplexDiv(req(b.children[0]), req(b.children[2])));else if (b.classList.contains('fi__root')) a.push(new VM.Root(req(b.children[2])));else if (b.classList.contains('fi__vect')) {
        let index;
        if (b.classList.contains('fi__vect-angle')) {
          index = [].reduce.call(b.children[2].children, (a, b) => a * 10 + Number(b.innerText), 0);
          a.push(new VM.Num(`v${index}angle`));
        } else {
          index = [].reduce.call(b.children[1].children, (a, b) => a * 10 + Number(b.innerText), 0);
          if (b.classList.contains('fi__vect-abs')) a.push(new VM.Num(`v${index}abs`));else a.push(VM.getVectorsList()[index - 1]);
        }
      } else if (b.classList.contains('fi__block')) a.push(new VM.Formule(req(b)));else if (b.classList.contains('fi__func-act')) switch (b.innerText) {
        case 'sin':
          a.push(VM.sin);
          break;
        case 'cos':
          a.push(VM.cos);
          break;
        case 'tan':
          a.push(VM.tan);
          break;
      } else if (b.classList.contains('fi__brackets-svg')) a.push(b.open ? '(' : ')');
      return a;
    }, arr);
  }(DOM));
}
function convertETH(Exp) {
  if (Exp) return function req(Exp) {
    let df = document.createDocumentFragment();
    if (Exp instanceof Array || Exp instanceof VM.Formule) df.append(...Exp.map(req));
    if (Exp instanceof VM.Num) df.append(buildNumHTML(Exp));
    if (Exp instanceof VM.Brackets) df.append(buildClosedBracketsHTML(Exp.content));
    if (Exp instanceof VM.Root) df.append(buildRootHTML(Exp.content));
    if (Exp instanceof VM.ComplexDiv) df.append(buildComplexDivHTML(Exp.tp, Exp.bp));
    if (Exp instanceof VM.Pow) df.append(req(Exp.basis), buildPowHTML(Exp.power));
    if (Exp == VM.mul) df.append(buildActionHTML('*'));
    if (Exp == VM.minus || Exp == VM.unarMinus) df.append(buildActionHTML('-'));
    if (Exp == VM.plus || Exp == VM.unarPlus) df.append(buildActionHTML('+'));
    if (Exp == VM.scMultip) df.append(buildActionHTML(','));
    if (Exp == VM.div) df.append(buildActionHTML('/'));
    if (Exp == VM.sin) df.append(buildFuncActionHTML('sin'));
    if (Exp == VM.cos) df.append(buildFuncActionHTML('cos'));
    if (Exp == VM.tan) df.append(buildFuncActionHTML('tan'));
    if (Exp instanceof VM.Vector) df.append(buildFullVectorHTML(VM.getVectorsList().indexOf(Exp) + 1 + ''));
    return df;
  }(Exp);
  return document.createDocumentFragment();
}
function makeSVG(func) {
  return Object.assign(func(), {
    update() {
      this.replaceWith(makeSVG(func));
    }
  });
}
function buildNumHTML(n) {
  let v = n.value.toString(),
    df = document.createDocumentFragment(),
    elem;
  if (/pi/i.test(v)) {
    let elem = emmet(`img.fi__pi[height="${20}"]`);
    elem.src = './Pi.svg';
    df.append(elem);
    return df;
  }
  if (/^-?[\d.]+$/.test(v)) df.append(...v.split('').map(a => emmet(`span.fi__num{${a}}`)));else if (/e-/i.test(v)) df.append(emmet('span.fi__num{0}'));else {
    let m;
    if (m = v.match(/v(\d+)(abs)/i)) {
      let vectBlock = buildBlockHTML(['fi__vect-abs', 'fi__vect']);
      vectBlock.append(emmet(`span.fi__vect-span{V}`), buildIndexHTML(m[1]));
      df.append(vectBlock);
    } else if (m = v.match(/v(\d+)(angle)/i)) {
      let vectBlock = buildBlockHTML(['fi__vect-angle', 'fi__vect']);
      let index = buildIndexHTML(m[1]);
      vectBlock.append(makeSVG(), emmet(`span.fi__vect-span{V}`), index);
      function makeSVG() {
        let svg = new SVGE('svg', {
          viewBox: '0 0 21 21',
          class: 'fi__vect-angle-svg'
        });
        svg.append('polyline', {
          points: '21, 0, 0, 21, 21, 21',
          'stroke-width': 2,
          stroke: 'white',
          fill: 'none'
        });
        return svg.elem;
      }
      df.append(vectBlock);
    } else if (m = v.match(/v(\d+)([xy])/i)) {
      let index = document.createDocumentFragment();
      index.append(emmet(`span.fi__num{${m[1]}}`), buildIndexHTML(m[2]));
      df.append(buildVectorHTML(index));
    }
    // building projections abs angles
  }
  return df;
}
function num(n) {
  let df = buildNumHTML(n);
  cursor.move(df);
  return df;
}
function buildVectorHTML(i) {
  let vect = buildBlockHTML(['fi__vect']);
  vect.append(emmet('span.fi__vect-span{V}'), buildIndexHTML(i));
  return vect;
}
function buildFullVectorHTML(index) {
  let vect = buildVectorHTML(index);
  function makeSVG() {
    let mid = 5;
    let svg = new SVGE('svg', {
      viewBox: `0 0 20 ${mid * 2 + 1}`,
      class: 'fi__vect-svg'
    });
    svg.append('line', {
      x1: 0,
      y1: mid + 1,
      x2: 20,
      y2: mid + 1,
      'stroke-width': 2,
      stroke: 'white'
    });
    svg.append('polyline', {
      points: `${20 - mid - 3}, 1, 20, ${mid + 1}, ${20 - mid - 3}, ${mid * 2 + 1}`,
      stroke: 'white',
      fill: 'transparent',
      'stroke-width': 1.5
    });
    return svg.elem;
  }
  vect.append(makeSVG()); //emmet('i.fas.fa-long-arrow-alt-right')
  return vect;
}
function vector(index) {
  let df = document.createDocumentFragment();
  df.append(buildFullVectorHTML(`${Number(index.match(/\d+/)[0]) + 1}`));
  cursor.move(df);
  return df;
}
buildActionHTML = act => emmet(`span.fi__act{${act}}`);
function action(act) {
  let df = document.createDocumentFragment();
  df.append(buildActionHTML(act));
  cursor.move(df);
  return df;
}
function buildClosedBracketsHTML(content) {
  let df = document.createDocumentFragment();
  df.append(buildBracketHTML(true), convertETH(content), buildBracketHTML(false));
  return df;
}
function buildBracketHTML(open) {
  return makeSVG(function () {
    let svg = new SVGE('svg', {
        class: 'fi__brackets-svg',
        viewBox: '-2 0 6 50',
        preserveAspectRatio: 'none'
      }),
      ell = new SVGE('circle', {
        cx: open ? 25 : -22.5,
        cy: 25,
        r: 25,
        fill: 'transparent',
        'stroke-width': 2,
        stroke: 'white'
      });
    svg.append(ell.elem);
    svg.elem.open = open;
    return svg.elem;
  });
}
function bracket(open) {
  let df = document.createDocumentFragment();
  df.append(buildBracketHTML(open));
  cursor.move(df);
  return df;
}
buildFuncActionHTML = act => emmet(`span.fi__func-act{${act}}`);
function funcAction(act) {
  let df = document.createDocumentFragment();
  df.append(buildFuncActionHTML(act), buildBracketHTML(true, false));
  cursor.move(df);
  return df;
}
function buildBlockHTML(classes) {
  let elem = emmet(`div.fi__block.${classes.join('.')}`);
  function onSymbInsert() {
    if (elem.children.length == 0 || elem.children.length == 1 && elem.children[0] == cursor) elem.classList.add('fi__block_empty');else elem.classList.remove('fi__block_empty');
  }
  document.addEventListener('symbInserted', onSymbInsert);

  /*remove = elem.prototype.remove;
  elem.remove = function () {
  	this.call(remove);
  	document.removeEventListener('symbInserted', onSymbInsert);
  }*/

  return elem;
}
function buildPowHTML(power) {
  let df = buildBlockHTML(['fi__sup']);
  df.append(convertETH(power));
  return df;
}
function pow(power) {
  let df = document.createDocumentFragment(),
    supBlock = buildPowHTML(power);
  df.append(supBlock);
  if (power) cursor.move(df);else cursor.move(supBlock);
  return df;
}
function buildIndexHTML(index) {
  let df = buildBlockHTML(['fi__sub']);
  if (typeof index == 'string') df.append(emmet(`span.fi__num{${index}}`));else df.append(index);
  return df;
}
function index(n) {
  let df = document.createDocumentFragment(),
    subBlock = buildIndexHTML(n);
  df.append(subBlock);
  if (n) cursor.move(df);else cursor.move(subBlock);
  return df;
}
function buildRootHTML(content) {
  function makeSVG() {
    let svg = new SVGE('svg', {
      viewBox: '0 0 21 20',
      class: 'fi__root-polyline-svg',
      preserveAspectRatio: 'none'
    });
    svg.append('polyline', {
      points: '0, 10, 7, 10, 14, 20, 21, 0',
      'stroke-width': 1,
      stroke: 'white',
      fill: 'transparent'
    });
    let svg1 = new SVGE('svg', {
      viewBox: '0 0 5 2',
      class: 'fi__root-line-svg',
      preserveAspectRatio: 'none'
    });
    svg1.append('line', {
      x0: 0,
      y0: 0,
      x1: 5,
      y1: 0,
      'stroke-width': 2,
      stroke: 'white'
    });
    let df = document.createDocumentFragment();
    df.append(svg.elem, svg1.elem);
    return df;
  }
  let df = emmet(`div.fi__root`);
  let rootDiv = buildBlockHTML(['fi__root-content']);
  rootDiv.append(convertETH(content));
  df.append(makeSVG(), rootDiv); // insert SVG
  return df;
}
function root() {
  let df = buildRootHTML();
  cursor.move(df.lastChild);
  return df;
}
function buildComplexDivHTML(tp, bp) {
  let df = emmet(`.fi__div`);
  tpHTML = buildBlockHTML(['fi__div-block']);
  tpHTML.append(convertETH(tp));
  bpHTML = buildBlockHTML(['fi__div-block']);
  bpHTML.append(convertETH(bp));
  df.append(tpHTML, emmet('hr.fi__div-hr'), bpHTML);
  return df;
}
function complexDiv() {
  let df = buildComplexDivHTML();
  cursor.move(df.querySelector('.fi__div-block'));
  return df;
}
function specCarry(func, ...args) {
  return function () {
    return func(...args);
  };
}
let symbFuncs = new Map([[/zero/i, specCarry(num, new VM.Num(0))], [/one/i, specCarry(num, new VM.Num(1))], [/two/i, specCarry(num, new VM.Num(2))], [/three/i, specCarry(num, new VM.Num(3))], [/four/i, specCarry(num, new VM.Num(4))], [/five/i, specCarry(num, new VM.Num(5))], [/six/i, specCarry(num, new VM.Num(6))], [/seven/i, specCarry(num, new VM.Num(7))], [/eight/i, specCarry(num, new VM.Num(8))], [/nine/i, specCarry(num, new VM.Num(9))], [/opBracket/i, specCarry(bracket, true)], [/clBracket/i, specCarry(bracket, false)], [/root/i, root], [/complexDiv/i, complexDiv], [/sin/i, specCarry(funcAction, 'sin')], [/cos/i, specCarry(funcAction, 'cos')], [/tan/i, specCarry(funcAction, 'tan')], [/pi/i, specCarry(num, new VM.Num('pi'))], [/pow/i, pow], [/sqr/i, specCarry(pow, new VM.Num(2))], [/minus/i, specCarry(action, '-')], [/plus/i, specCarry(action, '+')], [/div/i, specCarry(action, '/')], [/mul/i, specCarry(action, '*')], [/scalar/i, specCarry(action, ',')], [/dot/i, specCarry(num, new VM.Num('.'))],
/*[/result/i, function () {

}],*/
[/v\d+/i, vector], [/allClear/, function () {
  cursor.remove();
  active.innerHTML = '';
  active.append(emmet('span.fi__cap'));
  return cursor;
}], [/delete/, function () {
  let prev = cursor.previousElementSibling;
  if (prev) prev.classList.add('fi__cap');else {
    let p = cursor.parent;
    if (p.classList.contains('fi__empty-block')) {}
  }
  return cursor;
}]]);
let cursor = emmet('span.fi__cursor.fi__cursor_blink');
Object.assign(cursor, {
  // DON'T PUSH HERE GETTER OR SETTER!!!!!!!!!!!!
  startBlink() {
    if (!this.timer) {
      let self = this;
      this.timer = setInterval(function () {
        self.classList.toggle('fi__cursor_blink');
      }, 500);
    }
  },
  stopBlink() {
    clearInterval(this.timer);
    this.timer = undefined;
  },
  move(place) {
    this.stopBlink();
    this.before(emmet('span.fi__cap'));
    place.append(this);
    this.startBlink();
  }
}); // DON'T PUSH HERE GETTER OR SETTER!!!!!!!!!!!!

Object.defineProperties(cursor, {});
let active = null,
  inserted = false;

// экспортируется. берет выюбранный элемент и записывает в него нужный символ
// Вызываться будет с нажатия на кнопки
module.exports.insert = function insert(s) {
  if (!active) return false;
  let symb = null;
  if (/v\d+(?:abs|angle|[xy])/i.test(s))
    // КОСТЫЛЬ
    symb = num(new VM.Num(s));else {
    for (let obj of symbFuncs) if (obj[0].test(s)) {
      symb = obj[1](s);
      break;
    }
  }
  if (!symb) return false;
  active.querySelector('.fi__cap').replaceWith(symb);
  inserted = true;
  if (active.oninput) active.oninput(symb);
  document.dispatchEvent(new CustomEvent('symbInserted'));
  [].forEach.call(active.querySelectorAll('svg'), a => {
    if (a.update) a.update();
  });
  return true;
};
module.exports.convertHTE = convertHTE;
module.exports.convertETH = convertETH;
module.exports.active = active;
Array.prototype.forEach.call(document.querySelectorAll('.fi'), function (a) {
  a.classList.add('fi__block');
});
document.addEventListener('click', function (e) {
  let target = e.target;
  if (!inserted) {
    active = target.closest('.fi');
    if (active) {
      let block = target.closest('.fi__block');
      if (target == block) block.append(cursor);else {
        while (!target.parentNode.matches('.fi__block')) target = target.parentNode;
        if (e.offsetX >= target.offsetWidth / 2) target.after(cursor);else target.before(cursor);
      }
      cursor.startBlink();
    } else {
      cursor.stopBlink();
      cursor.remove();
    }
  } else inserted = false;
});

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = function (Exp) {
  function DOM(Exp) {
    function build(Exp) {
      var elemReg = /^\w+/i,
        classReg = /\.([\w_-]+)/ig,
        idReg = /#([\w_-]+)/i,
        attrReg = /\[([\w_-]+)(?:="([\w_-]+)")?\]/ig,
        contentReg = /\{(.+)\}/i,
        elements = Exp.match(elemReg),
        id = Exp.match(idReg),
        content = Exp.match(contentReg),
        find;
      var elem = document.createElement(elements === null ? 'div' : elements[0]);
      while (find = classReg.exec(Exp)) elem.classList.add(find[1]);
      if (id !== null) elem.id = id[1];
      while (find = attrReg.exec(Exp)) elem.setAttribute(find[1], find[2]);
      if (content !== null) elem.innerHTML = content[1];
      return elem;
    }
    return build(Exp);
    /*var splitted = Exp.split('+');
    if (splitted.length == 1) return build(Exp);
    else return Exp.split('+').map(build).reduce((a, b) => {
    	a.appendChild(b);
    	return a;
    }, document.createDocumentFragment());*/
  }
  return DOM(Exp);
};

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = function SVGE(name, options) {
  var self = this,
    NS = 'http://www.w3.org/2000/svg',
    elem = this.elem = document.createElementNS(NS, name),
    nr = '\\d+(?:[.,]\\d+)?',
    // regexp on numbers
    translate = `translate\\(${nr}, ${nr}\\)`,
    // translate(num, num)
    rotate = `rotate\\(${nr}\\)`,
    // rotate(num)
    scale = `scale\\(${nr}\\)`,
    // scale(num)
    regexp = new RegExp(`${translate}|${rotate}|${scale}`, 'gi'); // just concatination

  if (typeof options == 'object') for (var key in options) elem.setAttribute(key, options[key]);
  function trans(name, args) {
    var prevVal = elem.getAttribute('transform');
    elem.setAttribute('transform', `${prevVal ? prevVal + ' ' : ''}${name}(${args instanceof Array ? args.join(', ') : args})`);
    return self;
  }
  for (var key in obj = {
    append(child, options) {
      if (typeof child == 'string') {
        var newElem = new SVGE(child, options);
        elem.appendChild(newElem.elem);
      } else elem.appendChild(child);
      return self;
    },
    transform(value) {
      if (typeof value == 'object') for (var key in value) self[key](value[key]);else while (res = regexp.exec(value)) {
        var nums = res[0].match(new RegExp(nr, 'g')),
          trans = res[0].slice(0, res[0].match(/\w+/)[0].length);
        self[trans](...nums); // вызов нужной функции с передачей параметров
      }
    },
    translate(x, y) {
      return trans('translate', [x, y]);
    },
    rotate(ang) {
      return trans('rotate', ang);
    },
    scale(value) {
      return trans('scale', value);
    },
    remove(child) {
      elem.removeChild(child);
    }
  }) this[key] = obj[key]; // присвоение нужных св-в
};

// to add element you need to make this construction: elem.appendChild(SVGE.elem)

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(10);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(11);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(12);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_6__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_6__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_6__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());
options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()((_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_6___default()), options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_6___default()) && (_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_6___default().locals) ? (_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_6___default().locals) : undefined);


/***/ }),
/* 6 */
/***/ ((module) => {

"use strict";


var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),
/* 7 */
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),
/* 8 */
/***/ ((module) => {

"use strict";


var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),
/* 9 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),
/* 10 */
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),
/* 11 */
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),
/* 12 */
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(13);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n  font-family: \"Inconsolata\";\n}\n\nbody {\n  overflow: hidden;\n}\n\n.wrapper {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  overflow: hidden;\n}\n.wrapper__overflow {\n  bottom: 0;\n  width: 100%;\n  max-height: 40%;\n  grid-template-columns: 1.5fr 2fr;\n}\n.wrapper__overflow-open {\n  position: absolute;\n  bottom: 10px;\n  right: 10px;\n}\n.wrapper__overflow-hide {\n  right: 25px;\n  top: -25px;\n}\n.wrapper__canvas {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  right: 0;\n  left: 0;\n}\n\n#main {\n  display: block;\n}\n\n.canvas__buttons {\n  position: absolute;\n  top: 10px;\n  right: 10px;\n  width: 50px;\n  display: grid;\n  grid-template-rows: repeat(3, 50px);\n  grid-gap: 10px;\n}\n\n.transparent-btn {\n  background: rgba(186, 227, 244, 0.6666666667);\n  color: #2D7392;\n  border-color: #2082AD;\n  border: 1px solid;\n}\n\n.overflow {\n  background: #7FB8FC;\n  border-top: 1px solid #3D76BB;\n  display: grid;\n  position: absolute;\n  z-index: 0;\n}\n.overflow_hidden {\n  display: none;\n}\n.overflow-open, .overflow-hide {\n  width: 50px;\n  height: 50px;\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  cursor: pointer;\n  position: absolute;\n}\n.overflow-open {\n  border-radius: 10px;\n}\n.overflow-open_hidden {\n  display: none;\n}\n.overflow-hide {\n  height: 25px;\n  border-radius: 10px 10px 0 0;\n  border-bottom: 0;\n}\n\n.vs {\n  width: 275px;\n  height: 300px;\n  position: static;\n  grid-template-rows: 25px 1fr;\n}\n.vs__UI {\n  display: grid;\n  padding: 5px;\n  grid-template-columns: repeat(2, 1fr);\n  grid-template-rows: repeat(5, 1fr);\n  grid-gap: 10px;\n  grid-template-areas: \"section section\" \"section1 section1\" \"section2 section2\" \"formule formule\" \"buttons buttons\";\n}\n.vs__overflow-hide {\n  border-radius: 50%;\n  width: 1.5em;\n  height: 1.5em;\n  top: 50%;\n  right: 5px;\n  transform: translateY(-50%);\n}\n.vs__overflow-hide:focus {\n  outline: none;\n}\n.vs_disconnected {\n  position: absolute;\n  z-index: 1000;\n  border: 1px solid #4160BB;\n  border-radius: 10px;\n}\n.vs_disconnected .console {\n  border-radius: 10px 10px 0 0;\n}\n\n.console {\n  height: 25px;\n  border-bottom: 1px solid #0B31A2;\n  background: #4160BB;\n  position: relative;\n  cursor: pointer;\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n}\n.console__info {\n  color: white;\n  font-family: \"Roboto\";\n}\n\n.btn {\n  background: #5881FC;\n  color: white;\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  font-size: 1.5em;\n  width: 100%;\n  height: 100%;\n  transition: 0.1s;\n  border: none;\n}\n.btn:hover {\n  cursor: pointer;\n  background: #2157F9;\n}\n.btn:active {\n  background: #0B31A2;\n}\n.btn:focus {\n  outline: none;\n}\n.btn_hidden {\n  display: none;\n}\n\n.setting {\n  width: 50%;\n  display: flex;\n  padding: 5px;\n}\n.setting-section {\n  display: flex;\n}\n.setting-section:nth-child(1) {\n  grid-area: section;\n}\n.setting-section:nth-child(2) {\n  grid-area: section1;\n}\n.setting-section:nth-child(3) {\n  grid-area: section2;\n}\n.setting-section:nth-child(4) {\n  grid-area: formule;\n}\n.setting-section:nth-child(4) .setting {\n  width: 100%;\n}\n.setting-section:nth-child(5) {\n  grid-area: buttons;\n  display: grid;\n  grid-template-columns: repeat(5, 1fr);\n  grid-gap: 0 5px;\n}\n.setting-section_choosed {\n  border: 1px dashed #0B31A2;\n  border-left: 0;\n  border-right: 0;\n  background: #84A2FC;\n}\n.setting .info {\n  margin-right: 5px;\n  color: white;\n  font-size: 1.2em;\n  padding-top: 2px;\n}\n.setting .value {\n  width: 100%;\n  border-bottom: 1px solid #197FF9;\n  display: flex;\n  align-items: center;\n}\n.setting .value .fi {\n  font-size: 20px;\n}\n.setting-last {\n  padding: 0;\n  width: auto;\n}\n.setting__label {\n  border-radius: 100%;\n}\n.setting__checkbox {\n  display: none;\n}\n.setting__checkbox:checked + .setting__label {\n  background: #2157F9;\n}\n\n.VList {\n  display: flex;\n  justify-content: space-between;\n  align-items: stretch;\n}\n\n.inner-VList {\n  width: 100%;\n  height: 100%;\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  grid-template-rows: repeat(4, 1fr);\n  grid-auto-rows: 1fr;\n  grid-gap: 1px 1px;\n}\n\n.vector {\n  border: none;\n  font-size: 2.5em;\n}\n.vector:hover {\n  border: none;\n}\n.vector:active {\n  border: none;\n}\n.vector:focus {\n  outline: none;\n}\n\n.noScroll-y {\n  overflow-y: scroll;\n  -ms-overflow-y-style: none;\n}\n.noScroll-y::-webkit-scrollbar {\n  width: 0;\n  height: 0;\n}\n\n.VCalc {\n  display: grid;\n  grid-template-rows: 1fr 2fr;\n  grid-template-columns: 1fr 1fr;\n  grid-template-areas: \"buttons input\" \"buttons error\";\n  grid-gap: 5px;\n}\n.VCalc__input {\n  border: 2px solid #D18000;\n  margin: 5px 5px 0 0;\n  border-radius: 5px;\n  padding: 5px;\n  display: flex;\n  align-items: center;\n}\n\n.buttons {\n  grid-area: buttons;\n  display: grid;\n  grid-template-columns: repeat(5, 1fr);\n  grid-template-rows: repeat(6, 1fr);\n  grid-gap: 1px 1px;\n  grid-template-areas: \"complexDiv root pow sqr pi\" \"opBracket clBracket sin cos tan \" \"seven eight nine plus mul\" \"four five six minus div\" \"one two three delete allClear\" \"zero dot scalar result result\";\n}\n\n.error-field {\n  padding-right: 5px;\n}\n\n.inner-error-field {\n  display: grid;\n  grid-auto-rows: 50px;\n}\n.inner-error-field .error__info {\n  display: none;\n}\n.inner-error-field_empty {\n  border: 2px dashed #D18000;\n  min-height: 100%;\n  text-align: center;\n  border-radius: 5px;\n}\n.inner-error-field_empty .error__info {\n  display: initial !important;\n}\n\n.error {\n  height: 100%;\n  background: #FFB644;\n  color: #A66602;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 5px;\n  margin-bottom: 5px;\n}\n.error__info {\n  font-family: \"Roboto\";\n  font-style: 0.5em;\n  color: #D18000;\n  margin-top: 5px;\n  display: none;\n}\n.error__look-place {\n  width: 3em;\n  background: #D18000;\n}\n.error__look-place:hover {\n  background: #C57800;\n}\n.error__look-place:active {\n  background: #B46E00;\n}\n.error__text {\n  width: calc(80% - 3em);\n  overflow-x: scroll;\n  -ms-overflow-x-style: none;\n}\n.error__text::-webkit-scrollbar {\n  width: 0 !important;\n  height: 0 !important;\n}\n.error__text-span {\n  font-family: \"Roboto\";\n}\n\n#vs-template, #vector-template, #error-template {\n  display: none;\n}\n\n.fi {\n  width: 100%;\n  min-height: 1em;\n  max-height: 3em;\n  font-size: 26px;\n  color: white;\n  cursor: text;\n  position: relative;\n  overflow: scroll;\n  overflow: -moz-scrollbars-none;\n  -ms-overflow-style: none;\n}\n.fi::-webkit-scrollbar {\n  width: 0;\n  height: 0;\n}\n.fi__block {\n  display: flex;\n  justify-content: flex-start;\n  align-items: center;\n}\n.fi__block_empty {\n  width: 0.56em;\n  height: 1em;\n  border: 1px solid white;\n  cursor: text;\n}\n.fi__cursor {\n  border: 1.5px solid white;\n  margin: 0 1px;\n  padding: 2px 0;\n  align-self: stretch;\n}\n.fi__cursor_blink {\n  border: none;\n  width: 3px;\n  display: inline-block;\n}\n.fi__sup {\n  margin-top: -5px;\n}\n.fi__sub {\n  margin-bottom: -5px;\n}\n.fi__sup, .fi__sub {\n  font-size: 0.8em;\n}\n.fi__vect {\n  position: relative;\n  height: 1.3em;\n}\n.fi__vect-svg {\n  position: absolute;\n  top: -2px;\n  left: 0;\n  width: 20px;\n  height: 10px;\n}\n.fi__vect-angle-svg {\n  height: 0.8em;\n  width: 0.45em;\n  align-self: flex-end;\n}\n.fi__brackets-svg {\n  width: 0.56em;\n  align-self: stretch;\n  /* position: relative;\n  top: 0;\n  bottom: 0; */\n}\n.fi__root {\n  position: relative;\n  margin-right: 0.15em;\n}\n.fi__root-content {\n  /* position: absolute;\n  top: 5px;\n  left: 21px; */\n  margin-left: 21px;\n  margin-top: 5px;\n  z-index: 2;\n}\n.fi__root-polyline-svg {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  width: 21px;\n  z-index: -1;\n}\n.fi__root-line-svg {\n  position: absolute;\n  width: calc(100% - 21px);\n  height: 2px;\n  left: 21px;\n  top: 0;\n}\n.fi__div {\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  flex-direction: column;\n  margin: 0px 2px;\n}\n.fi__div-block {\n  margin: 2px;\n  padding: 2px 0;\n  justify-content: center;\n}\n.fi__div-hr {\n  margin: 0;\n  border: none;\n  border-bottom: 1px solid white;\n  align-self: stretch;\n}", ""]);
// Exports
module.exports = exports;


/***/ }),
/* 13 */
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
const VM = __webpack_require__(1),
  mathInput = __webpack_require__(2),
  emmet = __webpack_require__(3);

function carry(func) {
  return function curried(...args) {
    if (args.length >= func.length) return func.apply(this, args);else return function (...args2) {
      return curried.apply(this, args.concat(args2));
    };
  };
}
let graphics = function (elem) {
  let cvs = elem.querySelector('#main');
  function setSizes() {
    cvs.width = cvs.parentNode.offsetWidth;
    cvs.height = cvs.parentNode.offsetHeight;
    w = cvs.width;
    h = cvs.height;
  }
  let c = cvs.getContext('2d'),
    scale,
    ox,
    oy,
    cx,
    cy,
    w,
    h;
  function renderAxis() {
    function checkNum(num) {
      let sc = scale * 100;
      while (~sc.toString().indexOf('.')) {
        num *= 10;
        sc *= 10;
      }
      return num % sc == 0;
    }
    let i, num;
    const str = scale + '',
      STEP = str[0] == '0' ? str[str.length - 1] == '2' ? 25 : 20 : str[0] == '2' ? 25 : 20;
    i = 0;
    let minX = Number((-(ox - ox % STEP) * scale).toPrecision(5));
    for (let x = ox % STEP; x <= w - ox % STEP; x += STEP) {
      c.strokeStyle = 'silver';
      line(x, 0, 0, h);
      c.strokeStyle = 'black';
      num = Number((minX + i).toPrecision(5));
      if (num != 0 && checkNum(num)) {
        if (oy < 0) c.strokeText(num, x - num.toString().length * 6.72 / 2, 10);else if (oy > h) c.strokeText(num, x - num.toString().length * 6.72 / 2, h - 10);else c.strokeText(num, x - num.toString().length * 6.72 / 2, oy + 10);
        c.strokeStyle = '#666';
        line(x, 0, 0, h);
      }
      i += scale * STEP;
    }
    i = 0;
    let minY = Number(((oy - oy % STEP) * scale).toPrecision(5));
    for (let y = oy % STEP; y <= h - oy % STEP; y += STEP) {
      c.strokeStyle = 'silver';
      line(0, y, w, 0);
      c.strokeStyle = 'black';
      num = Number((minY - i).toPrecision(5));
      if (num != 0 && checkNum(num)) {
        if (ox < 0) c.strokeText(num, 10, y + 5);else if (ox > w) c.strokeText(num, w - num.toString().length * 6.72 - 5, y + 5);else c.strokeText(num, ox - num.toString().length * 6.72 - 5, y + 5);
        c.strokeStyle = '#666';
        line(0, y, w, 0);
      }
      i += scale * STEP;
    }
    c.strokeText(0, ox - 10, oy + 10); // zero

    c.strokeStyle = 'black';
    line(0, oy, w, 0);
    line(ox, 0, 0, h);
  }
  function renderVectors() {
    VM.getVectorsList().map(a => {
      try {
        return {
          vx: a.vx.calc(),
          vy: a.vy.calc(),
          sx: a.sx.calc(),
          sy: a.sy.calc(),
          angle: a.angle.calc(),
          color: a.color
        };
      } catch (e) {
        return {
          vx: 0,
          vy: 0,
          sx: 0,
          sy: 0,
          angle: 0,
          color: a.color
        };
      }
    }).forEach(renderVector);
  }
  function renderVector(vector) {
    if (vector.vx == 0 && vector.vy == 0) return;
    c.strokeStyle = vector.color;
    c.lineWidth = 3;
    line(ox + vector.sx / scale, oy - vector.sy / scale, vector.vx / scale, -vector.vy / scale);
    drawTriangleWithSide(vector.sx + vector.vx, vector.sy + vector.vy, 10, vector.angle);
    c.strokeStyle = 'black';
    c.lineWidth = 1;
  }
  function setHome() {
    // it is coordintes of axises in pixels
    ox = w / 2;
    oy = h / 2;
    // scale is proportion of nums to pixels
    // to have pixels from nums you must div it
    scale = 0.02;
    // it is min coordinates in nums
    cx = (w / 2 - ox) * scale;
    cy = -(h / 2 - oy) * scale;
    render();
  }
  function drawTriangleWithSide(x0, y0, side, alpha) {
    const ANGLE = Math.PI / 6; // angle between bisector and side
    line(ox + x0 / scale, oy - y0 / scale, -side * Math.sin(ANGLE + Math.PI / 2 - alpha), side * Math.cos(ANGLE + Math.PI / 2 - alpha));
    line(ox + x0 / scale, oy - y0 / scale, -side * Math.cos(ANGLE + alpha), side * Math.sin(ANGLE + alpha));
  }
  function line(x0, y0, w, h) {
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x0 + w, y0 + h);
    c.stroke();
  }
  function render() {
    c.clearRect(0, 0, w, h);
    renderAxis();
    renderVectors();
  }
  function toggleScale(inc) {
    let str = scale.toString(); // stringify scale
    if (str[0] == '0') {
      if (str[str.length - 1] == '5') scale = inc ? scale / 2.5 : scale * 4;else if (str[str.length - 1] == '2') scale = inc ? scale / 4 : scale * 2.5;
      // return str.split('.').join('').length == (inc ? 6 : -1);
    } else {
      if (str[0] == '5') scale = inc ? scale / 2.5 : scale * 4;else if (str[0] == '2') scale = inc ? scale / 4 : scale * 2.5;
      // return str.length == (!inc ? 6 : -1);
    }
  }
  function checkScaleForMaxMin(inc) {
    let str = scale.toString();
    return str[0] == '0' ? str.split('.').join('').length == (inc ? 6 : -1) : str.length == (!inc ? 6 : -1);
  }
  function events() {
    window.addEventListener('resize', function () {
      setSizes();
      render();
    });
    let move = false,
      x0,
      y0;
    cvs.addEventListener('mousedown', function (e) {
      move = true;
      x0 = e.offsetX;
      y0 = e.offsetY;
    });
    document.addEventListener('mousemove', function (e) {
      if (move) {
        e.preventDefault();
        let x = e.offsetX,
          y = e.offsetY;
        ox += x - x0;
        oy += y - y0;
        [x0, y0] = [x, y];
        cx = (w / 2 - ox) * scale;
        cy = -(h / 2 - oy) * scale;
        render();
        let homeBtnCl = elem.querySelector('[data-action="home"]').classList;
        if (homeBtnCl.contains('btn_hidden')) homeBtnCl.remove('btn_hidden');
      }
    });
    cvs.addEventListener('mouseup', function (e) {
      move = false;
    });
    document.addEventListener('vectorMathChange', function () {
      render();
    });
    elem.querySelector('.canvas__buttons').addEventListener('click', function (e) {
      let target = e.target.closest('.btn');
      if (!target) return;
      let attr = target.getAttribute('data-action');
      if (attr == 'home') setHome();else toggleScale(attr == 'inc');
      if (checkScaleForMaxMin(attr == 'inc')) target.classList.add('btn_hidden');else if (attr == 'home') {
        [].forEach.call(elem.querySelectorAll('.btn_hidden'), a => {
          a.classList.remove('btn_hidden');
        });
        target.classList.add('btn_hidden');
      } else {
        if (attr == 'inc') target.nextElementSibling.classList.remove('btn_hidden');else target.previousElementSibling.classList.remove('btn_hidden');
        elem.querySelector('[data-action="home"]').classList.remove('btn_hidden');
      }
      render();
    });
  }
  function render0() {
    setSizes();
    setHome();
    events();
  }
  return {
    render0
  };
}(document.querySelector('.canvas'));
let overflow = function (elem) {
  function setSizes() {
    elem.style.height = `${elem.parentNode.offsetWidth / 4}px`;
  }
  return {
    get open() {
      return elem.classList.has('overflow_hidden');
    },
    set open(value) {
      elem.classList[value ? 'remove' : 'add']('overflow_hidden');
    },
    toggleOpen() {
      open = !open;
    },
    render() {
      window.addEventListener('resize', function () {
        setSizes();
      });
      setSizes();
      let self = this;
      document.getElementById('overflow-open').addEventListener('click', function (e) {
        self.open = true;
        this.classList.add('overflow-open_hidden');
      });
      elem.querySelector('.overflow-hide').addEventListener('click', function (e) {
        self.open = false;
        document.getElementById('overflow-open').classList.remove('overflow-open_hidden');
      });
    }
  };
}(document.querySelector('.wrapper__overflow'));
let VS = function () {
  return {
    openNew(vector, index) {
      let elem = document.getElementById('vs-template').cloneNode(true);
      elem.id = '';
      elem.setAttribute('data-index', index);
      [].forEach.call(elem.querySelectorAll('[data-param]'), a => {
        a.setAttribute('data-index', index);
      });
      elem.querySelector(`.setting-section:nth-child(${(vector.mode & 4 ? 3 : vector.mode) + 1})`).classList.add('setting-section_choosed'); // shifting on 1 because first section is coordinates

      [].forEach.call(elem.querySelectorAll('.setting__label:not([data-param="color"])'), a => {
        let attr = a.getAttribute('data-param');
        let text = `${attr}_${index}`;
        a.setAttribute('for', text);
        a.previousElementSibling.setAttribute('name', text);
        a.checked = vector[attr];
      });

      /*elem.querySelector('.setting__label[data-param="locked"]').checked = vector.locked;
      elem.querySelector('.setting__label[data-param="visible"]').checked = vector.visible;
      elem.querySelector('.setting__label[data-param="rad"]').checked = vector.rad;*/
      elem.querySelector('.setting__label[data-param="color"]').style.background = vector.color;
      [].forEach.call(elem.querySelectorAll('.fi'), function (a) {
        let setting = a.closest('.setting'),
          param = setting.getAttribute('data-param'),
          index = setting.getAttribute('data-index');
        function redraw() {
          a.innerHTML = '';
          a.append(mathInput.convertETH(VM.getVectorsList()[index][`${param}_f`]));
        }
        redraw();
        document.addEventListener(`vector${index}Deleted`, function (e) {
          document.removeEventListener('vectorMathChange', redraw);
        }, {
          once: true
        });
        document.addEventListener('vectorMathChange', redraw);
        a.oninput = function (symb) {
          document.removeEventListener('vectorMathChange', redraw);
          VM.changeVector(index, param, mathInput.convertHTE(a));
          document.addEventListener('vectorMathChange', redraw);
        };
      });
      elem.querySelector('.console__info').innerText = `Вектор ${Number(index) + 1}`;
      elem.addEventListener('click', function (e) {
        let t = e.target,
          section;
        if (t.closest('.info')) {
          let setting = t.closest('.setting'),
            param = setting.getAttribute('data-param');
          if (/s[xy]|formule/.test(param)) return;
          if (/v[xy]/.test(param)) mathInput.insert(`v${Number(setting.getAttribute('data-index')) + 1}${param.slice(1)}`);else mathInput.insert(`v${Number(setting.getAttribute('data-index')) + 1}${param}`);
          return;
        } else if (section = t.closest('.setting-section')) {
          if (!section.hasAttribute('data-unchosable')) {
            const CL = 'setting-section_choosed';
            if (!section.classList.contains(CL)) {
              let UI = section.closest('.vs__UI');
              let mode = [].indexOf.call(UI.children, section);
              VM.changeVector(section.closest('.vs').getAttribute('data-index'), 'mode', mode == 3 ? 4 : mode);
              UI.querySelector('.' + CL).classList.remove(CL);
              section.classList.add(CL);
            }
          }
        }
      });
      elem.querySelector('.setting__label[data-param="delete"]').onclick = function () {
        let index = this.getAttribute('data-index');
        VM.deleteVector(index);
        let indexSelector = `[data-index="${index}"]`;
        document.querySelector(`.vector${indexSelector}`).remove();
        document.querySelector(`.vs${indexSelector}`).remove();
        [].forEach.call(elem.querySelectorAll(`.vector:not(.VList__newVector)`), a => {
          a.setAttribute('data-index', index);
          a.innerText = index + 1;
        });
      };
      elem.querySelector('.setting__label[data-param="rad"]').onclick = function () {
        let index = this.getAttribute('data-index');
        let span = this.querySelector('span');
        span.innerText = span.innerText == 'D' ? 'R' : 'D';
        VM.changeVector(index, 'rad', span.innerText == 'R');
      };
      elem.querySelector('.setting__label[data-param="locked"]').onchange = function () {
        let index = this.getAttribute('data-index');
        VM.changeVector(index, 'locked', this.checked);
      };
      elem.querySelector('.overflow-hide').addEventListener('click', function (e) {
        document.dispatchEvent(new CustomEvent('vs-overflow-hide', {
          detail: {
            index: elem.getAttribute('data-index')
          }
        }));
        elem.remove();
      });
      elem.querySelector('.console').addEventListener('mousedown', function (e) {
        if (e.target.closest('.overflow-hide')) return;
        let consoleElem = e.target.closest('.console');
        let shiftX = event.clientX - consoleElem.getBoundingClientRect().left,
          shiftY = event.clientY - consoleElem.getBoundingClientRect().top;
        function targetMouseMove(event) {
          event.preventDefault();
          elem.style.top = `${event.pageY - shiftY - 1}px`;
          elem.style.left = `${event.pageX - shiftX - 1}px`;
        }
        ;
        elem.classList.add('vs_disconnected');
        document.body.append(elem);
        targetMouseMove(e);
        document.addEventListener('mousemove', targetMouseMove);
        document.addEventListener('mouseup', function mouseUp(e) {
          document.removeEventListener('mousemove', targetMouseMove);
          document.removeEventListener('mouseup', mouseUp);
        });
      });
      return elem;
    }
  };
}();
let vectorList = function (elem) {
  elem = elem.querySelector('.inner-VList');
  let newVectorBtn = elem.querySelector('.VList__newVector');
  function renderVector(index) {
    let tmpl = document.getElementById('vector-template').cloneNode(true);
    tmpl.id = '';
    tmpl.setAttribute('data-index', index);
    tmpl.innerText = index + 1;
    return tmpl;
  }
  document.addEventListener('vectorDeleted', function () {
    [].forEach.call(elem.querySelectorAll('.vector:not(.VList__newVector)'), (a, i) => {
      a.setAttribute('data-index', i);
      a.innerText = i + 1;
    });
  });
  document.addEventListener('vs-overflow-hide', function (e) {
    elem.querySelector(`.btn[data-index="${e.detail.index}"]`).removeAttribute('data-opened');
  });
  elem.addEventListener('click', function (e) {
    let target = e.target;
    target = target.closest('.btn');
    if (!target) return;
    if (target.classList.contains('btn')) {
      if (target.classList.contains('VList__newVector')) {
        let newIndex = elem.children.length - 1;
        elem.insertBefore(renderVector(newIndex, newIndex), newVectorBtn);
        VM.newVector();
      } else {
        let index = target.getAttribute('data-index');
        let r = mathInput.insert(`v${index}`);
        if (target.hasAttribute('data-opened')) return;
        if (!r) {
          let vect = VM.getVectorsList()[index],
            newVS = VS.openNew(vect, index);
          target.setAttribute('data-opened', '');
          elem.closest('.VList').appendChild(newVS);
        }
      }
    }
  });
}(document.querySelector('.VList'));
let vectorCalc = function (elem) {
  return {
    render() {
      [].forEach.call(elem.getElementsByClassName('btn'), a => {
        a.style.gridArea = a.getAttribute('data-area');
      });
      elem.querySelector('.buttons').addEventListener('click', function (e) {
        let target = e.target,
          btn = target.closest('.btn');
        if (btn) {
          let attr = btn.getAttribute('data-area');
          if (attr == 'result') {
            let res = mathInput.convertHTE(elem.querySelector('.fi')).calc();
            if (res instanceof VM.Vector) {
              // draw it on canvas
            } else {
              res = res.calc();
              if (/e-/.test(res.toString())) alert(0);else alert(res);
            }
          } else mathInput.insert(btn.getAttribute('data-area'));
        }
      });
    }
  };
}(document.querySelector('.VCalc'));
let errorField = function (elem) {
  elem = elem.querySelector('.inner-error-field');
  function addNewError(place, error) {
    let template = document.getElementById('error-template').cloneNode(true);
    template.id = '';
    template.querySelector('.error__text-span').innerText = error.message;
    template.querySelector('.error__look-place').addEventListener('click', function () {
      let btn = document.querySelector(`.VList .btn[data-index="${place.index}"]`);
      if (!btn.hasAttribute('data-opened')) {
        btn.dispatchEvent(new Event('click', {
          target: btn,
          bubbles: true
        }));
      }
    });
    elem.append(template);
  }
  return {
    render() {
      /*VM.makeErrProxy(function (place, error) {
      	console.log(place, error.name);
      });*/

      document.addEventListener('vectorMathChange', function () {
        setTimeout(function () {
          [].forEach.call(elem.querySelectorAll('.error'), a => {
            a.remove();
          });
          if (VM.errors.size == 0) elem.classList.add('inner-error-field_empty');else elem.classList.remove('inner-error-field_empty');
          for (let key of VM.errors.keys()) {
            addNewError(key, VM.errors.get(key));
          }
          VM.errors.clear();
        }, 0);
      });
    }
  };
}(document.querySelector('.error-field'));
document.addEventListener('DOMContentLoaded', function () {
  graphics.render0();
  overflow.render();
  vectorCalc.render();
  errorField.render();
});
})();

/******/ })()
;