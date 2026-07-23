import { Scene } from './scene-window.ts';
import { ImageTexture } from '../webgl/image-texture.ts';

// ******************************** 纹理集合类 ********************************

Scene.Textures = class Textures {
	state: string;

	constructor() {
		this.state = 'open';
		this[''] = null;
	}

	// 添加纹理
	append(texture: any) {
		if (this.state === 'open') {
			this[texture.base.guid] = texture;
		}
	}

	// 加载纹理
	load(guid: any) {
		if (!this[guid]) {
			const texture = new ImageTexture(guid);
			if (texture.complete) {
				this[guid] = texture;
				return Promise.resolve().then(() => {
					Scene.requestRendering();
					return texture;
				});
			}
			this[guid] = new Promise((resolve) => {
				texture.on('load', () => {
					if (
						this.state === 'open' &&
						this[guid] instanceof Promise
					) {
						this[guid] = texture;
						Scene.requestRendering();
						return resolve(texture);
					}
					texture.destroy();
					return resolve(null);
				});
			});
		}
		return this[guid];
	}

	// 销毁纹理
	destroy() {
		this.state = 'closed';
		for (const texture of Object.values(this)) {
			if (texture instanceof ImageTexture) {
				texture.destroy();
			}
		}
	}
};
