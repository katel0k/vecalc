const VM = require('VectorMath'),
	mathInput = require('mathInput'),
	emmet = require('emmet');

function carry (func) {
	return function curried(...args) {
		if (args.length >= func.length)
			return func.apply(this, args);
		else
			return function(...args2) {
				return curried.apply(this, args.concat(args2));
			}
	}
}

let graphics = (function (elem) {
	let cvs = elem.querySelector('#main');
	function setSizes () {
		cvs.width = cvs.parentNode.offsetWidth;
		cvs.height = cvs.parentNode.offsetHeight;
		w = cvs.width;
		h = cvs.height;
	}

	let c = cvs.getContext('2d'),
		scale, ox, oy, cx, cy, w, h;
	function renderAxis () {
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
				if (oy < 0) c.strokeText(num, x - num.toString().length * 6.72 / 2, 10);
				else if (oy > h) c.strokeText(num, x - num.toString().length * 6.72 / 2, h - 10);
				else c.strokeText(num, x - num.toString().length * 6.72 / 2, oy + 10);
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
				if (ox < 0) c.strokeText(num, 10, y + 5);
				else if (ox > w) c.strokeText(num, w - num.toString().length * 6.72 - 5, y + 5);
				else c.strokeText(num, ox - num.toString().length * 6.72 - 5, y + 5);
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

	function renderVectors () {
		VM.getVectorsList().map(a => {
			try {
				return {
					vx: a.vx.calc(),
					vy: a.vy.calc(),
					sx: a.sx.calc(),
					sy: a.sy.calc(),
					angle: a.angle.calc(),
					color: a.color
				}
			}
			catch (e) {
				return {vx: 0, vy: 0, sx: 0, sy: 0, angle: 0, color: a.color};
			}
		}).forEach(renderVector);
	}

	function renderVector (vector) {
		if (vector.vx == 0 && vector.vy == 0) return;
		c.strokeStyle = vector.color;
		c.lineWidth = 3;
		line(ox + vector.sx / scale, oy - vector.sy / scale, vector.vx / scale, -vector.vy / scale);
		drawTriangleWithSide(vector.sx + vector.vx, vector.sy + vector.vy, 10, vector.angle);
		c.strokeStyle = 'black';
		c.lineWidth = 1;
	}

	function setHome () {
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
		line(ox + x0 / scale, oy - y0 / scale,
		 	 -side*Math.sin(ANGLE + Math.PI / 2 - alpha), side*Math.cos(ANGLE + Math.PI / 2 - alpha));
		line(ox + x0 / scale, oy - y0 / scale,
			 -side*Math.cos(ANGLE + alpha), side*Math.sin(ANGLE + alpha));
	}

	function line (x0, y0, w, h) {
		c.beginPath();
		c.moveTo(x0, y0);
		c.lineTo(x0 + w, y0 + h);
		c.stroke();
	}

	function render () {
		c.clearRect(0, 0, w, h);
		renderAxis();
		renderVectors();
	}

	function toggleScale (inc) {
		let str = scale.toString(); // stringify scale
		if (str[0] == '0') {
			if (str[str.length - 1] == '5')
				scale = inc ? scale / 2.5 : scale * 4;
			else if (str[str.length - 1] == '2')
				scale = inc ? scale / 4 : scale * 2.5;
			// return str.split('.').join('').length == (inc ? 6 : -1);
		}
		else {
			if (str[0] == '5')
				scale = inc ? scale / 2.5 : scale * 4;
			else if (str[0] == '2')
				scale = inc ? scale / 4 : scale * 2.5;
			// return str.length == (!inc ? 6 : -1);
		}
	}

	function checkScaleForMaxMin (inc) {
		let str = scale.toString();
		return ((str[0] == '0') ?
				(str.split('.').join('').length == (inc ? 6 : -1)) :
				(str.length == (!inc ? 6 : -1)))
	}

	function events () {
		window.addEventListener('resize', function () {
			setSizes();
			render();
		});

		let move = false,
			x0, y0;
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
				if (homeBtnCl.contains('btn_hidden'))
					homeBtnCl.remove('btn_hidden');
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
			if (attr == 'home') setHome();
			else toggleScale(attr == 'inc');
			if ( checkScaleForMaxMin(attr == 'inc') )
				target.classList.add('btn_hidden');
			else if (attr == 'home') {
				[].forEach.call(elem.querySelectorAll('.btn_hidden'),
					a => {a.classList.remove('btn_hidden')});
				target.classList.add('btn_hidden');
			}
			else {
				if (attr == 'inc') target.nextElementSibling.classList.remove('btn_hidden');
				else target.previousElementSibling.classList.remove('btn_hidden');
				elem.querySelector('[data-action="home"]').classList.remove('btn_hidden');
			}

			render();
		})
	}

	function render0 () {
		setSizes();
		setHome();
		events();
	}

	return { render0 }
})(document.querySelector('.canvas'));

