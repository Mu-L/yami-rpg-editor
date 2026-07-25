import { CSSRGBA } from '@/util/color-utils.ts';
import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { GL } from '@/webgl/webgl-init.ts';
import { Texture } from '@/webgl/texture.ts';
import { UI } from '@/ui/ui-window.ts';
import { Title } from '@/title/title-bar.ts';

export class Printer {
	texture: any | null;
	// images 运行时挂载 .changed 标志（L56/L200/L469 读写）
	images: any[] & { changed?: boolean };
	canvas: HTMLCanvasElement;
	// CanvasRenderingContext2D 运行时挂载 .paddingItalic/.paddingVertical/.size 扩展（printer 内赋值）
	context:
		| (CanvasRenderingContext2D & {
				paddingItalic?: number;
				paddingVertical?: number;
				size?: number;
				[k: string]: any;
		  })
		| null;
	content: string;
	buffer: string;
	x: number;
	y: number;
	width: number;
	height: number;
	index: number;
	wrapEnd: number;
	commands: any[];
	paddingLeft: number;
	paddingTop: number;
	paddingRight: number;
	paddingBottom: number;
	lineHeight: number;
	lineSpacing: number;
	letterSpacing: number;
	breakable: boolean;
	_direction: string;
	_horizontalAlign: string;
	_verticalAlign: string;
	horizontal: boolean;
	alignmentFactorX: number;
	alignmentFactorY: number;
	wordWrap: boolean;
	truncate: boolean;
	printWidth: number;
	printHeight: number;
	fonts: any[];
	styles: any[];
	weights: any[];
	sizes: any[];
	colors: any[];
	effects: any[];

	constructor(texture: Texture) {
		texture.base.printer = this;
		texture.base.onRestore = Printer.restoreTexture;
		this.texture = texture;
		this.images = [];
		this.images.changed = false;
		this.canvas = document.createElement('canvas');
		this.canvas.width = 0;
		this.canvas.height = 0;
		this.context = this.canvas.getContext('2d');
		this.content = '';
		this.buffer = '';
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.index = 0;
		this.wrapEnd = 0;
		this.commands = null;
		this.paddingLeft = 0;
		this.paddingTop = 0;
		this.paddingRight = 0;
		this.paddingBottom = 0;
		this.lineHeight = 0;
		this.lineSpacing = 0;
		this.letterSpacing = 0;
		this.breakable = false;
		this.direction = 'horizontal-tb';
		this.horizontalAlign = 'left';
		this.verticalAlign = 'top';
		this.wordWrap = false;
		this.truncate = false;
		this.printWidth = Infinity;
		this.printHeight = Infinity;
		this.fonts = [Printer.font];
		this.styles = ['normal'];
		this.weights = ['normal'];
		this.sizes = [Printer.size];
		this.colors = [Printer.color];
		this.effects = [Printer.effect];
	}

	get direction() {
		return this._direction;
	}

	set direction(value: any) {
		this._direction = value;
		switch (value) {
			case 'horizontal-tb':
				this.horizontal = true;
				break;
			case 'vertical-lr':
			case 'vertical-rl':
				this.horizontal = false;
				break;
		}
	}

	get horizontalAlign() {
		return this._horizontalAlign;
	}

	set horizontalAlign(value: any) {
		this._horizontalAlign = value;
		switch (value) {
			case 'left':
				this.alignmentFactorX = 0;
				break;
			case 'center':
				this.alignmentFactorX = 0.5;
				break;
			case 'right':
				this.alignmentFactorX = 1;
				break;
		}
	}

	get verticalAlign() {
		return this._verticalAlign;
	}

	set verticalAlign(value: any) {
		this._verticalAlign = value;
		switch (value) {
			case 'top':
				this.alignmentFactorY = 0;
				break;
			case 'middle':
				this.alignmentFactorY = 0.5;
				break;
			case 'bottom':
				this.alignmentFactorY = 1;
				break;
		}
	}

	reset() {
		this.destroy();
		this.content = '';
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.index = 0;
		this.wrapEnd = 0;
		this.lineHeight = 0;
		this.breakable = false;
		const fonts = this.fonts;
		const styles = this.styles;
		const weights = this.weights;
		const sizes = this.sizes;
		const colors = this.colors;
		const effects = this.effects;
		if (fonts.length !== 1) {
			this.fonts = [fonts[fonts.length - 1]];
		}
		if (styles.length !== 1) {
			this.styles = [styles[styles.length - 1]];
		}
		if (weights.length !== 1) {
			this.weights = [weights[weights.length - 1]];
		}
		if (sizes.length !== 1) {
			this.sizes = [sizes[sizes.length - 1]];
		}
		if (colors.length !== 1) {
			this.colors = [colors[colors.length - 1]];
		}
		if (effects.length !== 1) {
			this.effects = [effects[effects.length - 1]];
		}
		return this;
	}

