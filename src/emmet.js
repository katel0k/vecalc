module.exports = function (Exp){
	function DOM(Exp) {
		function build (Exp) {
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
}