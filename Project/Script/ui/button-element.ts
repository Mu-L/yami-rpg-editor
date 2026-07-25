import { Inspector } from '@/inspector/inspector.ts';
import { UI } from './ui-window.ts';

UI.Button = class ButtonElement extends UI.Element {
	state: string;
	shadowImage: any;
	shadowText: any;
	_imagePadding: number;
	_textPadding: number;
	normalImage: string;
	normalClip: number[];
	hoverImage: string;
	hoverClip: number[];
	activeImage: string;
	activeClip: number[];
	normalColor: string;
	hoverColor: string;
	activeColor: string;
	_imageOpacity: number;
	imageEffect: string;
	normalTint: number[];
	hoverTint: number[];
	activeTint: number[];

	constructor(data: any) {
		super(data);
		this.state = 'normal';
		this.shadowImage = this.createShadowImage(data);
		this.shadowText = this.createShadowText(data);
		this.imageOpacity = data.imageOpacity;
		this.imagePadding = data.imagePadding;
		this.textPadding = data.textPadding;
		this.normalImage = data.normalImage;
		this.normalClip = data.normalClip;
		this.hoverImage = data.hoverImage;
		this.hoverClip = data.hoverClip;
		this.activeImage = data.activeImage;
		this.activeClip = data.activeClip;
		this.normalColor = data.normalColor;
		this.hoverColor = data.hoverColor;
		this.activeColor = data.activeColor;
		this.imageEffect = data.imageEffect;
		this.normalTint = data.normalTint;
		this.hoverTint = data.hoverTint;
		this.activeTint = data.activeTint;
	}

	get imagePadding() {
		return this._imagePadding;
	}

	set imagePadding(value: any) {
		if (this._imagePadding !== value) {
			this._imagePadding = value;
			this.shadowImage.transform.width = -value * 2;
			this.shadowImage.transform.height = -value * 2;
			if (this.connected) {
				this.shadowImage.resize();
			}
		}
	}

	get textPadding() {
		return this._textPadding;
	}

	set textPadding(value: any) {
		if (this._textPadding !== value) {
			this._textPadding = value;
			this.shadowText.transform.width = -value * 2;
			this.shadowText.transform.height = -value * 2;
			if (this.connected) {
				this.shadowText.resize();
			}
		}
	}

	get image() {
		return this.shadowImage.image;
	}

	set image(value: any) {
		this.shadowImage.image = value;
	}

	get display() {
		return this.shadowImage.display;
	}

	set display(value: any) {
		this.shadowImage.display = value;
	}

	get flip() {
		return this.shadowImage.flip;
	}

	set flip(value: any) {
		this.shadowImage.flip = value;
	}

	get clip() {
		return this.shadowImage.clip;
	}

	set clip(value: any) {
		this.shadowImage.clip = value;
	}

	get border() {
		return this.shadowImage.border;
	}

	set border(value: any) {
		this.shadowImage.border = value;
	}

	get imageOpacity() {
		return this.shadowImage.transform.opacity;
	}

	set imageOpacity(value: any) {
		this.shadowImage.transform.opacity = value;
		if (this.connected) {
			this.shadowImage.resize();
		}
	}

	get content() {
		return this.shadowText.content;
	}

	set content(value: any) {
		this.shadowText.content = value;
	}

	get size() {
		return this.shadowText.size;
	}

	set size(value: any) {
		this.shadowText.size = value;
	}

	get font() {
		return this.shadowText.font;
	}

	set font(value: any) {
		this.shadowText.font = value;
	}

	get direction() {
		return this.shadowText.direction;
	}

	set direction(value: any) {
		this.shadowText.direction = value;
	}

	get horizontalAlign() {
		return this.shadowText.horizontalAlign;
	}

	set horizontalAlign(value: any) {
		this.shadowText.horizontalAlign = value;
	}

	get verticalAlign() {
		return this.shadowText.verticalAlign;
	}

	set verticalAlign(value: any) {
		this.shadowText.verticalAlign = value;
	}

	get lineSpacing() {
		return this.shadowText.lineSpacing;
	}

	set lineSpacing(value: any) {
		this.shadowText.lineSpacing = value;
	}

	get letterSpacing() {
		return this.shadowText.letterSpacing;
	}

	set letterSpacing(value: any) {
		this.shadowText.letterSpacing = value;
	}

	get color() {
		return this.shadowText.color;
	}

	set color(value: any) {
		this.shadowText.color = value;
	}

	get typeface() {
		return this.shadowText.typeface;
	}

	set typeface(value: any) {
		this.shadowText.typeface = value;
	}

	get textEffect() {
		return this.shadowText.effect;
	}

	set textEffect(value: any) {
		this.shadowText.effect = value;
	}

	createShadowImage(data: any) {
		const image = data.normalImage;
		const clip = data.normalClip;
		const tint = [0, 0, 0, 0];
		const transform = this.createShadowTransform();
		const element = new UI.Image({ ...data, image, clip, tint, transform });
		element.parent = this;
		element.connected = true;
		return element;
	}

	createShadowText(data: any) {
		const color = data.normalColor;
		const effect = data.textEffect;
		const transform = this.createShadowTransform();
		const element = new UI.Text({ ...data, color, effect, transform });
		element.parent = this;
		element.connected = true;
		return element;
	}

	createShadowTransform() {
		const transform = Inspector.uiElement.createTransform();
		transform.anchorX = 0.5;
		transform.anchorY = 0.5;
		transform.x2 = 0.5;
		transform.y2 = 0.5;
		transform.width2 = 1;
		transform.height2 = 1;
		return transform;
	}

	updateTextContent() {
		this.shadowText.updateTextContent();
	}

	updatePrinter() {
		this.shadowText.updatePrinter();
	}

	updateImage() {
		let state;
		if (UI.dragging?.node === this.node) {
			state = 'active';
		} else if (UI.hover === this.node) {
			state = 'hover';
		} else {
			state = 'normal';
		}
		if (this.state !== state) {
			this.state = state;
			switch (state) {
				case 'normal':
					this.image = this.normalImage;
					this.color = this.normalColor;
					this.clip = this.normalClip;
					switch (this.imageEffect) {
						case 'none':
							this.shadowImage.tint.fill(0);
							break;
						case 'tint-1':
						case 'tint-2':
						case 'tint-3':
							this.shadowImage.tint.set(this.normalTint);
							break;
					}
					break;
				case 'hover':
					this.image = this.hoverImage || this.normalImage;
					this.color = this.hoverColor || this.normalColor;
					this.clip = (this.hoverImage && this.hoverClip) || this.normalClip;
					switch (this.imageEffect) {
						case 'none':
							break;
						case 'tint-1':
							this.shadowImage.tint.set(this.normalTint);
							break;
						case 'tint-2':
						case 'tint-3':
							this.shadowImage.tint.set(this.hoverTint);
							break;
					}
					break;
				case 'active':
					this.image = this.activeImage || this.hoverImage || this.normalImage;
					this.color = this.activeColor || this.hoverColor || this.normalColor;
					this.clip =
						(this.activeImage && this.activeClip) ||
						(this.hoverImage && this.hoverClip) ||
						this.normalClip;
					switch (this.imageEffect) {
						case 'none':
							break;
						case 'tint-1':
							this.shadowImage.tint.set(this.normalTint);
							break;
						case 'tint-2':
							this.shadowImage.tint.set(this.hoverTint);
							break;
						case 'tint-3':
							this.shadowImage.tint.set(this.activeTint);
							break;
					}
					break;
			}
		}
	}

	draw() {
		if (this.visible === false) {
			return this.drawChildren();
		}

		this.updateImage();

		if (this.image) {
			this.shadowImage.visible = this.visible;
			this.shadowImage.draw();
		}

		this.shadowText.visible = this.visible;
		this.shadowText.draw();

		this.drawChildren();
	}

	resize() {
		if (this.parent instanceof UI.Window) {
			return this.parent.requestResizing();
		}
		this.calculatePosition();
		this.shadowImage.resize();
		this.shadowText.resize();
		this.resizeChildren();
	}

	destroy() {
		super.destroy();
		this.shadowImage.destroy();
		this.shadowText.destroy();
		this.destroyChildren();
	}
};