	destroy() {
		if (this.images.length !== 0) {
			for (const imageElement of this.images) {
				imageElement.destroy();
			}
			this.images.length = 0;
			this.images.changed = true;
		}
	}

	getRawX() {
		return this.x / Printer.scale;
	}

	getRawY() {
		return this.y / Printer.scale;
	}

	getScaledSize() {
		return this.sizes[0] * Printer.scale * Printer.sizeScale;
	}

	getScaledLineSpacing() {
		return this.lineSpacing * Printer.scale;
	}

	getScaledLetterSpacing() {
		return this.letterSpacing * Printer.scale;
	}

	getScaledPrintWidth() {
		return this.printWidth * Printer.scale;
	}

	getScaledPrintHeight() {
		return this.printHeight * Printer.scale;
	}

	setPrintArea(width: any, height: any) {
		this.printWidth = width;
		this.printHeight = height;
	}

	setPadding(pl: any, pt: any, pr: any, pb: any) {
		this.paddingLeft = pl;
		this.paddingTop = pt;
		this.paddingRight = pr;
		this.paddingBottom = pb;
	}

	updateFont() {
		const style = this.styles[0];
		const weight = this.weights[0];
		const size = this.getScaledSize();
		const family = this.fonts.join(', ');
		const context = this.context;
		context.font = `${style} normal ${weight} ${size}px ${family}`;
		context.paddingItalic = style === 'italic' ? Math.ceil(size / 4) : 0;
		context.paddingVertical = Math.ceil(size / 10);
		context.size = size;
	}

	calculatePadding() {
		const context = this.context;
		const effect = this.effects[0];
		const { paddingItalic } = context;
		const { paddingVertical } = context;
		switch (effect.type) {
			case 'none':
				this.paddingLeft = Math.max(paddingItalic / 4 - this.x, this.paddingLeft);
				this.paddingTop = Math.max(paddingVertical - this.y, this.paddingTop);
				this.paddingRight = Math.max(paddingItalic, this.paddingRight);
				this.paddingBottom = Math.max(paddingVertical, this.paddingBottom);
				break;
			case 'shadow': {
				const shadowOffsetX = effect.shadowOffsetX * Printer.scale;
				const shadowOffsetY = effect.shadowOffsetY * Printer.scale;
				const shadowOffsetLeft = Math.max(-shadowOffsetX, 0);
				const shadowOffsetTop = Math.max(-shadowOffsetY, 0);
				const shadowOffsetRight = Math.max(shadowOffsetX, 0);
				const shadowOffsetBottom = Math.max(shadowOffsetY, 0);
				this.paddingLeft = Math.max(
					shadowOffsetLeft + paddingItalic / 4 - this.x,
					this.paddingLeft
				);
				this.paddingTop = Math.max(
					shadowOffsetTop + paddingVertical - this.y,
					this.paddingTop
				);
				this.paddingRight = Math.max(shadowOffsetRight + paddingItalic, this.paddingRight);
				this.paddingBottom = Math.max(
					shadowOffsetBottom + paddingVertical,
					this.paddingBottom
				);
				break;
			}
			case 'stroke': {
				const halfWidth = Math.ceil(effect.strokeWidth / 2) * Printer.scale;
				this.paddingLeft = Math.max(
					halfWidth + paddingItalic / 4 - this.x,
					this.paddingLeft
				);
				this.paddingTop = Math.max(halfWidth + paddingVertical - this.y, this.paddingTop);
				this.paddingRight = Math.max(halfWidth + paddingItalic, this.paddingRight);
				this.paddingBottom = Math.max(halfWidth + paddingVertical, this.paddingBottom);
				break;
			}
			case 'outline': {
				const offset = Printer.scale;
				this.paddingLeft = Math.max(offset + paddingItalic / 4 - this.x, this.paddingLeft);
				this.paddingTop = Math.max(offset + paddingVertical - this.y, this.paddingTop);
				this.paddingRight = Math.max(offset + paddingItalic, this.paddingRight);
				this.paddingBottom = Math.max(offset + paddingVertical, this.paddingBottom);
				break;
			}
		}
	}

	measureWidth(string: any) {
		if (this.horizontal) {
			return this.context.measureText(string).width;
		} else {
			return this.getScaledSize() * string.length;
		}
	}

