import { INTRGBA } from '@/util/color-utils.ts';
import { Printer } from '@/printer/printer.ts';
import { UI } from './ui-window.ts';
import { Texture } from '@/webgl/texture.ts';
import { GL } from '@/webgl/webgl-init.ts';

UI.TextBox = class TextBoxElement extends UI.Element {
	focusing: boolean;
	texture: Texture | null;
	_type: string;
	_align: string;
	content: string;
	text: string;
	maxLength: number;
	number: number;
	min: number;
	max: number;
	decimals: number;
	_padding: number;
	_size: number;
	_font: string;
	_color: string;
	_colorInt: number;
	textX: number;
	textY: number;
	textWidth: number;
	textShiftY: number;
	innerWidth: number;
	innerHeight: number;
	selectionY: number;
	selectionWidth: number;
	selectionHeight: number;
	_selectionColor: string;
	_selectionColorInt: number;
	_selectionBgColor: string;
	_selectionBgColorInt: number;
	printer: Printer | null;

	constructor(data: any) {
		super(data);
		this.focusing = false;
		this.texture = null;
		this.align = data.align;
		this.text = data.text;
		this.maxLength = data.maxLength;
		this.number = data.number;
		this.min = data.min;
		this.max = data.max;
		this.decimals = data.decimals;
		this.type = data.type;
		this.padding = data.padding;
		this.size = data.size;
		this.font = data.font;
		this.color = data.color;
		this.textX = null;
		this.textY = null;
		this.textWidth = null;
		this.textShiftY = null;
		this.innerWidth = null;
		this.innerHeight = null;
		this.selectionY = null;
		this.selectionWidth = null;
		this.selectionHeight = null;
		this.selectionColor = data.selectionColor;
		this.selectionBgColor = data.selectionBgColor;
		this.printer = null;
	}

	get type() {
		return this._type;
	}

	set type(value: any) {
		if (this._type !== value) {
			this._type = value;
			switch (value) {
				case 'text':
					this.content = this.text;
					break;
				case 'number':
					this.content = this.number.toString();
					break;
			}
		}
	}

	get align() {
		return this._align;
	}

	set align(value: any) {
		this._align = value;
		if (this.connected) {
			this.calculateTextPosition();
		}
	}

	get padding() {
		return this._padding;
	}

	set padding(value: any) {
		if (this._padding !== value) {
			this._padding = value;
			if (this.connected) {
				this.calculateTextPosition();
			}
		}
	}

	get size() {
		return this._size;
	}

	set size(value: any) {
		if (this._size !== value) {
			this._size = value;
			if (this.printer) {
				this.printer.reset();
				this.printer.sizes[0] = value;
			}
		}
	}

	get font() {
		return this._font;
	}

	set font(value: any) {
		if (this._font !== value) {
			this._font = value;
			if (this.printer) {
				this.printer.reset();
				this.printer.fonts[0] = value || Printer.font;
			}
		}
	}

	get color() {
		return this._color;
	}

	set color(value: any) {
		if (this._color !== value) {
			this._color = value;
			this._colorInt = INTRGBA(value);
		}
	}

	get selectionColor() {
		return this._selectionColor;
	}

	set selectionColor(value: any) {
		if (this._selectionColor !== value) {
			this._selectionColor = value;
			this._selectionColorInt = INTRGBA(value);
		}
	}

	get selectionBgColor() {
		return this._selectionBgColor;
	}

	set selectionBgColor(value: any) {
		if (this._selectionBgColor !== value) {
			this._selectionBgColor = value;
			this._selectionBgColorInt = INTRGBA(value);
		}
	}

	update() {
		let printer = this.printer;
		if (printer === null) {
			const texture = new Texture();
			printer = new Printer(texture);
			printer.matchTag = Function.empty as () => boolean;
			printer.sizes[0] = this.size;
			printer.fonts[0] = this.font || Printer.font;
			printer.colors[0] = '#ffffff';
			printer.effects[0] = { type: 'none' };
			this.texture = texture;
			this.printer = printer;
		}
		if (printer.content !== this.content) {
			this.updatePrinter();
		}
	}

	updatePrinter() {
		const { printer } = this;
		if (printer) {
			if (printer.content) {
				printer.reset();
			}
			printer.draw(this.content);
			if (this.connected) {
				this.calculateTextPosition();
			}
		}
	}

	draw() {
		if (this.visible === false) {
			return this.drawChildren();
		}

		this.update();

		GL.alpha = this.opacity;
		GL.blend = 'normal';
		GL.matrix.set(UI.matrix).multiply(this.matrix);

		const { scale } = Printer;
		const { texture } = this;
		if (texture !== null) {
			if (UI.hover === this.node) {
				const dx = this.textX;
				const dy = this.selectionY;
				const dw = this.selectionWidth;
				const dh = this.selectionHeight;
				GL.fillRect(dx, dy, dw, dh, this._selectionBgColorInt);
				const sy = this.textShiftY;
				const sw = Math.min(this.textWidth, this.innerWidth);
				const sh = this.innerHeight;
				texture.clip(0, sy * scale, sw * scale, sh * scale);
				GL.drawImageWithColor(
					texture,
					this.textX,
					this.textY,
					sw,
					sh,
					this._selectionColorInt
				);
			} else {
				if (this.content) {
					const sy = this.textShiftY;
					const sw = Math.min(this.textWidth, this.innerWidth);
					const sh = this.innerHeight;
					texture.clip(0, sy * scale, sw * scale, sh * scale);
					GL.drawImageWithColor(texture, this.textX, this.textY, sw, sh, this._colorInt);
				}
			}
		}

		this.drawChildren();
	}

	resize() {
		if (this.parent instanceof UI.Window) {
			return this.parent.requestResizing();
		}
		this.calculatePosition();
		this.calculateTextPosition();
		this.resizeChildren();
	}

	calculateTextPosition() {
		if (this.texture) {
			const scale = Printer.scale;
			const printer = this.printer;
			const size = printer.sizes[0];
			const vpadding = (this.height - size) / 2;
			const paddingTop = printer.paddingTop / scale;
			const textWidth = this.texture.base.width / scale;
			const textHeight = this.texture.base.height / scale;
			this.textX = this.x + this.padding;
			this.textY = this.y + Math.max(vpadding - paddingTop, 0);
			this.textWidth = textWidth;
			this.textShiftY = Math.max(paddingTop - vpadding, 0);
			this.innerWidth = Math.max(this.width - this.padding * 2, 0);
			this.innerHeight = Math.min(this.height + this.y - this.textY, textHeight);
			this.selectionY = this.y + Math.max(vpadding, 0);
			this.selectionWidth = Math.min(this.innerWidth, printer.width / scale);
			this.selectionHeight = Math.min(this.height, size);
			switch (this.align) {
				case 'center':
					if (textWidth < this.innerWidth) {
						this.textX += (this.innerWidth - textWidth) / 2;
					}
					break;
				case 'right':
					if (textWidth < this.innerWidth) {
						this.textX += this.innerWidth - textWidth + 1;
					}
					break;
			}
			const scaleX = Math.max(this.transform.scaleX, 1);
			const scaleY = Math.max(this.transform.scaleY, 1);
			this.textX = Math.round(this.textX * scaleX) / scaleX;
			this.textY = Math.round(this.textY * scaleY) / scaleY;
		}
	}

	destroy() {
		super.destroy();
		this.texture?.destroy();
		this.destroyChildren();
	}
};