let overflow = (function (elem) {
	function setSizes () {
		elem.style.height = `${elem.parentNode.offsetWidth / 4}px`;
	}
	return {
		get open () {
			return elem.classList.has('overflow_hidden');
		},
		set open (value) {
			elem.classList[value ? 'remove' : 'add']('overflow_hidden');
		},
		toggleOpen () { open = !open },
		render () {
			window.addEventListener('resize', function () {
				setSizes();
			})
			setSizes();
			let self = this;
			document.getElementById('overflow-open').addEventListener('click', function (e) {
				self.open = true;
				this.classList.add('overflow-open_hidden');
			});
			elem.querySelector('.overflow-hide').addEventListener('click', function (e) {
				self.open = false
				document.getElementById('overflow-open').classList.remove('overflow-open_hidden');
			})
		}
	}
})(document.querySelector('.wrapper__overflow'));

let VS = (function () {
	return {
		openNew (vector, index) {
			let elem = document.getElementById('vs-template').cloneNode(true);
			elem.id = '';
			elem.setAttribute('data-index', index);

			[].forEach.call(elem.querySelectorAll('[data-param]'), a => {
				a.setAttribute('data-index', index);
			})

			elem.querySelector(
				`.setting-section:nth-child(${(vector.mode & 4 ? 3 : vector.mode) + 1})`).
			classList.add('setting-section_choosed'); // shifting on 1 because first section is coordinates

			[].forEach.call(elem.querySelectorAll('.setting__label:not([data-param="color"])'),
				a => {
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
				function redraw () {
					a.innerHTML = '';
					a.append( mathInput.convertETH( VM.getVectorsList()[index][`${param}_f`] ) );
				}
				redraw();
				document.addEventListener(`vector${index}Deleted`, function (e) {
					document.removeEventListener('vectorMathChange', redraw);
				}, { once: true });
				document.addEventListener('vectorMathChange', redraw);
				a.oninput = function (symb) {
					document.removeEventListener('vectorMathChange', redraw);
					VM.changeVector( index, param, mathInput.convertHTE(a) );
					document.addEventListener('vectorMathChange', redraw);
				}
			});

			elem.querySelector('.console__info').innerText = `Вектор ${Number(index) + 1}`;

			elem.addEventListener('click', function (e) {
				let t = e.target,
					section;
				if (t.closest('.info')) {
					let setting = t.closest('.setting'),
						param = setting.getAttribute('data-param');
					if (/s[xy]|formule/.test(param)) return;
					if (/v[xy]/.test(param))
						mathInput.insert(`v${Number(setting.getAttribute('data-index')) + 1}${param.slice(1)}`);
					else
						mathInput.insert(`v${Number(setting.getAttribute('data-index')) + 1}${param}`);
					return;
				}
				else if (section = t.closest('.setting-section')) {
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
				})
			}

			elem.querySelector('.setting__label[data-param="rad"]').onclick = function () {
				let index = this.getAttribute('data-index');
				let span = this.querySelector('span');
				span.innerText = span.innerText == 'D' ? 'R' : 'D';
				VM.changeVector(index, 'rad', span.innerText == 'R');
			}

			elem.querySelector('.setting__label[data-param="locked"]').onchange = function () {
				let index = this.getAttribute('data-index');
				VM.changeVector(index, 'locked', this.checked);
			}

			elem.querySelector('.overflow-hide').addEventListener('click', function (e) {
				document.dispatchEvent(new CustomEvent('vs-overflow-hide', {
					detail: {
						index: elem.getAttribute('data-index')
					}
				}))
				elem.remove();
			})

			elem.querySelector('.console').addEventListener('mousedown', function (e) {
				if (e.target.closest('.overflow-hide')) return;
				let consoleElem = e.target.closest('.console');
				let	shiftX = event.clientX - consoleElem.getBoundingClientRect().left,
					shiftY = event.clientY - consoleElem.getBoundingClientRect().top;
				function targetMouseMove (event) {
					event.preventDefault();
					elem.style.top = `${event.pageY - shiftY - 1}px`;
					elem.style.left = `${event.pageX - shiftX - 1}px`;
				};
				elem.classList.add('vs_disconnected');
				document.body.append(elem);
				targetMouseMove(e);

				document.addEventListener('mousemove', targetMouseMove);

				document.addEventListener('mouseup', function mouseUp (e) {
					document.removeEventListener('mousemove', targetMouseMove);
					document.removeEventListener('mouseup', mouseUp);
				});
			})

			return elem;
		}
	}
})();