	measureHeight(string: any) {
		if (this.horizontal) {
			return this.getScaledSize();
		} else {
			let height = 0;
			const context = this.context;
			const length = string.length;
			for (let i = 0; i < length; i++) {
				height = Math.max(height, context.measureText(string[i]).width);
			}
			return height;
		}
	}

	drawBuffer() {
		const string = this.buffer;
		if (string === '') return;
		this.calculatePadding();

		const context = this.context;
		const color = this.colors[0];
		const effect = this.effects[0];
		const horizontal = this.horizontal;
		let measureWidth = Printer.lineWidth;
		if (measureWidth === 0) {
			measureWidth = this.measureWidth(string);
		}
		const measureHeight = this.measureHeight(string);
		const commands = this.commands;
		const command = Printer.fetchCommand();
		commands.push(command);
		command.string = string;
		command.x = this.x;
		command.y = this.y;
		command.font = context.font;
		command.size = context.size;
		command.color = color;
		command.effect = effect;
		command.horizontalWidth = horizontal ? measureWidth : measureHeight;
		command.drawingMethod = Printer[Printer.drawingMethods[effect.type]];

		Printer.lineWidth = 0;

		this.buffer = '';
		this.breakable = true;
		if (horizontal) {
			this.x += measureWidth;
			this.lineHeight = Math.max(this.lineHeight, measureHeight);
			this.width = Math.max(this.width, this.x);
			this.height = Math.max(this.height, this.y + this.lineHeight);
		} else {
			this.y += measureWidth;
			this.lineHeight = Math.max(this.lineHeight, measureHeight);
			this.width = Math.max(this.width, this.x + this.lineHeight);
			this.height = Math.max(this.height, this.y);
		}
	}

	loadImage(guid: any, clip: any, width: any, height: any) {
		if (width * height === 0) return;

		const horizontal = this.horizontal;
		const imageWidth = width * Printer.scale;
		const imageHeight = height * Printer.scale;
		const letterSpacing = this.getScaledLetterSpacing();
		if (
			this.wordWrap &&
			this.breakable &&
			(horizontal
				? this.x + Printer.lineWidth + imageWidth > this.getScaledPrintWidth()
				: this.y + Printer.lineWidth + imageHeight > this.getScaledPrintHeight())
		) {
			this.newLine();
		}

		const imageElement = new UI.Image(new Inspector.uiText.create());
		imageElement.startX = this.getRawX();
		imageElement.startY = this.getRawY();
		imageElement.image = guid;
		imageElement.transform.x = imageElement.startX;
		imageElement.transform.y = imageElement.startY;
		imageElement.transform.width = width;
		imageElement.transform.height = height;
		if (clip) {
			imageElement.display = 'clip';
			imageElement.clip.set(clip);
		}
		this.images.push(imageElement);
		this.images.changed = true;

		const commands = this.commands;
		const command = Printer.fetchCommand();
		commands.push(command);
		command.x = this.x;
		command.y = this.y;
		command.image = imageElement;
		command.imageWidth = imageWidth;
		command.imageHeight = imageHeight;
		command.imageSpacing = (horizontal ? imageWidth : imageHeight) + letterSpacing;
		command.drawingMethod = Function.empty;

		this.breakable = true;
		// 根据不同的文本方向，计算下一个位置、行高、文本区域宽度、文本区域高度
		if (horizontal) {
			this.x += imageWidth + letterSpacing;
			this.lineHeight = Math.max(this.lineHeight, imageHeight);
			this.width = Math.max(this.width, this.x);
			this.height = Math.max(this.height, this.y + this.lineHeight);
		} else {
			this.y += imageHeight + letterSpacing;
			this.lineHeight = Math.max(this.lineHeight, imageWidth);
			this.width = Math.max(this.width, this.x + this.lineHeight);
			this.height = Math.max(this.height, this.y);
		}
	}

