export default class Canvas {

	constructor(appendTo, pointSize, dimensions) {
		this._pointSize = pointSize;

		this._canvas = document.createElement('canvas');
		this._canvas.setAttribute('width', dimensions.width);
		this._canvas.setAttribute('height', dimensions.height);

		this._context = this._canvas.getContext('2d');

		const clickFn = this._mouseClick.bind(this);
		this._canvas.addEventListener('mousedown', clickFn);
		this._appendTo(appendTo);
	}

	initField(lineSize = 0.5, lineColor = '#000') {
		const size = {
			x: this._canvas.width / this._pointSize,
			y: this._canvas.height / this._pointSize
		};

		for (let type of 'xy') {
			for (let i = 0; i <= size[type]; i++) {
				let x1;
				let x2;
				let y1;
				let y2;

				if (type === 'x') {
					x1 = x2 = i * this._pointSize;
					y1 = 0;
					y2 = this._canvas.height;
				} else {
					x1 = 0;
					x2 = this._canvas.width;
					y1 = y2 = i * this._pointSize;
				}

				this._drawLine(x1, y1, x2, y2, lineSize, lineColor);
			}
		}

		this._pointSize -= lineSize * 2;
	}

	_appendTo(elem) {
		const container = document.getElementById(elem);

		container.appendChild(this._canvas);
	}

	_mouseClick(event) {
		let [x, y] = this._getClickCoordsFromEvent(event);

		this._trigger('_canvas', 'life__mouse_click', {x, y});
	}

	_trigger(ctx, eventName, data) {
		const event = new CustomEvent(eventName, {
			detail: data
		});
		this[ctx].dispatchEvent(event);
	}

	_getClickCoordsFromEvent(event) {
		let x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		let y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;

		x -= this._canvas.offsetLeft;
		y -= this._canvas.offsetTop;

		return [x, y];
	}

	drawBlock(color, x, y) {
		this._context.fillStyle = color || '#a9cff5';
		this._context.fillRect(x, y, this._pointSize, this._pointSize);
	}

	delBlock(x, y) {
		this._context.clearRect(x, y, this._pointSize, this._pointSize);
	}

	_drawLine(x1, y1, x2, y2, linewidth, strokestyle) {
		this._context.beginPath();
		this._context.lineWidth = linewidth;
		this._context.strokeStyle = strokestyle;
		this._context.moveTo(x1, y1);
		this._context.lineTo(x2, y2);
		this._context.stroke();
	}
};