let vectorList = (function (elem) {
	elem = elem.querySelector('.inner-VList');
	let newVectorBtn = elem.querySelector('.VList__newVector');

	function renderVector (index) {
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
	})

	elem.addEventListener('click', function (e) {
		let target = e.target;
		target = target.closest('.btn');
		if (!target) return;
		if (target.classList.contains('btn')) {
			if (target.classList.contains('VList__newVector')) {
				let newIndex = elem.children.length - 1;
				elem.insertBefore(renderVector(newIndex, newIndex), newVectorBtn);
				VM.newVector();
			}
			else {
				let index = target.getAttribute('data-index');
				let r = mathInput.insert( `v${index}` );
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
})(document.querySelector('.VList'));

let vectorCalc = (function (elem) {
	return {
		render () {
			[].forEach.call(elem.getElementsByClassName('btn'), a => {
				a.style.gridArea = a.getAttribute('data-area');
			});

			elem.querySelector('.buttons').addEventListener('click', function (e) {
				let target = e.target,
					btn = target.closest('.btn');

				if (btn) {
					let attr = btn.getAttribute('data-area');
					if (attr == 'result') {
						let res = mathInput.convertHTE( elem.querySelector('.fi') ).calc();
						if (res instanceof VM.Vector) {
							// draw it on canvas
						}
						else {
							res = res.calc();
							if (/e-/.test(res.toString())) alert(0);
							else alert(res);
						}
					}
					else
						mathInput.insert(btn.getAttribute('data-area'));
				}
			})
		}
	}
})(document.querySelector('.VCalc'));

let errorField = (function (elem) {
	elem = elem.querySelector('.inner-error-field');
	function addNewError(place, error) {
		let template = document.getElementById('error-template').cloneNode(true);
		template.id = '';

		template.querySelector('.error__text-span').innerText = error.message;

		template.querySelector('.error__look-place').addEventListener('click', function () {
			let btn = document.querySelector(`.VList .btn[data-index="${place.index}"]`);
			if (!btn.hasAttribute('data-opened')) {
				btn.dispatchEvent(new Event('click', { target: btn, bubbles: true }));
			}
		});

		elem.append(template);
	}
	return {
		render () {
			/*VM.makeErrProxy(function (place, error) {
				console.log(place, error.name);
			});*/

			document.addEventListener('vectorMathChange', function () {
				setTimeout(function () {
					[].forEach.call(elem.querySelectorAll('.error'), a => {
						a.remove();
					});
					if (VM.errors.size == 0)
						elem.classList.add('inner-error-field_empty');
					else
						elem.classList.remove('inner-error-field_empty');
					for (let key of VM.errors.keys()) {
						addNewError( key, VM.errors.get(key) );
					}
					VM.errors.clear();
				}, 0);
			});
		}
	}
})(document.querySelector('.error-field'));

document.addEventListener('DOMContentLoaded', function () {
	graphics.render0();
	overflow.render();
	vectorCalc.render();
	errorField.render();
});