	computeTextPosition() {
		switch (this.direction) {
			case 'horizontal-tb':
			case 'vertical-lr':
				break;
			case 'vertical-rl': {
				const commands = this.commands;
				const length = commands.length;
				let x = this.width;
				let index = 0;
				let lineX;
				let lineHeight;
				for (let i = 0; i < length; i++) {
					const command = commands[i];
					if (lineX !== command.x) {
						while (index < i) {
							const command = commands[index++];
							command.x = x - lineHeight;
							if (command.image) {
								command.image.startX = command.x / Printer.scale;
								command.image.transform.x = command.image.startX;
							}
						}
						if (lineX !== undefined) {
							x -= command.x - lineX;
						}
						lineX = command.x;
						lineHeight = 0;
					}
					lineHeight = Math.max(lineHeight, command.horizontalWidth, command.imageWidth);
				}
				while (index < length) {
					const command = commands[index++];
					command.x = x - lineHeight;
					if (command.image) {
						command.image.startX = command.x / Printer.scale;
						command.image.transform.x = command.image.startX;
					}
				}
				break;
			}
		}
		if (this.horizontal) {
			const factor = this.alignmentFactorX;
			if (factor !== 0) {
				const commands = this.commands;
				const letterSpacing = this.getScaledLetterSpacing();
				const lineWidth = this.width + letterSpacing;
				let lineX;
				let lineY;
				for (let i = commands.length - 1; i >= 0; i--) {
					const command = commands[i];
					if (lineY !== command.y) {
						lineY = command.y;
						lineX =
							factor *
							(lineWidth -
								command.x -
								command.imageSpacing -
								command.horizontalWidth);
					}
					command.x += lineX;
					if (command.image) {
						command.image.startX += lineX / Printer.scale;
						command.image.transform.x = command.image.startX;
					}
				}
			}
		} else {
			const factor = this.alignmentFactorY;
			if (factor !== 0) {
				const commands = this.commands;
				const letterSpacing = this.getScaledLetterSpacing();
				const lineWidth = this.height + letterSpacing;
				let lineX;
				let lineY;
				for (let i = commands.length - 1; i >= 0; i--) {
					const command = commands[i];
					if (lineX !== command.x) {
						lineX = command.x;
						lineY =
							factor *
							(lineWidth -
								command.y -
								command.imageSpacing -
								command.string.length * (command.size + letterSpacing));
					}
					command.y += lineY;
					if (command.image) {
						command.image.startY += lineY / Printer.scale;
						command.image.transform.y = command.image.startY;
					}
				}
			}
		}
	}

	executeCommands() {
		const context = this.context;
		const commands = this.commands;
		const length = commands.length;
		const horizontal = this.horizontal;
		const paddingLeft = this.paddingLeft;
		const paddingTop = this.paddingTop;
		const letterSpacing = this.getScaledLetterSpacing();
		const charWidths = Printer.charWidths;
		let charIndex = 0;
		for (let i = 0; i < length; i++) {
			const command = commands[i];
			const string = command.string;
			const drawingMethod = command.drawingMethod;
			command.x += paddingLeft;
			command.y += paddingTop;
			if (horizontal) {
				if (letterSpacing !== 0) {
					const length = string.length;
					for (let i = 0; i < length; i++) {
						const charWidth = charWidths[charIndex++];
						drawingMethod(context, command, string[i]);
						command.x += charWidth + letterSpacing;
					}
				} else {
					drawingMethod(context, command, string);
				}
			} else {
				const size = command.size;
				const length = string.length;
				for (let i = 0; i < length; i++) {
					drawingMethod(context, command, string[i]);
					command.y += size + letterSpacing;
				}
			}
		}
		this.commands = null;
		this.texture.fromImage(this.canvas);

		Printer.resetCommands();
	}

	isWrapOverflowing() {
		const { content } = this;
		const { length } = content;
		let string = '';
		let wrapEnd = length;
		outer: for (let i = this.index; i < length; i++) {
			const char = content[i];
			switch (char) {
				case ' ':
				case '-':
				case '\n':
				case '<':
					while (++i < length && content[i] === char) {}
					wrapEnd = i;
					break outer;
			}
			string += char;
		}
		this.wrapEnd = wrapEnd;
		return string === ''
			? false
			: this.horizontal
				? this.x + Printer.lineWidth + this.measureWidth(string) >
					this.getScaledPrintWidth()
				: this.y + Printer.lineWidth + this.measureWidth(string) >
					this.getScaledPrintHeight();
	}

	newLine() {
		if (this.breakable) {
			this.breakable = false;
			if (this.horizontal) {
				this.x = 0;
				this.y += (this.lineHeight || this.getScaledSize()) + this.getScaledLineSpacing();
				this.lineHeight = 0;
			} else {
				this.x += (this.lineHeight || this.getScaledSize()) + this.getScaledLineSpacing();
				this.y = 0;
				this.lineHeight = 0;
			}
		}
	}

