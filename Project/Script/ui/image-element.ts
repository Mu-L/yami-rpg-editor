import { UI } from './ui-window.ts';
import { ImageTexture } from '@/webgl/image-texture.ts';
import { Texture } from '@/webgl/texture.ts';
import { GL } from '@/webgl/webgl-init.ts';

UI.Image = class ImageElement extends UI.Element {
	texture: Texture | null;
	_display: string;
	_image: string;
	flip: string;
	shiftX: number;
	shiftY: number;
	border: number;
	clip: number[];
	tint: number[];
	blend: string;

	constructor(data: any) {
		super(data);
		this.texture = null;
		this.display = data.display ?? 'stretch';
		this.image = data.image ?? '';
		this.flip = data.flip ?? 'none';
		this.shiftX = data.shiftX ?? 0;
		this.shiftY = data.shiftY ?? 0;
		this.border = data.border ?? 0;
		this.clip = data.clip ?? [0, 0, 0, 0];
		this.tint = data.tint ?? [0, 0, 0, 0];
		this.blend = data.blend ?? 'normal';
	}

	get image() {
		return this._image;
	}

	set image(value: any) {
		if (this._image !== value) {
			this._image = value;
			if (this.texture) {
				this.texture.destroy();
				this.texture = null;
			}
			if (value) {
				this.texture = new ImageTexture(value);
				this.texture.on('load', () => {
					UI.requestRendering();
				});
			}
		}
	}

	get display() {
		return this._display;
	}

	set display(value: any) {
		this._display = value;
	}

	draw() {
		if (this.visible === false) {
			return this.drawChildren();
		}

		const { texture } = this;
		if (texture !== null)
			draw: {
				let dx = this.x;
				let dy = this.y;
				let dw = this.width;
				let dh = this.height;
				if (this.blend === 'mask') {
					if (GL.maskTexture.binding) {
						break draw;
					}
					if (GL.depthTest) {
						GL.disable(GL.DEPTH_TEST);
					}
					GL.maskTexture.binding = this;
					GL.bindFBO(GL.maskTexture.fbo);
					GL.alpha = 1;
					GL.blend = 'normal';
				} else {
					GL.alpha = this.opacity;
					GL.blend = this.blend;
				}
				GL.matrix.set(UI.matrix).multiply(this.matrix);
				switch (this.display) {
					case 'stretch':
						texture.clip(
							this.shiftX,
							this.shiftY,
							texture.base.width,
							texture.base.height
						);
						break;
					case 'tile':
						texture.clip(this.shiftX, this.shiftY, this.width, this.height);
						break;
					case 'clip':
						texture.clip(...(this.clip as [number, number, number, number]));
						break;
					case 'slice':
						GL.drawSliceImage(
							texture,
							dx,
							dy,
							dw,
							dh,
							this.clip,
							this.border,
							this.tint
						);
						break draw;
				}
				switch (this.flip) {
					case 'none':
						break;
					case 'horizontal':
						dx += dw;
						dw *= -1;
						break;
					case 'vertical':
						dy += dh;
						dh *= -1;
						break;
					case 'both':
						dx += dw;
						dy += dh;
						dw *= -1;
						dh *= -1;
						break;
				}
				GL.drawImage(texture, dx, dy, dw, dh, this.tint);
			}
		else if (this.blend !== 'mask') {
			this.drawDefaultImage();
		}

		if (GL.maskTexture.binding === this) {
			GL.unbindFBO();
			if (GL.depthTest) {
				GL.enable(GL.DEPTH_TEST);
			}
			GL.masking = true;
			this.drawChildren();
			GL.masking = false;
			GL.maskTexture.binding = null;
			const [x1, y1, x2, y2] = this.computeBoundingRectangle();
			const sl = Math.max(Math.floor(x1 - 1), 0);
			const st = Math.max(Math.floor(y1 - 1), 0);
			const sr = Math.min(Math.ceil(x2 + 1), GL.maskTexture.width);
			const sb = Math.min(Math.ceil(y2 + 1), GL.maskTexture.height);
			const sw = sr - sl;
			const sh = sb - st;
			if (sw > 0 && sh > 0) {
				GL.bindFBO(GL.maskTexture.fbo);
				GL.enable(GL.SCISSOR_TEST);
				GL.scissor(sl, st, sw, sh);
				GL.clearColor(0, 0, 0, 0);
				GL.clear(GL.COLOR_BUFFER_BIT);
				GL.disable(GL.SCISSOR_TEST);
				GL.unbindFBO();
			}
		} else {
			this.drawChildren();
		}
	}

	resize() {
		if (this.parent instanceof UI.Window) {
			return this.parent.requestResizing();
		}
		this.calculatePosition();
		this.resizeChildren();
	}

	destroy() {
		super.destroy();
		this.texture?.destroy();
		this.destroyChildren();
	}

	computeBoundingRectangle() {
		const matrix = GL.matrix.set(UI.matrix).multiply(this.matrix);
		const L = this.x;
		const T = this.y;
		const R = L + this.width;
		const B = T + this.height;
		const a = matrix[0];
		const b = matrix[1];
		const c = matrix[3];
		const d = matrix[4];
		const e = matrix[6];
		const f = matrix[7];
		const x1 = a * L + c * T + e;
		const y1 = b * L + d * T + f;
		const x2 = a * L + c * B + e;
		const y2 = b * L + d * B + f;
		const x3 = a * R + c * B + e;
		const y3 = b * R + d * B + f;
		const x4 = a * R + c * T + e;
		const y4 = b * R + d * T + f;
		const vertices = ImageElement.sharedFloat64Array;
		vertices[0] = Math.min(x1, x2, x3, x4);
		vertices[1] = Math.min(y1, y2, y3, y4);
		vertices[2] = Math.max(x1, x2, x3, x4);
		vertices[3] = Math.max(y1, y2, y3, y4);
		return vertices;
	}

	static sharedFloat64Array = new Float64Array(4);
};
