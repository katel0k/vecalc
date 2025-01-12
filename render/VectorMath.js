class VectorMathTypeError extends Error {
	constructor (message) {
		super(message);
		this.name = 'VectorMathTypeError';
	}
}
module.exports.VectorMathTypeError = VectorMathTypeError;

class VectorMathError extends Error {
	constructor (message) {
		super(message);
		this.name = 'VectorMathError';
	}
}
module.exports.VectorMathError = VectorMathError;

class VectorMathBracketSequenceError extends Error {
	constructor (message) {
		super(message);
		this.name = 'VectorMathBracketSequenceError';
	}
}
module.exports.VectorMathBracketSequenceError = VectorMathBracketSequenceError;

function Num (value) {
	this.value = value;
	this.calc = function () {
		if (typeof this.value == 'number') return this.value
		let matched = this.value.match(/v(\d+)(s?[xy]|abs|angle)/i);
		if (matched != null)
			return vectors[Number(matched[1]) - 1][matched[2]].calc();
		if (value == 'pi') return Math.PI;
		return Number(this.value);
	}
}

module.exports.Num = Num;

function calcBracket (arr) {
	// reduces situations like +-Num
	let tmpArr = [];
	Object.defineProperty(tmpArr, 'last', { get () { return this[this.length - 1] }});
	arr = arr.reduce((a, b, i) => {
		if (b instanceof Action) {
			if (a.last instanceof Action) {
				if ([a.last, b].every(a => [unarPlus, plus, unarMinus, minus].includes(a))) {
					if ([[unarPlus, plus], [unarMinus, minus]].some(arr => [a.last, b].every(c => arr.insludes(c))))
						a.push(unarPlus);
					else
						a.push(unarMinus);
				}
			}
			else if (i == 0) a.push(b == minus ? unarMinus : unarPlus);
			else a.push(b);
		} else a.push(b);
		return a;
	}, tmpArr);

	arr = arr.map(a => [Brackets, Root, ComplexDiv, Pow].
		some(b => a instanceof b) ? a.calc() : a);

	if (arr.filter(a => a instanceof Vector || a instanceof Num || a instanceof Brackets).length !=
		arr.filter(a => a instanceof Action && !a.unary).length + 1)
		throw new VectorMathError('Неверное кол-во действий');

	let findMxByPriority = a => a.indexOf(a.reduce((a, b) => b instanceof Action && b.priority > a.priority ? b : a, {priority: 0}));
	while (arr.length > 1) {
		let index = findMxByPriority(arr);
		if (!arr[index].unary)
			arr.splice(index - 1, 3, arr[index].calc( arr[index - 1].calc(), arr[index + 1].calc() ));
		else if (arr[index].unary)
			arr.splice(index, 2, arr[index].calc( arr[index + 1].calc() ));
	}

	return arr[0];
}