	draw(content: any) {
		this.content = content;
		this.index = 0;
		this.wrapEnd = 0;

		this.commands = [];

		this.paddingLeft = 0;
		this.paddingTop = 0;
		this.paddingRight = 0;
		this.paddingBottom = 0;

		this.updateFont();

		const wordWrap = this.wordWrap;
		const truncate = this.truncate;
		const horizontal = this.horizontal;
		const printWidth = this.getScaledPrintWidth();
		const printHeight = this.getScaledPrintHeight();
		const letterSpacing = this.getScaledLetterSpacing();
		const charWidths = Printer.charWidths;
		const length = content.length;
		let charIndex = 0;
		let charWidth = 0;

		while (this.index < length) {
			const char = content[this.index];
			if (char === '<' && this.matchTag()) {
				continue;
			}

			if (char === '\n') {
				this.drawBuffer();
				this.newLine();
				this.index += 1;
				continue;
			}

			if (
				wordWrap &&
				Printer.wordWrap === 'keep' &&
				this.index >= this.wrapEnd &&
				this.isWrapOverflowing()
			) {
				this.drawBuffer();
				this.newLine();
				continue;
			}

			if (
				truncate &&
				(horizontal
					? this.y + Math.max(this.lineHeight, this.measureHeight(char)) > printHeight
					: this.x + Math.max(this.lineHeight, this.measureHeight(char)) > printWidth)
			) {
				this.drawBuffer();
				break;
			}

			if (
				wordWrap &&
				(horizontal
					? this.x + Printer.lineWidth + (charWidth = this.measureWidth(char)) >
						printWidth
					: this.y + Printer.lineWidth + (charWidth = this.measureWidth(char)) >
						printHeight) &&
				(this.breakable || this.buffer.length !== 0)
			) {
				this.drawBuffer();
				this.newLine();
				continue;
			}

			if (letterSpacing !== 0) {
				if (wordWrap === false) {
					charWidth = this.measureWidth(char);
				}
				charWidths[charIndex++] = charWidth;
				Printer.lineWidth += letterSpacing;
			}
			Printer.lineWidth += charWidth;

			this.buffer += char;
			this.index += 1;
		}

		this.drawBuffer();

		if (horizontal) {
			this.width = Math.max(this.width - letterSpacing, 0);
		} else {
			this.height = Math.max(this.height - letterSpacing, 0);
		}
		const width = Math.min(
			Math.ceil(this.width + this.paddingLeft + this.paddingRight),
			GL.maxTexSize
		);
		const height = Math.min(
			Math.ceil(this.height + this.paddingTop + this.paddingBottom),
			GL.maxTexSize
		);
		this.context.resize(width, height);

		this.computeTextPosition();

		this.executeCommands();
	}

