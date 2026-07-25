import { CSSRGBA } from '@/util/color-utils.ts';
import { getVariable } from '@/util/safe.ts';
import { GameLocal } from '@/local/local-object.ts';
import { Printer } from '@/printer/printer.ts';
import { UI } from './ui-window.ts';
import { Texture } from '@/webgl/texture.ts';
import { GL } from '@/webgl/webgl-init.ts';

UI.Text = class TextElement extends UI.Element {
	texture: Texture | null;
	printer: Printer | null;
	_direction: string;
	_horizontalAlign: string;
	_verticalAlign: string;
	_content: string;
	_rawContent: string;
	_size: number;
	_lineSpacing: number;
	_letterSpacing: number;
	_color: string;
	_font: string;
	style: string;
	weight: string;
	_typeface: string;
	_effect: object;
	wordWrap: boolean;
	truncate: boolean;
	_overflow: string;
	textOuterX: number;
	textOuterY: number;
	textOuterWidth: number;
	textOuterHeight: number;
	blend: string;

	static globalVarRegexp = /<global(::?)([0-9a-f]{16})>/g;

	static replaceGlobalVariable(text: any) {
		return text.replace(this.globalVarRegexp, (match, delimiter, varId) => {
			const name = getVariable(varId)?.name;
			const sign = delimiter === '::' ? '@' : '';
			return name ? `<color:f0d0ff>${sign}${name}</color>` : match;
		});
	}

	constructor(data: any) {
		super(data);
		this.texture = null;
		this.printer = null;
		this.direction = data.direction ?? 'horizontal-tb';
		this.horizontalAlign = data.horizontalAlign ?? 'left';
		this.verticalAlign = data.verticalAlign ?? 'middle';
		this.content = data.content ?? '';
		this.size = data.size ?? 12;
		this.lineSpacing = data.lineSpacing ?? 0;
		this.letterSpacing = data.letterSpacing ?? 0;
		this.color = data.color ?? 'ffffffff';
		this.font = data.font ?? '';
		this.style = null;
		this.weight = null;
		this.typeface = data.typeface ?? 'regular';
		this.effect = data.effect ?? { type: 'none' };
		this.wordWrap = false;
		this.truncate = false;
		this.overflow = data.overflow ?? 'visible';
		this.textOuterX = 0;
		this.textOuterY = 0;
		this.textOuterWidth = 0;
		this.textOuterHeight = 0;
		this.blend = data.blend ?? 'normal';
	}

	get direction() {
		return this._direction;
	}

	set direction(value: any) {
		if (this._direction !== value) {
			this._direction = value;
			if (this.printer) {
				this.printer.reset();
				this.printer.direction = value;
			}
		}
	}

	get horizontalAlign() {
		return this._horizontalAlign;
	}

	set horizontalAlign(value: any) {
		if (this._horizontalAlign !== value) {
			switch (value) {
				case 'left':
				case 'center':
				case 'right':
					break;
				default:
					return;
			}
			this._horizontalAlign = value;
			if (this.printer) {
				this.printer.reset();
				this.printer.horizontalAlign = value;
			}
		}
	}

	get verticalAlign() {
		return this._verticalAlign;
	}

	set verticalAlign(value: any) {
		if (this._verticalAlign !== value) {
			switch (value) {
				case 'top':
				case 'middle':
				case 'bottom':
					break;
				default:
					return;
			}
			this._verticalAlign = value;
			if (this.printer) {
				this.printer.reset();
				this.printer.verticalAlign = value;
			}
		}
	}

	get content() {
		return this._content;
	}

	set content(value: any) {
		// 需要刷新语言包中的内容，不做差异判断
		this._rawContent = value;
		this._content = TextElement.replaceGlobalVariable(GameLocal.replace(value));
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

	get lineSpacing() {
		return this._lineSpacing;
	}

	set lineSpacing(value: any) {
		if (this._lineSpacing !== value) {
			this._lineSpacing = value;
			if (this.printer) {
				this.printer.reset();
				this.printer.lineSpacing = value;
			}
		}
	}

	get letterSpacing() {
		return this._letterSpacing;
	}

	set letterSpacing(value: any) {
		if (this._letterSpacing !== value) {
			this._letterSpacing = value;
			if (this.printer) {
				this.printer.reset();
				this.printer.letterSpacing = value;
			}
		}
	}

	get color() {
		return this._color;
	}

	set color(value: any) {
		if (this._color !== value) {
			this._color = value;
			if (this.printer) {
				this.printer.reset();
				this.printer.colors[0] = CSSRGBA(value);
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

	get typeface() {
		return this._typeface;
	}

	set typeface(value: any) {
		if (this._typeface !== value) {
			switch (value) {
				case 'regular':
					this.style = 'normal';
					this.weight = 'normal';
					break;
				case 'bold':
					this.style = 'normal';
					this.weight = 'bold';
					break;
				case 'italic':
					this.style = 'italic';
					this.weight = 'normal';
					break;
				case 'bold-italic':
					this.style = 'italic';
					this.weight = 'bold';
					break;
				default:
					return;
			}
			this._typeface = value;
			if (this.printer) {
				this.printer.reset();
				this.printer.styles[0] = this.style;
				this.printer.weights[0] = this.weight;
			}
		}
	}

	get effect() {
		return this._effect;
	}

	set effect(value: any) {
		this._effect = value;
		if (this.printer) {
			this.printer.reset();
			this.printer.effects[0] = Printer.parseEffect(value);
		}
	}

	get overflow() {
		return this._overflow;
	}

	set overflow(value: any) {
		if (this._overflow !== value) {
			this._overflow = value;
			switch (value) {
				case 'visible':
					this.wordWrap = false;
					this.truncate = false;
					break;
				case 'wrap':
					this.wordWrap = true;
					this.truncate = false;
					break;
				case 'truncate':
					this.wordWrap = false;
					this.truncate = true;
					break;
				case 'wrap-truncate':
					this.wordWrap = true;
					this.truncate = true;
					break;
			}
			if (this.printer) {
				this.printer.reset();
				this.printer.wordWrap = this.wordWrap;
				this.printer.truncate = this.truncate;
			}
		}
	}

	update() {
		let printer = this.printer;
		if (printer === null) {
			const texture = new Texture();
			printer = new Printer(texture);
			printer.direction = this.direction;
			printer.horizontalAlign = this.horizontalAlign;
			printer.verticalAlign = this.verticalAlign;
			printer.sizes[0] = this.size;
			printer.lineSpacing = this.lineSpacing;
			printer.letterSpacing = this.letterSpacing;
			printer.colors[0] = CSSRGBA(this.color);
			printer.fonts[0] = this.font || Printer.font;
			printer.styles[0] = this.style;
			printer.weights[0] = this.weight;
			printer.effects[0] = Printer.parseEffect(this.effect);
			printer.wordWrap = this.wordWrap;
			printer.truncate = this.truncate;
			this.texture = texture;
			this.printer = printer;
		}
		if (
			printer.content !== this.content ||
			(printer.wordWrap &&
				(printer.horizontal
					? printer.printWidth !== this.width
					: printer.printHeight !== this.height)) ||
			(printer.truncate &&
				(printer.horizontal
					? printer.printHeight !== this.height
					: printer.printWidth !== this.width))
		) {
			this.updatePrinter();
		}
	}

	updateTextContent() {
		const content = this._rawContent;
		this._rawContent = '';
		this.content = content;
	}

	updatePrinter() {
		const { printer } = this;
		if (printer) {
			if (printer.content) {
				printer.reset();
			}
			printer.setPrintArea(this.width, this.height);
			printer.draw(this.content);
			this.calculateTextPosition();
		}
	}

	draw() {
		if (this.visible === false) {
			return this.drawChildren();
		}

		this.update();

		if (this.content) {
			GL.alpha = this.opacity;
			GL.blend = this.blend;
			GL.matrix.set(UI.matrix).multiply(this.matrix);
			GL.drawImage(
				this.texture,
				this.textOuterX,
				this.textOuterY,
				this.textOuterWidth,
				this.textOuterHeight
			);

			for (const image of this.printer.images) {
				image.draw();
			}
		}

		this.drawChildren();
	}

	resize() {
		if (this.parent instanceof UI.Window) {
			return this.parent.requestResizing();
		}
		if (this.printer) {
			this.printer.images.changed = true;
		}
		this.calculatePosition();
		this.calculateTextPosition();
		this.resizeChildren();
	}

	calculateTextPosition() {
		const printer = this.printer;
		if (printer !== null) {
			const scale = Printer.scale;
			const pl = printer.paddingLeft / scale;
			const pt = printer.paddingTop / scale;
			const pr = printer.paddingRight / scale;
			const pb = printer.paddingBottom / scale;
			const outerX = this.x - pl;
			const outerY = this.y - pt;
			const outerWidth = this.texture.width / scale;
			const outerHeight = this.texture.height / scale;
			const innerWidth = outerWidth - pl - pr;
			const innerHeight = outerHeight - pt - pb;
			const marginWidth = this.width - innerWidth;
			const marginHeight = this.height - innerHeight;
			const factorX = printer.alignmentFactorX;
			const factorY = printer.alignmentFactorY;
			const offsetX = marginWidth * factorX;
			const offsetY = marginHeight * factorY;
			this.textOuterX = outerX + offsetX;
			this.textOuterY = outerY + offsetY;
			this.textOuterWidth = outerWidth;
			this.textOuterHeight = outerHeight;

			this.resizeEmbeddedImages(offsetX, offsetY);
		}
	}

	resizeEmbeddedImages(offsetX: any, offsetY: any) {
		const images = this.printer.images;
		if (images.changed) {
			images.changed = false;
			for (const image of images) {
				const transform = image.transform;
				transform.x = image.startX + offsetX;
				transform.y = image.startY + offsetY;
				image.parent = this;
				image.connected = true;
				image.resize();
			}
		}
	}

	destroy() {
		super.destroy();
		this.texture?.destroy();
		this.printer?.destroy();
		this.destroyChildren();
	}
};
