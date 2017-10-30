import Canvas from './Canvas';

export default class LifeGame {

	constructor(userName, settings) {
		const {
			pointSize,
			fieldX,
			fieldY
		} = settings;

		this.size = {
			point: pointSize,
			field: {
				x: fieldX,
				y: fieldY
			}
		};
		this._user = userName;
		this.step = 0;
		this._state = null;
	}

	init(appendTo = 'canvas') {
		const dimensions = {
			width: this.size.field.x,
			height: this.size.field.y
		};

		this._initDOMField(appendTo, dimensions);
	}

	setState(state) {
		this._state = state;
		this._changeState();
	}

	_changeState() {
		const state = this._state;
		const sizeX = state.length;

		for (let i = 0; i < sizeX; i++) {
			const sizeY = state[i].length;

			for (let j = 0; j < sizeY; j++) {

				const isActive = !!state[i][j];
				const domX = i * this.size.point;
				const domY = j * this.size.point;

				if (isActive) {
					const user = state[i][j].user;
					this._domField.drawBlock(user.color, domX, domY);
				} else {
					this._domField.delBlock(domX, domY);
				}
			}
		}
	}

	send(data) {
		throw new Error('Вы должны имплементировать метод send');
	}

	_initDOMField(appendTo, dimensions) {
		this._domField = new Canvas(appendTo, this.size.point, dimensions);
		this._domField.initField();

		this._domField._canvas.addEventListener('life__mouse_click', (event) => {
			let {x, y} = this._normalizeCoords(event.detail);

			this._render(this._user, x, y);
			this._send(x, y);
		});
	}

	_send(x, y) {
		const user = this._user;
		const data = {
			user,
			affectedPoints: [
				{x, y}
			]
		};

		this.send(data);
	}

	_normalizeCoords(coords) {
		let {x, y} = coords;
		let point = this.size.point;

		let cx = Math.floor(x / point);
		let cy = Math.floor(y / point);
		return {x: cx, y: cy};
	}

	_isNew(x, y) {
		return !this._state[x][y];
	}

	_render(user, x, y) {
		const domX = x * this.size.point;
		const domY = y * this.size.point;

		if (this._isNew(x, y)) {
			this._state[x][y] = {
				user: this._user
			};
			this._domField.drawBlock(user.color, domX, domY);
			return;
		}

		this._state[x][y] = false;
		this._domField.delBlock(domX, domY);
	}
};