	matchTag() {
		const regexps = Printer.regexps;
		const startIndex = this.index;
		const endIndex = this.content.indexOf('>', startIndex + 1) + 1;
		const string = this.content.slice(startIndex, endIndex);
		let match;
		if ((match = string.match(regexps.colorIndex))) {
			const index = parseInt(match[1]);
			const hex = Data.config.indexedColors[index].code;
			const color = CSSRGBA(hex);
			this.drawBuffer();
			this.colors.unshift(color);
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.color))) {
			const hex = match[1] + match[2] + match[3] + (match[4] ?? 'ff');
			const color = CSSRGBA(hex);
			this.drawBuffer();
			this.colors.unshift(color);
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.colorRestore)) && this.colors.length > 1) {
			this.drawBuffer();
			this.colors.shift();
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.font))) {
			const font = `${match[1]}${match[2] ? `, ${match[2]}` : ''}`;
			this.drawBuffer();
			this.fonts.unshift(font);
			this.updateFont();
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.fontRestore)) && this.fonts.length > 1) {
			this.drawBuffer();
			this.fonts.shift();
			this.updateFont();
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.italic))) {
			this.drawBuffer();
			this.styles.unshift('italic');
			this.updateFont();
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.italicRestore)) && this.styles.length > 1) {
			this.drawBuffer();
			this.styles.shift();
			this.updateFont();
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.bold))) {
			this.drawBuffer();
			this.weights.unshift('bold');
			this.updateFont();
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.boldRestore)) && this.weights.length > 1) {
			this.drawBuffer();
			this.weights.shift();
			this.updateFont();
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.fontSize))) {
			const size = parseInt(match[1]);
			this.drawBuffer();
			this.sizes.unshift(size);
			this.updateFont();
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.fontSizeRestore)) && this.sizes.length > 1) {
			this.drawBuffer();
			this.sizes.shift();
			this.updateFont();
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.textPosition))) {
			const axis = match[1].toLowerCase();
			const operation = match[2] || 'set';
			const value = parseInt(match[3]);
			this.drawBuffer();
			const position =
				operation === 'set' ? value : operation === 'add' ? this[axis] + value : null;
			this[axis] = Math.max(position, 0);
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.textShadow))) {
			const r = parseInt(match[3], 16);
			const g = parseInt(match[4], 16);
			const b = parseInt(match[5], 16);
			const a = parseInt(match[6] || 'ff', 16);
			const effect = {
				type: 'shadow',
				shadowOffsetX: parseInt(match[1]),
				shadowOffsetY: parseInt(match[2]),
				color: r + (g + (b + a * 256) * 256) * 256
			};
			this.drawBuffer();
			this.effects.unshift(effect);
			this.index += match[0].length;
			return true;
		}
		if (
			(match = string.match(regexps.textShadowRestore)) &&
			this.effects.length > 1 &&
			this.effects[0].type === 'shadow'
		) {
			this.drawBuffer();
			this.effects.shift();
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.textStroke))) {
			const r = parseInt(match[2], 16);
			const g = parseInt(match[3], 16);
			const b = parseInt(match[4], 16);
			const a = parseInt(match[5] || 'ff', 16);
			const effect = {
				type: 'stroke',
				strokeWidth: parseInt(match[1]),
				color: r + (g + (b + a * 256) * 256) * 256
			};
			this.drawBuffer();
			this.effects.unshift(effect);
			this.index += match[0].length;
			return true;
		}
		if (
			(match = string.match(regexps.textStrokeRestore)) &&
			this.effects.length > 1 &&
			this.effects[0].type === 'stroke'
		) {
			this.drawBuffer();
			this.effects.shift();
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.textOutline))) {
			const r = parseInt(match[1], 16);
			const g = parseInt(match[2], 16);
			const b = parseInt(match[3], 16);
			const a = parseInt(match[4] || 'ff', 16);
			const effect = {
				type: 'outline',
				color: r + (g + (b + a * 256) * 256) * 256
			};
			this.drawBuffer();
			this.effects.unshift(effect);
			this.index += match[0].length;
			return true;
		}
		if (
			(match = string.match(regexps.textOutlineRestore)) &&
			this.effects.length > 1 &&
			this.effects[0].type === 'outline'
		) {
			this.drawBuffer();
			this.effects.shift();
			this.index += match[0].length;
			return true;
		}
		if ((match = string.match(regexps.image))) {
			const guid = match[1];
			let clip = null;
			let width = 0;
			let height = 0;
			if (!match[2]) {
				// 存在1个参数
				width = this.sizes[0];
				height = this.sizes[0];
			} else if (!match[4]) {
				// 存在3个参数
				width = parseInt(match[2]);
				height = parseInt(match[3]);
			} else {
				// 存在5-7个参数
				clip = [
					parseInt(match[2]),
					parseInt(match[3]),
					parseInt(match[4]),
					parseInt(match[5])
				];
				width = parseInt(match[6] ?? this.sizes[0]);
				height = parseInt(match[7] ?? this.sizes[0]);
			}
			this.drawBuffer();
			this.loadImage(guid, clip, width, height);
			this.index += match[0].length;
			return true;
		}
		return false;
	}

	static scale = 1;
	static sizeScale = 1;
	static languageFont = '';
	static font = null;
	static size = null;
	static color = null;
	static effect = null;
	static wordWrap = 'break';
	static highDefinition = false;
	static lineWidth = 0;
	static charWidths = null;
	static commands = null;
	static commandCount = null;
	static commandMaximum = null;
	static drawingMethods = null;
	static imported: any[] = [];
	static importing: any[] = [];

	static regexps: any = {
		// 使用索引颜色: [1]:Index(0-15)
		colorIndex: /^<color:(\d|1[0-5])>$/i,
		// 使用指定颜色: [1]:R(00-ff), [2]:G(00-ff), [3]:B(00-ff), [4]:A(00-ff)(可选)
		color: /^<color:([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?>$/i,
		colorRestore: /^<\/color>$/i,
		// 使用字体: [1]:字体族群
		font: /^<font:([\S ]+)>$/i,
		fontRestore: /^<\/font>$/i,
		italic: /^<italic>$/i,
		italicRestore: /^<\/italic>$/i,
		bold: /^<bold>$/i,
		boldRestore: /^<\/bold>$/i,
		// 使用字体大小: [1]:字体大小(10-400)
		fontSize: /^<size:([1-9]\d|[1-3]\d\d|400)>$/i,
		fontSizeRestore: /^<\/size>$/i,
		textPosition: /^<(x|y):(?:(add),)?(-?(?:\d|[1-9]\d|[1-9]\d\d|1000))>$/i,
		// 使用阴影效果: [1]:水平偏移(-9-9), [2]:垂直偏移(-9-9), [3]:R(00-ff), [4]:G(00-ff), [5]:B(00-ff), [6]:A(00-ff)(可选)
		textShadow:
			/^<shadow:(0|-?[1-9]),(0|-?[1-9]),([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?>$/i,
		textShadowRestore: /^<\/shadow>$/i,
		// 使用描边效果: [1]:描边宽度(1-20), [2]:R(00-ff), [3]:G(00-ff), [4]:B(00-ff), [5]:A(00-ff)(可选)
		textStroke:
			/^<stroke:([1-9]|1\d|20),([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?>$/i,
		textStrokeRestore: /^<\/stroke>$/i,
		// 使用轮廓效果: [1]:R(00-ff), [2]:G(00-ff), [3]:B(00-ff), [4]:A(00-ff)(可选)
		textOutline: /^<outline:([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?>$/i,
		textOutlineRestore: /^<\/outline>$/i,
		// 使用指定图像: [1]:GUID(16个字符), [2]:参数1(0-10000)(可选), [3]:参数2(0-10000)(可选), [4]:参数1(0-10000)(可选), [5]:参数2(0-10000)(可选), [6]:参数1(0-10000)(可选), [7]:参数2(0-10000)(可选)
		image: /^<image:([0-9a-f]{16})(?:,(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000),(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000))?(?:,(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000),(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000))?(?:,(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000),(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000))?>$/i
	};

	static initialize() {
		this.charWidths = new Float64Array(
			GL.arrays[1].uint32.buffer,
			0,
			GL.arrays[1].uint32.length / 2
		);

		this.commandCount = 0;
		this.commandMaximum = 100;
		this.commands = new Array(this.commandMaximum);

		this.drawingMethods = {
			none: 'drawText',
			shadow: 'drawTextWithShadow',
			stroke: 'drawTextWithStroke',
			outline: 'drawTextWithOutline'
		};

		window.on('datachange', this.datachange);
	}

	static loadDefault() {
		const text = Data.config.text;
		this.updateFont();
		this.size = 16;
		this.color = CSSRGBA('ffffffff');
		this.effect = { type: 'none' };
		this.highDefinition = text.highDefinition;

		this.updateScale();

		(this.imported as unknown as { signature: string }).signature = text.importedFonts.join();
		return this.importFonts(text.importedFonts);
	}

	static importFonts(imports: any) {
		const imported = this.imported;
		const importing = this.importing;
		const regexp = /([^/]+)\.\S+\.\S+$/;
		const promises = [];
		for (const guid of imports) {
			const path = File.getPath(guid);
			const name = path.match(regexp)?.[1];
			if (!name || imported.includes(name)) {
				continue;
			}
			imported.push(name);
			importing.push(name);
			promises.push(
				File.get({
					path: path,
					type: 'arraybuffer'
				}).then(
					(buffer) => {
						new FontFace(name, buffer).load().then(
							(font) => {
								if (importing.remove(name)) {
									document.fonts.add(font);
									(
										font as FontFace & {
											imported: boolean;
											guid: string;
											name: string;
										}
									).imported = true;
									(
										font as FontFace & {
											imported: boolean;
											guid: string;
											name: string;
										}
									).guid = guid;
									(
										font as FontFace & {
											imported: boolean;
											guid: string;
											name: string;
										}
									).name = name;
								}
							},
							(error) => {
								importing.remove(name);
							}
						);
					},
					(error) => {
						importing.remove(name);
					}
				)
			);
		}
		return Promise.all(promises).then(() => {
			UI.updateElementFont();
		});
	}

	static deleteFont(guid: any) {
		const fonts = document.fonts;
		for (const font of fonts) {
			if (
				(
					font as FontFace & {
						imported: boolean;
						guid: string;
						name: string;
					}
				).guid === guid
			) {
				fonts.delete(font);
				this.imported.remove(
					(
						font as FontFace & {
							imported: boolean;
							guid: string;
							name: string;
						}
					).name
				);
				break;
			}
		}
	}

	static clearFonts() {
		const fonts = document.fonts;
		for (const font of fonts) {
			if (
				(
					font as FontFace & {
						imported: boolean;
						guid: string;
						name: string;
					}
				).imported
			) {
				fonts.delete(font);
			}
		}
		this.imported.length = 0;
		this.importing.length = 0;
	}

	static parseEffect(effect: any) {
		const copy = Object.clone(effect);
		if (copy.color !== undefined) {
			copy.color = CSSRGBA(copy.color);
		}
		return copy;
	}

	static fetchCommand() {
		const count = this.commandCount;
		const command = this.commands[count];
		if (command !== undefined) {
			this.commandCount++;
			return command;
		} else {
			const command = {
				string: '',
				x: 0,
				y: 0,
				font: '',
				size: 0,
				color: 0,
				effect: null,
				image: null,
				imageWidth: 0,
				imageHeight: 0,
				imageSpacing: 0,
				horizontalWidth: 0,
				drawingMethod: ''
			};
			if (count < this.commandMaximum) {
				this.commands[count] = command;
				this.commandCount++;
			}
			return command;
		}
	}

	static resetCommands() {
		const commands = this.commands;
		const count = this.commandCount;
		for (let i = 0; i < count; i++) {
			const command = commands[i];
			command.string = '';
			command.image = null;
			command.imageWidth = 0;
			command.imageHeight = 0;
			command.imageSpacing = 0;
			command.horizontalWidth = 0;
		}
		this.commandCount = 0;
	}

	static restoreTexture(base: any) {
		base.restoreNormalTexture();
		Promise.resolve().then(() => {
			const { content } = base.printer;
			base.printer.reset();
			base.printer.draw(content);
		});
	}

	static drawText(context: any, command: any, text: any) {
		const { font, size, color } = command;
		const x = command.x;
		const y = command.y + size * 0.85;
		context.font = font;
		context.fillStyle = color;
		context.globalCompositeOperation = 'source-over';
		context.fillText(text, x, y);
	}

	static drawTextWithShadow(context: any, command: any, text: any) {
		const { font, size, color, effect } = command;
		const x = command.x;
		const y = command.y + size * 0.85;
		const shadowX = effect.shadowOffsetX * Printer.scale;
		const shadowY = effect.shadowOffsetY * Printer.scale;
		context.font = font;
		context.fillStyle = effect.color;
		context.globalCompositeOperation = 'destination-over';
		context.fillText(text, x + shadowX, y + shadowY);
		context.fillStyle = color;
		context.globalCompositeOperation = 'source-over';
		context.fillText(text, x, y);
	}

	static drawTextWithStroke(context: any, command: any, text: any) {
		const { font, size, color, effect } = command;
		const x = command.x;
		const y = command.y + size * 0.85;
		context.font = font;
		context.lineJoin = 'round';
		context.lineWidth = effect.strokeWidth * Printer.scale;
		context.strokeStyle = effect.color;
		context.globalCompositeOperation = 'destination-over';
		context.strokeText(text, x, y);
		context.fillStyle = color;
		context.globalCompositeOperation = 'source-over';
		context.fillText(text, x, y);
	}

	static drawTextWithOutline(context: any, command: any, text: any) {
		const { font, size, color, effect } = command;
		const x = command.x;
		const y = command.y + size * 0.85;
		const offset = Printer.scale;
		context.font = font;
		context.fillStyle = effect.color;
		context.fillText(text, x - offset, y);
		context.fillText(text, x + offset, y);
		context.fillText(text, x, y - offset);
		context.fillText(text, x, y + offset);
		context.fillStyle = color;
		context.fillText(text, x, y);
	}

	static setLanguageFont(guid: any) {
		if (this.languageFont !== guid) {
			this.deleteFont(this.languageFont);
			this.languageFont = guid;
			this.updateFont();
		}
	}

	static updateFont() {
		const fontFamily = Data.config.text.fontFamily || 'sans-serif';
		const guid = this.languageFont;
		if (guid === '') {
			this.font = fontFamily;
		} else {
			const path = File.getPath(guid);
			const name = path.match(/([^/]+)\.\S+\.\S+$/)?.[1];
			if (name) {
				this.importFonts([guid]).then(() => {
					this.font = `${name}, ${fontFamily}`;
					UI.updateElementFont();
				});
			}
		}
	}

	static setSizeScale(scale: any) {
		if (this.sizeScale !== scale) {
			this.sizeScale = scale;
			UI.updateAllPrinters();
		}
	}

	static updateScale() {
		this.scale = this.highDefinition ? 4 : 1;
		UI.updateAllPrinters();
	}

	static setWordWrap(wordWrap: any) {
		if (this.wordWrap !== wordWrap) {
			this.wordWrap = wordWrap;
			UI.updateAllPrinters();
		}
	}

	static datachange(event: any) {
		if (event.key === 'config') {
			const font = Data.config.text.fontFamily || 'sans-serif';
			if (Printer.font !== font) {
				Printer.updateFont();
				for (const context of Title.tabBar.data) {
					if (context.type === 'ui') {
						context.fontChanged = true;
					}
				}
				UI.updateElementFont();
			}

			const { importedFonts } = Data.config.text;
			const signature = importedFonts.join();
			if ((Printer.imported as unknown as { signature: string }).signature !== signature) {
				(Printer.imported as unknown as { signature: string }).signature = signature;
				Printer.clearFonts();
				Printer.importFonts(importedFonts);
			}

			const { highDefinition } = Data.config.text;
			if (Printer.highDefinition !== highDefinition) {
				Printer.highDefinition = highDefinition;
				Printer.updateScale();
			}
		}
	}
}
