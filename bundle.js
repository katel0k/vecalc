/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var VM = __webpack_require__(1);

console.log(new VM.Vector());

/***/ }),
/* 1 */
/***/ (function(module, exports) {

class Brackets extends Array {
	constructor ({closed = true, content = [0], show = true}={}) {
		super();
		[this.closed, this.content, this.show] = [closed, content, show];
	}

	calc () {
		function findMxByPriority (arr) {
			let bestIndex = 0;
			for (let i = 0; i < arr.length; i++)
				if (arr[i].priority != undefined
						&& arr[i].priority > arr[bestIndex].priority)
					bestIndex = i;
			return bestIndex;
		}

		while (this.content.length > 1) {
			let index = findMxByPriority(this.content);
			if (this.content[index].unary)
				this.content.splice(index - 1, 3, this.content[index].calc( this.content[index - 1].calc(), this.content[index + 1].calc() ));
		}

		return this.content[0];
	}
}

class Num {
	constructor (value) { this.value = value }
	calc () { return this.value }
}

let plus = {
	calc (a, b) {
		if (typeof a == 'number' && typeof b == 'number') return new Num({value: a + b});
	}
}


let CO = new Brackets();

function getColor () {
	let colors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#bdc3c7', '#000'];
	return colors[ Math.floor( Math.random() * (colors.length - 1) ) ];
}


/**
 * class Vector
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
function Vector ({
		vx = new Brackets(), vy = new Brackets(), sx = new Brackets(), sy = new Brackets(),
		formule = new Brackets(), calc = true, abs = new Brackets(), angle = new Brackets(),
		color = getColor(), rad = true, locked = false, mode = 0, ...options
	} = {}) {

	// tmp = { vx, vy, sx, sy, abs, angle }

	/*// it may probably be stack error
	return new Proxy({
		get sx () { return sx.calc() },
		set sx (value) { sx = value },
		get sy () { return sy.calc() },
		set sy (value) { sy = value },
		get vx () { return vx.calc() },
		set vx (value) { vx = value },
		get vy () { return vy.calc() },
		set vy (value) { vy = value },
		get angle () {
			
			let res;
			if (this.vx != 0)
				res = Math.atan2(this.vy, this.vx);
			else 
				res = (this.vy > 0 ? 1 : -1) * Math.PI / 2; // Math.PI or -Math.PI
			return this.rad ? res : res * 180 / Math.PI;
		},
		set angle (value) {
			let abs = this.abs.calc();
			value = value.calc();
			value = this.rad ? value : value * 180 / Math.PI;
			this.vx = new Num(abs * Math.cos(value));
			this.vy = new Num(abs * Math.sin(value));
		},
		get abs {

		}
		formule
	}, {
		set (target, param, value) {
			let res = Reflect.set(...arguments);
			if ('vx vy sx sy abs angle formule'.split(' ').some(a => a == param)) {
				if (target[redraw])
					makeRecalcEvent();
			}
			return res;
		}
	});*/

	return new Proxy({
		get sx () { return sx.calc() },
		set sx (value) { sx = value },
		get sy () { return sy.calc() },
		set sy (value) { sy = value },
		get vx () {
			if (mode & 0) 
				return vx.calc();
			if (mode & 1)
				return tmp.abs * Math.cos( tmp.angle );
			if (mode & 2)
				return tmp.vx;
		},
		set vx (value) {
			if (mode & 0) {
				tmp.vx = value.calc();
				vx = value;
			}
		},
		get vy () {
			if (mode & 0) 
				return vy.calc();
			if (mode & 1)
				return tmp.abs * Math.cos( tmp.angle );
			if (mode & 2)
				return tmp.vy;
		},
		set vy (value) {
			if (mode & 0) {
				tmp.vy = value.calc();
				vy = value;
			}
		},
		get abs () {
			if (mode & 0)
				return Math.sqrt(tmp.vx * tmp.vx + tmp.vy * tmp.vy);
			if (mode & 1)
				return abs.calc();
			if (mode & 2)
				return tmp.abs;
		},
		set abs (value) {
			if (mode & 1) {
				tmp.abs = value.calc();
				abs = value;
			}
		},
		get formule () {
			return formule;
		},
		set formule (value) {
			tmp.formule = formule = value;
		}
	}, {
		
	})
}

module.exports.Vector = Vector;

/***/ })
/******/ ]);