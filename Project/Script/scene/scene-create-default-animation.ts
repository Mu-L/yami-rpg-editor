import { File } from '../file/file-system-core.ts';
import { Animation } from '../animation/animation-window.ts';
import { Inspector } from '../inspector/inspector.ts';
import { Scene } from './scene-window.ts';
import { ImageTexture } from '../webgl/image-texture.ts';
// 创建默认动画播放器
Scene.createDefaultAnimation = (function IIFE() {
	let DefaultPlayer;
	let texture;

	// 创建默认图像纹理
	File.get({
		local: 'Images/default_actor.png',
		type: 'image'
	}).then((image) => {
		if (!image) return;
		const width = image.naturalWidth;
		const height = image.naturalHeight / 2;
		image.guid = 'scene:default_actor';
		texture = new ImageTexture(image);
		texture.width = width;
		texture.height = height;
		texture.base.protected = true;
	});

	// 返回函数
	return function (target) {
		// 初始化默认动画播放器类
		if (!DefaultPlayer) {
			const motion = Inspector.animMotion.create('ffffffffffffffff');
			const data = { mode: '1-dir', sprites: [], motions: [motion] };
			const layers = motion.dirCases[0].layers;
			const layer = Inspector.animSpriteLayer.create();
			const frames = layer.frames;
			layers.push(layer);
			frames[0].y = -8;
			frames[0].scaleX = 0.25;
			frames[0].scaleY = 0.25;
			frames[1] = Object.clone(frames[0]);
			frames[1].start = 1;
			frames[1].end = 2;
			frames[1].spriteY = 1;
			DefaultPlayer = class DefaultPlayer extends Animation.Player {
				constructor(target) {
					super(data);
					this.target = target;
					this.setMotion(motion.id);
				}

				setScale() {}

				getTexture() {
					return texture;
				}

				update() {
					this.index = this.target === Scene.target ? 1 : 0;
				}

				destroy() {}
			};
		}
		return new DefaultPlayer(target);
	};
})();
