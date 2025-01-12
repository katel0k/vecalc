module.exports = function SVGE(name, options) {
	var self = this,
		NS = 'http://www.w3.org/2000/svg',
		elem = this.elem = document.createElementNS(NS, name),
		nr = '\\d+(?:[.,]\\d+)?', // regexp on numbers
		translate = `translate\\(${nr}, ${nr}\\)`, // translate(num, num)
		rotate = `rotate\\(${nr}\\)`, // rotate(num)
		scale = `scale\\(${nr}\\)`, // scale(num)
		regexp = new RegExp(`${translate}|${rotate}|${scale}`, 'gi'); // just concatination

	if (typeof options == 'object') 
		for (var key in options) 
			elem.setAttribute(key, options[key]);

	function trans (name, args) {
		var prevVal = elem.getAttribute('transform');
		elem.setAttribute('transform', `${prevVal ? prevVal + ' ' : ''}${name}(${args instanceof Array ? args.join(', ') : args})`);
		return self;
	}

	for (var key in obj = {
		append (child, options) {
			if (typeof child == 'string') {
				var newElem = new SVGE(child, options);
				elem.appendChild(newElem.elem);
			}
			else elem.appendChild(child);
			return self;
		},

		transform (value) {
			if (typeof value == 'object') 
				for (var key in value) 
					self[key]( value[key] );
			else
				while (res = regexp.exec(value)) {
					var nums = res[0].match(new RegExp(nr, 'g')),
						trans = res[0].slice(0, res[0].match(/\w+/)[0].length);
					self[trans](...nums); // вызов нужной функции с передачей параметров
				}
		},

		translate (x, y) { return trans('translate', [x, y]) },
		rotate (ang) { return trans('rotate', ang) },
		scale (value) { return trans('scale', value) },

		remove (child) {
			elem.removeChild(child);
		}
	}) this[key] = obj[key]; // присвоение нужных св-в
}

// to add element you need to make this construction: elem.appendChild(SVGE.elem)