import { Data } from '@/data/data-object.ts';
import { Scene } from '@/scene/scene-window.ts';
import { GL } from '@/webgl/webgl-init.ts';
import { UI } from '@/ui/ui-window.ts';
import { Animation } from './animation-window.ts';
import { Easing } from '@/data/transition-window.ts';
import { Particle } from '@/particle/particle-window.ts';
import { ImageTexture } from '@/webgl/image-texture.ts';
import { Matrix } from '@/webgl/matrix2.ts';
import {
	AnimationMotion,
	AnimationSprite,
	AnimationImageMap,
	AnimationTextureMap
} from '@/types/animation-player.ts';

interface AnimationData {
	[k: string]: any;
}

Animation.Player = class AnimationPlayer {
	visible: boolean;
	index: number;
	cycleIndex: number;
	length: number;
	end: number;
	loopStart: number;
	speed: number;
	anchorX: number;
	anchorY: number;
	rotatable: boolean;
	rotation: number;
	opacity: number;
	angle: number;
	scale: number;
	direction: number;
	mirror: string | boolean;
	data: AnimationData;
	dirMap: any[];
	dirCases: any[] | null;
	layers: any[] | null;
	motion: any | null;
	motions: Record<string, AnimationMotion>;
	sprites: Record<string, AnimationSprite>;
	images: AnimationImageMap;
	textures: AnimationTextureMap;
	contexts: any[] & { count?: number };
	emitters: any[] & { count?: number };
	isUIComponent: boolean;

	constructor(animation: AnimationData) {
		this.index = 0;
		this.length = 0;
		this.loopStart = 0;
		this.speed = 1;
		this.anchorX = 0;
		this.anchorY = 0;
		this.rotatable = false;
		this.rotation = 0;
		this.opacity = 1;
		this.angle = 0;
		this.scale = 1;
		this.direction = -1;
		this.mirror = false;
		this.data = animation;
		this.dirMap = Array.empty;
		this.dirCases = null;
		this.layers = null;
		this.motion = null;
		this.motions = {};
		this.sprites = {};
		this.images = {};
		this.textures = {};
		this.contexts = [];
		this.emitters = [];
		this.isUIComponent = false;
		this.loadSprites();
		this.loadMotions();
	}

	setMotion(key: any) {
		const motions = this.motions;
		const motion = motions[key];
		if (motion !== undefined && this.motion !== motion) {
			this.motion = motion;
			this.dirCases = motion.dirCases;
			const dirMap = AnimationPlayer.dirMaps[motion.mode];
			if (this.dirMap !== dirMap) {
				this.dirMap = dirMap;
				this.direction = -1;
				this.setAngle(this.angle);
			} else {
				this.loadDirCase();
			}
			return true;
		}
		return false;
	}

	loadDirCase() {
		const params = this.dirMap[this.direction];
		if (params) {
			const dirCase = this.dirCases[params.index];
			this.layers = dirCase.layers;
			this.destroyContextEmitters();
			this.loadContexts(this.contexts);
			this.computeLength();
		}
	}

	setScale(scale: any) {
		this.scale = scale;
	}

	setSpeed(speed: any) {
		this.speed = speed;
	}

	setOpacity(opacity: any) {
		this.opacity = opacity;
	}

	setAngle(angle: any) {
		this.angle = angle;
		const directions = this.dirMap.length;
		const proportion = Math.modRadians(angle) / (Math.PI * 2);
		const section = (proportion * directions + 0.5) % directions;
		const direction = Math.floor(section);
		const dirChanged = this.setDirection(direction);
		this.updateRotation();
		return dirChanged;
	}

	setDirection(direction: any) {
		if (this.direction !== direction) {
			const params = this.dirMap[direction];
			if (!params) return false;
			this.direction = direction;
			this.mirror = params.mirror;
			this.loadDirCase();
			return true;
		}
		return false;
	}

	getDirectionAngle() {
		const length = this.dirMap.length;
		return (this.direction / length) * Math.PI * 2;
	}

	updateRotation() {
		if (this.rotatable) {
			this.rotation = this.mirror
				? -this.angle - this.getDirectionAngle()
				: +this.angle - this.getDirectionAngle();
		}
	}

	goto(index: any) {
		index = Math.clamp(index, 0, this.length - 1);
		// 跳转到前面的动画帧时增加循环计数
		if (index < this.index) {
			this.cycleIndex++;
		}
		this.index = index;
	}

	restart() {
		this.index = 0;
	}

	reset() {
		this.index = 0;
		this.length = 0;
		this.end = 0;
		this.motion = null;
		this.contexts = [];
		this.destroyUpdatingEmitters();
		this.destroyContextEmitters();
	}

	setPosition(x: any, y: any) {
		const matrix = AnimationPlayer.matrix.set6f(1, 0, 0, 1, x, y);

		if (this.mirror) {
			matrix.mirrorh();
		}

		if (this.rotation !== 0) {
			matrix.rotate(this.rotation);
		}

		if (this.scale !== 1) {
			matrix.scale(this.scale, this.scale);
		}
	}

	setSpriteImages(images: any) {
		this.images = Object.setPrototypeOf(images, this.images);
	}

	updateFrameParameters(contexts: any, index: any) {
		const { count } = contexts;
		outer: for (let i = 0; i < count; i++) {
			const context = contexts[i];
			const frames = context.layer.frames;
			const last = frames.length - 1;
			for (let i = 0; i <= last; i++) {
				const frame = frames[i];
				const start = frame.start;
				const end = frame.end;
				if (index >= start && index < end) {
					const easingId = frame.easingId;
					if (easingId && i < last) {
						const next = frames[i + 1];
						const time = Easing.get(easingId).ease(
							(index - start) / (next.start - start)
						);
						context.update(frame, time, next);
					} else {
						context.update(frame);
					}
					continue outer;
				}
			}
			context.reset();
		}
	}

	loadSprites() {
		const spriteMap = this.sprites;
		const imageMap = this.images;
		const sprites = this.data.sprites;
		const length = sprites.length;
		for (let i = 0; i < length; i++) {
			const sprite = sprites[i];
			spriteMap[sprite.id] = sprite;
			imageMap[sprite.id] = sprite.image;
		}
	}

	loadMotions() {
		const motionMap = this.motions;
		for (const motion of this.data.motions) {
			motionMap[motion.id] = motion;
		}
	}

	loadContexts(contexts: any) {
		AnimationPlayer.loadContexts(this, contexts);
	}

	update(deltaTime: any) {
		if (this.length !== 0) {
			this.index += (deltaTime * this.speed) / AnimationPlayer.step;
			// 如果动画播放结束
			if (this.index >= this.end) {
				if (this.motion.loop) {
					this.index = (this.index % this.end) + this.loopStart;
				} else {
					// 否则设为尾帧索引，执行结束回调
					this.index = this.end - 1;
				}
			}
		}
		// if (this.emitterCount !== 0) { this.emitParticles(deltaTime) }
	}

	computeLength() {
		let length = 0;
		const { contexts, motion } = this;
		const { count } = contexts;
		for (let i = 0; i < count; i++) {
			const frames = contexts[i].layer.frames;
			const frame = frames[frames.length - 1];
			if (frame !== undefined) {
				length = Math.max(length, frame.end);
			}
		}
		const lastFrame = length - 1;
		this.length = length;
		this.loopStart = motion.loop ? Math.min(motion.loopStart, lastFrame) : 0;
		this.end = motion.skip && this.loopStart < lastFrame ? lastFrame : length;
	}

	emitParticles(deltaTime: any) {
		deltaTime *= this.speed;
		const { contexts } = this;
		const { count } = contexts;
		for (let i = 0; i < count; i++) {
			const context = contexts[i];
			const { layer } = context;
			if (layer.class === 'particle') {
				const { frame, emitter } = context;
				if (frame !== null && emitter !== undefined) {
					switch (layer.angle) {
						case 'default':
							emitter.angle = 0;
							break;
						case 'inherit': {
							const { matrix } = context;
							const a = matrix[0];
							const b = matrix[1];
							emitter.angle = Math.atan2(b, a);
							break;
						}
					}
					emitter.emitParticles(deltaTime);
				}
			}
		}
	}

	updateParticles(deltaTime: any) {
		deltaTime *= this.speed;
		const { emitters } = this;
		let i = emitters.length;
		let totalCount = 0;
		while (--i >= 0) {
			const emitter = emitters[i];
			const count = emitter.updateParticles(deltaTime);
			totalCount += count;
			if (count === 0 && emitter.disabled) {
				emitter.destroy();
				emitters.splice(i, 1);
			}
		}
		return totalCount;
	}

	draw(opacity: any, light: any) {
		const { emitters } = this;
		const { length } = emitters;
		if (length !== 0) {
			GL.batchRenderer.draw();
			for (let i = 0; i < length; i++) {
				const emitter = emitters[i];
				if (emitter.layer.order === 'before') {
					emitter.draw();
				}
			}
		}
		const { contexts } = this;
		const { count } = contexts;
		for (let i = 0; i < count; i++) {
			const context = contexts[i];
			const { layer } = context;
			if (layer.class === 'sprite' && context.frame !== null) {
				const key = layer.sprite;
				const texture = this.getTexture(key);
				if (texture !== null) {
					context.opacity *= opacity;
					this.drawSprite(context, texture, light);
				}
			}
		}
		if (length !== 0) {
			GL.batchRenderer.draw();
			for (let i = 0; i < length; i++) {
				const emitter = emitters[i];
				if (emitter.layer.order === 'after') {
					emitter.draw();
				}
			}
		}
	}

	drawSprite(context: any, texture: any, light: any) {
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const attributes = gl.arrays[0].uint32;
		const renderer = gl.batchRenderer;
		const response = renderer.response;
		const matrix = context.matrix;
		const layer = context.layer;
		const frame = context.frame;
		const tint = context.tint;
		const base = texture.base;
		const tw = base.width;
		const th = base.height;
		const sw = texture.width;
		const sh = texture.height;
		const sx = frame.spriteX * sw;
		const sy = frame.spriteY * sh;
		const L = -(sw * context.anchorX + context.pivotX);
		const T = -(sh * context.anchorY + context.pivotY);
		const R = L + sw;
		const B = T + sh;
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
		const sl = sx / tw;
		const st = sy / th;
		const sr = (sx + sw) / tw;
		const sb = (sy + sh) / th;
		renderer.setBlendMode(layer.blend);
		renderer.push(base.index);
		if (light === undefined) {
			light = Scene.showLight ? layer.light : 'raw';
		}
		const vi = response[0] * 8;
		const mode = AnimationPlayer.lightSamplingModes[light];
		const alpha = Math.round(context.opacity * 255);
		const param = response[1] | (alpha << 8) | (mode << 16);
		const redGreen = tint[0] + (tint[1] << 16) + 0x00ff00ff;
		const blueGray = tint[2] + (tint[3] << 16) + 0x00ff00ff;
		const anchor =
			light !== 'anchor'
				? 0
				: Math.round(Math.clamp(this.anchorX, 0, 1) * 0xffff) |
					(Math.round(Math.clamp(this.anchorY, 0, 1) * 0xffff) << 16);
		vertices[vi] = x1;
		vertices[vi + 1] = y1;
		vertices[vi + 2] = sl;
		vertices[vi + 3] = st;
		attributes[vi + 4] = param;
		attributes[vi + 5] = redGreen;
		attributes[vi + 6] = blueGray;
		attributes[vi + 7] = anchor;
		vertices[vi + 8] = x2;
		vertices[vi + 9] = y2;
		vertices[vi + 10] = sl;
		vertices[vi + 11] = sb;
		attributes[vi + 12] = param;
		attributes[vi + 13] = redGreen;
		attributes[vi + 14] = blueGray;
		attributes[vi + 15] = anchor;
		vertices[vi + 16] = x3;
		vertices[vi + 17] = y3;
		vertices[vi + 18] = sr;
		vertices[vi + 19] = sb;
		attributes[vi + 20] = param;
		attributes[vi + 21] = redGreen;
		attributes[vi + 22] = blueGray;
		attributes[vi + 23] = anchor;
		vertices[vi + 24] = x4;
		vertices[vi + 25] = y4;
		vertices[vi + 26] = sr;
		vertices[vi + 27] = st;
		attributes[vi + 28] = param;
		attributes[vi + 29] = redGreen;
		attributes[vi + 30] = blueGray;
		attributes[vi + 31] = anchor;
	}

	getTexture(spriteId: any) {
		const textures = this.textures;
		const texture = textures[spriteId];
		if (texture === undefined) {
			const sprite = this.sprites[spriteId];
			const imageId = this.images[spriteId];
			if (sprite !== undefined && imageId) {
				const texture = new ImageTexture(imageId);
				textures[spriteId] = null;
				texture.on('load', () => {
					if (this.textures === textures) {
						const { floor, max } = Math;
						const { base } = texture;
						const { hframes, vframes } = sprite;
						const width = floor(max(base.width / hframes, 1));
						const height = floor(max(base.height / vframes, 1));
						texture.width = width;
						texture.height = height;
						textures[spriteId] = texture;
						if (this.isUIComponent) {
							UI.requestRendering();
						} else {
							Scene.requestRendering();
						}
					} else {
						texture.destroy();
					}
				});
				if (texture.complete) {
					return texture;
				}
			}
			return null;
		}
		return texture;
	}

	destroy() {
		for (const texture of Object.values(this.textures)) {
			if (texture instanceof ImageTexture) {
				texture.destroy();
			}
		}
		this.textures = null;
		this.destroyUpdatingEmitters();
		this.destroyContextEmitters();
		for (const motion of Object.values(this.motions) as any[]) {
			for (const dirCase of motion.dirCases) {
				if (dirCase.loaded === undefined) continue;
				delete dirCase.loaded;
				for (const layer of dirCase.layers) {
					for (const frame of layer.frames) {
						delete frame.key;
					}
				}
			}
		}
	}

	destroyUpdatingEmitters() {
		const { emitters } = this;
		const { length } = emitters;
		if (length === 0) return;
		for (let i = 0; i < length; i++) {
			emitters[i].destroy();
		}
		emitters.length = 0;
	}

	destroyContextEmitters() {
		const { contexts } = this;
		const { count } = contexts;
		for (let i = 0; i < count; i++) {
			const context = contexts[i];
			const emitter = context.emitter;
			if (emitter !== undefined) {
				emitter.disabled = true;
				if (emitter.isEmpty()) {
					emitter.destroy();
					this.emitters.remove(emitter);
				}
				delete context.emitter;
			}
		}
	}

	clearParticles() {
		const { emitters } = this;
		const { length } = emitters;
		if (length === 0) return;
		for (let i = 0; i < length; i++) {
			emitters[i].clear();
		}
	}

	setAsUIComponent() {
		if (!this.isUIComponent) {
			this.isUIComponent = true;
		}
	}

	static step = 0;
	static matrix = new Matrix();
	static lightSamplingModes = { raw: 0, global: 1, anchor: 2 };
	static stage;

	static dirMaps = {
		'1-dir': [{ index: 0, mirror: false }],
		'1-dir-mirror': [
			{ index: 0, mirror: false },
			{ index: 0, mirror: true }
		],
		'2-dir': [
			{ index: 1, mirror: false },
			{ index: 0, mirror: false }
		],
		'2-dir-mirror': [
			{ index: 0, mirror: false },
			{ index: 0, mirror: false },
			{ index: 0, mirror: false },
			{ index: 0, mirror: false },
			{ index: 0, mirror: false },
			{ index: 0, mirror: true },
			{ index: 0, mirror: true },
			{ index: 0, mirror: true },
			{ index: 0, mirror: true },
			{ index: 0, mirror: true },
			{ index: 1, mirror: true },
			{ index: 1, mirror: true },
			{ index: 1, mirror: true },
			{ index: 1, mirror: true },
			{ index: 1, mirror: false },
			{ index: 1, mirror: false },
			{ index: 1, mirror: false },
			{ index: 1, mirror: false }
		],
		'3-dir-mirror': [
			{ index: 1, mirror: false },
			{ index: 0, mirror: false },
			{ index: 1, mirror: true },
			{ index: 2, mirror: false }
		],
		'4-dir': [
			{ index: 2, mirror: false },
			{ index: 0, mirror: false },
			{ index: 1, mirror: false },
			{ index: 3, mirror: false }
		],
		'5-dir-mirror': [
			{ index: 1, mirror: false },
			{ index: 3, mirror: false },
			{ index: 0, mirror: false },
			{ index: 3, mirror: true },
			{ index: 1, mirror: true },
			{ index: 4, mirror: true },
			{ index: 2, mirror: false },
			{ index: 4, mirror: false }
		],
		'8-dir': [
			{ index: 2, mirror: false },
			{ index: 5, mirror: false },
			{ index: 0, mirror: false },
			{ index: 4, mirror: false },
			{ index: 1, mirror: false },
			{ index: 6, mirror: false },
			{ index: 3, mirror: false },
			{ index: 7, mirror: false }
		]
	};

	static updateStep() {
		this.step = 1000 / Data.config.animation.frameRate;
	}

	static loadContexts(animation: any, contexts: any) {
		contexts.count = 0;
		if (animation.layers !== null) {
			// 如果动画已设置动作，加载所有图层上下文
			this.#loadContext(animation, animation.layers, null, contexts);
		}
	}

	static #loadContext(animation, layers, parent, contexts) {
		for (const layer of layers) {
			let context = contexts[contexts.count];
			if (context === undefined) {
				context = contexts[contexts.count] = {
					animation: animation,
					parent: null,
					layer: null,
					frame: null,
					matrix: new Matrix(),
					anchorX: 0,
					anchorY: 0,
					pivotX: 0,
					pivotY: 0,
					opacity: 0,
					update: null,
					reset: AnimationPlayer.contextReset
				};
			}
			contexts.count++;
			context.parent = parent;
			context.layer = layer;
			switch (layer.class) {
				case 'joint':
					context.update = AnimationPlayer.contextUpdate;
					break;
				case 'sprite':
					context.update = AnimationPlayer.contextUpdateSprite;
					break;
				case 'particle':
					context.update = AnimationPlayer.contextUpdateParticle;
					break;
				case 'sound':
					context.update = Function.empty;
					break;
			}
			if (layer.class === 'joint') {
				this.#loadContext(animation, layer.children, context, contexts);
			}
		}
	}

	static contextReset(this: any) {
		const parent = this.parent;
		const matrix = this.matrix;
		if (parent !== null) {
			matrix.set(parent.matrix);
			this.opacity = parent.opacity;
		} else {
			matrix.set(AnimationPlayer.matrix);
			this.opacity = this.animation.opacity;
		}
		this.frame = null;
	}

	static contextUpdate(this: any, frame, time, next) {
		const parent = this.parent;
		const matrix = this.matrix;
		if (parent !== null) {
			matrix.set(parent.matrix);
			this.opacity = parent.opacity;
		} else {
			matrix.set(AnimationPlayer.matrix);
			this.opacity = this.animation.opacity;
		}
		let positionX = frame.x;
		let positionY = frame.y;
		let rotation = frame.rotation;
		let scaleX = frame.scaleX;
		let scaleY = frame.scaleY;
		let opacity = frame.opacity;
		if (next !== undefined) {
			const reverse = 1 - time;
			positionX = positionX * reverse + next.x * time;
			positionY = positionY * reverse + next.y * time;
			rotation = rotation * reverse + next.rotation * time;
			scaleX = scaleX * reverse + next.scaleX * time;
			scaleY = scaleY * reverse + next.scaleY * time;
			opacity = opacity * reverse + next.opacity * time;
		}
		matrix.translate(positionX, positionY).rotate(Math.radians(rotation)).scale(scaleX, scaleY);
		this.opacity *= opacity;
		this.frame = frame;
	}

	static contextUpdateSprite(this: any, frame, time, next) {
		AnimationPlayer.contextUpdate.call(this, frame, time, next);
		let anchorX = frame.anchorX;
		let anchorY = frame.anchorY;
		let pivotX = frame.pivotX;
		let pivotY = frame.pivotY;
		let red = frame.tint[0];
		let green = frame.tint[1];
		let blue = frame.tint[2];
		let gray = frame.tint[3];
		if (next !== undefined) {
			const reverse = 1 - time;
			anchorX = anchorX * reverse + next.anchorX * time;
			anchorY = anchorY * reverse + next.anchorY * time;
			pivotX = pivotX * reverse + next.pivotX * time;
			pivotY = pivotY * reverse + next.pivotY * time;
			red = Math.clamp(red * reverse + next.tint[0] * time, -255, 255);
			green = Math.clamp(green * reverse + next.tint[1] * time, -255, 255);
			blue = Math.clamp(blue * reverse + next.tint[2] * time, -255, 255);
			gray = Math.clamp(gray * reverse + next.tint[3] * time, 0, 255);
		}
		let tint = this.tint;
		if (tint === undefined) {
			tint = this.tint = new Int16Array(4);
		}
		this.anchorX = anchorX;
		this.anchorY = anchorY;
		this.pivotX = pivotX;
		this.pivotY = pivotY;
		tint[0] = red;
		tint[1] = green;
		tint[2] = blue;
		tint[3] = gray;
	}

	static contextUpdateParticle(this: any, frame, time, next) {
		AnimationPlayer.contextUpdate.call(this, frame, time, next);
		let emitter = this.emitter;
		if (emitter === undefined) {
			const guid = this.layer.particleId;
			const data = Data.particles[guid];
			if (!data) return;
			emitter = new Particle.Emitter(data);
			emitter.matrix = this.matrix;
			emitter.layer = this.layer;
			this.emitter = emitter;
			this.animation.emitters.push(emitter);
		}
		let scale = frame.scale * this.animation.scale;
		let speed = frame.speed;
		if (next !== undefined) {
			const reverse = 1 - time;
			scale = scale * reverse + next.scale * time;
			speed = speed * reverse + next.speed * time;
		}
		emitter.scale = scale;
		emitter.speed = speed;
		emitter.opacity = this.opacity;
	}
};