class Formule extends Array {
	constructor (content=[new Num(0)]) {
		if (content.length != 1) super(...content)
		else {
			super();
			this[0] = content[0];
		}
	}
	calc () {
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
	constructor (content = [new Num(0)], closed = true) {
		super(...content);
		this.closed = closed;
	}
	calc () {
		if (!this.closed) throw new VectorMathBracketSequenceError('Скобка не закрыта');
		let arr = [];
		for (let i = 0; i < this.length; i++)
			arr.push(this[i]);
		return calcBracket(arr);
	}
	static get [Symbol.species]() {
		return Array;
	}
}
module.exports.Brackets = Brackets;

function ComplexDiv (tp = [], bp = []) {
	this.tp = new Formule(tp);
	this.bp = new Formule(bp);
	this.calc = function () {
		let bpCalced = this.bp.calc(),
			tpCalced = this.tp.calc();
		if (bpCalced instanceof Vector || tpCalced instanceof Vector)
			throw new VectorMathTypeError('В делении не совпадают типы');
		if (bpCalced instanceof Num && (bpCalced.value == 0))
			throw new VectorMathError('Нельзя делить на ноль!');
		return new Num(tpCalced.calc() / bpCalced.calc());
	}
}
module.exports.ComplexDiv = ComplexDiv;

function Root (content = []) {
	this.content = new Formule(content);
	this.calc = function () {
		let contentCalced = this.content.calc();
		if (!(contentCalced instanceof Num)) throw new VectorMathTypeError('Под корнем должно быть число');
		return new Num(Math.pow(contentCalced.calc(), 0.5));
	}
}
module.exports.Root = Root;

function Pow (basis = [], power = []) {
	this.power = new Formule(power);
	this.basis = new Formule(basis);
	this.calc = function () {
		let powerCalced = this.power.calc();
		let basisCalced = this.basis.calc();
		if (basisCalced instanceof Vector)
			throw new VectorMathTypeError('Нельзя возводить вектор в степень');
		else if (powerCalced instanceof Vector)
			throw new VectorMathTypeError('Нельзя возводить число в степень вектора')
		return new Num(Math.pow(basisCalced.calc(), powerCalced.calc()));
	}
}

module.exports.Pow = Pow;

function getColor () {
	let colors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#bdc3c7', '#000'];
	return colors[ Math.floor( Math.random() * (colors.length - 1) ) ];
}

let proxyCollection = new Map();
function createProxy (target, handler, revocable = false) {
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
function Vect ({
		vx = new Formule(), vy = new Formule(), sx = new Formule(), sy = new Formule(),
		formule = new Formule(),
		abs = new Formule(), angle = new Formule(),
		color = getColor(), rad = true, locked = false, mode = 1, calc = true, index = -1, ...options
	} = {}) {
	/*[{vx: new Formule(), vy: new Formule(), abs: new Formule(),
			angle: new Formule(), sx: new Formule(), sy: new Formule(), __proto__: Vect}]*/
	let tmp;
	if (mode & 1)
		tmp = {
			vx: vx.calc(),
			vy: vy.calc(),
		}
	else if (mode & 2)
		tmp = {
			abs: abs.calc(),
			angle: angle.calc()
		}
	else if (mode & 4) {
		if (calc) {
			let v;
			if (formule)
				v = formule.calc();
			else
				v = new Formule( [Vect()] );
			tmp = {
				vx: v.vx,
				vy: v.vy,
				abs: v.abs,
				angle: v.angle
			}
			sx = v.sx;
			sy = v.sy;
		}
		else tmp = { vx, vy, abs, angle }
	}

	let res = {
		rad, color, locked,
		get mode () { return mode },
		set mode (value) {
			if (value & 1) {
				vx = new Formule([this.vx]);
				vy = new Formule([this.vy]);
				try { tmp = {vx: vx.calc()} }
				catch (e) { errors.set({index, pl: 'vx'}, e) }
				try { tmp.vy = vy.calc() }
				catch (e) { errors.set({index, pl: 'vy'}, e) }
			}
			else if (value & 2) {
				abs = new Formule([this.abs]);
				angle = new Formule([this.angle])
				try { tmp = {abs: abs.calc()} }
				catch (e) { errors.set({index, pl: 'abs'}, e) }
				try { tmp.angle = angle.calc() }
				catch (e) { errors.set({index, pl: 'angle'}, e) }
			}
			else if (value & 4) {
				let v;
				try {
					v = formule.calc();
					if (!v || !(v instanceof Vector)) throw new VectorMathTypeError('В формуле должен получаться вектор')
					tmp = {
						vx: v.vx,
						vy: v.vy,
						abs: v.abs,
						angle: v.angle
					}
					sx = new Formule([new Num(v.sx.calc())]);
					sy = new Formule([new Num(v.sy.calc())]);
				}
				catch (e) { errors.set({index, pl: 'formule'}, e) }
			}
			mode = value;
		},
		get sx () { return sx.calc() },
		set sx (value) { sx = value },
		get sy () { return sy.calc() },
		set sy (value) { sy = value },
		get vx () {
			if (mode & 1) 
				return vx.calc();
			if (mode & 2)
				return new Num(tmp.abs.calc() * Math.cos( tmp.angle.calc() ));
			if (mode & 4)
				return tmp.vx;
		},
		set vx (value) {
			if (mode & 1) {
				try {
					tmp.vx = value.calc();
				}
				catch (e) {
					errors.set({index, pl: 'vx'}, e);
				}
				vx = value;
			}
		},
		get vy () {
			if (mode & 1) 
				return vy.calc();
			if (mode & 2)
				return new Num(tmp.abs.calc() * Math.sin( tmp.angle.calc() ));
			if (mode & 4)
				return tmp.vy;
		},
		set vy (value) {
			if (mode & 1) {
				try {
					tmp.vy = value.calc();
				}
				catch (e) {
					errors.set({index, pl: 'vy'}, e);
				}
				vy = value;
			}
		},
		get abs () {
			if (mode & 1) {
				let x = tmp.vx.calc(), y = tmp.vy.calc();
				return new Num(Math.sqrt(x ** 2 + y ** 2));
			}
			if (mode & 2)
				return abs.calc();
			if (mode & 4)
				return tmp.abs;
		},
		set abs (value) {
			if (mode & 2) {
				try {
					tmp.abs = value.calc();
				}
				catch (e) {
					errors.set({index, pl: 'abs'}, e);
				}
				abs = value;
			}
		},
		get angle () {
			let res;
			if (mode & 1)
				res = new Num(Math.atan2(tmp.vy.calc(), tmp.vx.calc()));
			if (mode & 2)
				res = angle.calc();
			if (mode & 4)
				res = tmp.angle;
			return res;
		},
		set angle (value) {
			if (mode & 2) {
				try {
					tmp.angle = value.calc();
				}
				catch (e) {
					errors.set({index, pl: 'angle'}, e);
				}
				angle = value;
			}
		},
		get formule () {
			return formule;
		},
		set formule (value) {
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
				}
				sx = new Formule([new Num(v.sx.calc())]);
				sy = new Formule([new Num(v.sy.calc())]);
			}
			catch (e) {
				errors.set({index, pl: 'formule'}, e);
			}
		},
		get sx_f () { return sx },
		get sy_f () { return sy },
		get vx_f () { return mode & 1 ? vx : this.vx },
		get vy_f () { return mode & 1 ? vy : this.vy },
		get abs_f () { return mode & 2 ? abs : this.abs },
		get angle_f () { return mode & 2 ? angle : this.angle },
		get formule_f () { return formule },
		calc () { return this },
		numMultip (num) {
			return new Vector({
				formule: new Formule([ this, mul, new Num(num) ]),
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
		toString () { return ''; },
		tmp,
		color,
		__proto__: Vect
	}

	document.addEventListener('vectorMathChange', function (e) {
		if (!locked && e.detail && e.detail.index != index) {
			tmp = {};
			if (mode & 1) {
				try { tmp.vx = vx.calc() }
				catch (e) { errors.set({index, pl: 'vx'}, e) }
				try { tmp.vy = vy.calc() }
				catch (e) { errors.set({index, pl: 'vy'}, e) }
			}
			else if (mode & 2) {
				try { tmp.abs = abs.calc() }
				catch (e) { errors.set({index, pl: 'abs'}, e) }
				try { tmp.angle = angle.calc() }
				catch (e) { errors.set({index, pl: 'angle'}, e) }
			}
			else if (mode & 4) {
				let v;
				try {
					v = formule.calc();
					if (!v || !(v instanceof Vector)) throw new VectorMathTypeError('В формуле должен получаться вектор')
					tmp = {
						vx: v.vx,
						vy: v.vy,
						abs: v.abs,
						angle: v.angle
					}
					sx = new Formule([new Num(v.sx.calc())]);
					sy = new Formule([new Num(v.sy.calc())]);
				}
				catch (e) {
					errors.set({index, pl: 'formule'}, e);
				}
			}
		}
	});

	return res;
}

Object.defineProperty(Vect, Symbol.hasInstance, {
	value (obj) {
		if (proxyCollection.has(obj)) obj = proxyCollection.get(obj);
		return obj.__proto__ == Vect;
	}
})

function Vector () {
	let index = arguments[0].index;
	return createProxy(new Vect(...arguments), {
		set (target, param, value) {
			Reflect.set(...arguments);
			if (/[vs][xy]|formule|abs|angle|mode|rad/.test(param))
				if (!target.locked)
					document.dispatchEvent(new CustomEvent('vectorMathChange', {
						detail: {index}
					}));
		}
	})
}
Object.defineProperty(Vector, Symbol.hasInstance, {
	value: obj => obj instanceof Vect
})
module.exports.Vector = Vector;

function Action (calc, priority, unary=false) {
	this.calc = calc;
	this.priority = priority;
	this.unary = unary;
}

let plus = new Action( (a, b) => {
		if (typeof a == 'number' && typeof b == 'number') return new Num(a + b);
		if (a instanceof Vector && b instanceof Vector) {
			let avx = a.vx.calc(), bvx = b.vx.calc(), avy = a.vy.calc(), bvy = b.vy.calc();
			return new Vector({
				vx: new Num(avx + bvx),
				vy: new Num(avy + bvy),
				sx: a.sx,
				sy: a.sy,
				abs: new Num( Math.sqrt(Math.pow(avx + bvx, 2) + Math.pow(avy + bvy, 2)) ),
				angle: new Num( (avx + bvx) != 0 ? Math.atan2( avy + bvy, avx + bvx ) : Math.PI / 2 * Math.sign(avy + bvy) ),
				formule: new Formule([a, plus, b]),
				mode: 4,
				calc: false
			});
		}
		throw new VectorMathTypeError('В сложении не совпадают типы');
	}, 3 ),
	minus = new Action( (a, b) => {
		if (typeof a == 'number' && typeof b == 'number') return new Num(a - b);
		if (a instanceof Vector && b instanceof Vector) {
			let avx = a.vx.calc(), bvx = b.vx.calc(), avy = a.vy.calc(), bvy = b.vy.calc();
			return new Vector({
				vx: new Num(avx - bvx),
				vy: new Num(avy - bvy),
				sx: a.sx,
				sy: a.sy,
				abs: new Num( Math.sqrt(Math.pow(avx - bvx, 2) + Math.pow(avy - bvy, 2)) ),
				angle: new Num( (avx - bvx) != 0 ? Math.atan2( avy - bvy, avx - bvx ) : Math.PI / 2 * Math.sign(avy - bvy) ),
				formule: new Formule([a, plus, b]),
				mode: 4,
				calc: false
			});
		}
		throw new VectorMathTypeError('В вычитании не совпадают типы');
	}, 3 ),
	mul = new Action( (a, b) => {
		if (typeof a == 'number' && typeof b == 'number') return new Num(a * b);
		if (typeof a == 'number' && b instanceof Vector) return b.numMultip(a);
		if (typeof b == 'number' && a instanceof Vector) return a.numMultip(b);
		}, 4 ),
	div = new Action( (a, b) => {
		if (typeof a == 'number' && typeof b == 'number') {
			if (b == 0) throw new VectorMathError('Нельзя делить на 0');
			return new Num(a / b);
		}
		throw new VectorMathTypeError('В делении не совпадают типы');
	}, 4 ),
	scMultip = new Action( (a, b) => {
		if (typeof a == 'number' || typeof b == 'number') throw new VectorMathTypeError('В скалярном произведении не совпадают типы');
		return new Num( a.abs.calc() * b.abs.calc() * Math.cos( a.angle.calc() * b.angle.calc() ) );
	} )
	unarMinus = new Action( a => {
		if (typeof a == 'number') return new Num(-a);
		else if (a instanceof Vector) return a.numMultip(-1);
	}, 6, true ),
	unarPlus = new Action( a => a, 6, true );

function funcAction (func) {
	this.priority = 7;
	this.calc = function (a) {
		if (!(typeof a == 'number')) throw new VectorMathTypeError('Нельзя подставлять в тригонометрические функции вектора');
		return new Num( func(a) );
	}
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
}

module.exports.pushVector = function (vector=new Vector()) {
	vectors.push(vector);
	document.dispatchEvent(new CustomEvent('vectorMathChange'));
}

module.exports.deleteVector = function (i) {
	vectors.splice(i, 1);
	document.dispatchEvent(new CustomEvent(`vector${i}Deleted`));
	document.dispatchEvent(new CustomEvent(`vectorDeleted`));
	document.dispatchEvent(new CustomEvent('vectorMathChange'));
}

module.exports.changeVector = function (i, param, value) {
	vectors[i][param] = value;
}

module.exports.getVectorsList = () => vectors.slice();

let errors = new Map();

module.exports.errors = errors;

module.exports.makeErrProxy = function (callback) {
	errors.set = function () {
		Map.prototype.set.call(this, ...arguments);
		callback(...arguments);
	}
}

let obj = { plus, minus, mul, div, sin, cos, tan };
for (let key in obj) module.exports[key] = obj[key];
