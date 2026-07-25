import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Updater } from './updater.ts';

Updater.updateAnimations = function (verNum) {
	if (verNum < Updater.getVersionNumber('1.0.37')) {
		const keys = Object.keys(Inspector.animSpriteFrame.create());
		const update = (layers) => {
			for (const layer of layers) {
				switch (layer.class) {
					case 'joint':
						update(layer.children);
						continue;
					case 'sprite': {
						const frames = layer.frames;
						const length = frames.length;
						for (let i = 0; i < length; i++) {
							const sFrame = frames[i];
							const dFrame = Inspector.animSpriteFrame.create();
							dFrame.anchorX = 0.5;
							dFrame.anchorY = 0.5;
							dFrame.pivotX = 0;
							dFrame.pivotY = 0;
							for (const key of keys) {
								if (key in sFrame) {
									dFrame[key] = sFrame[key];
								}
							}
							frames[i] = dFrame;
						}
						continue;
					}
				}
			}
		};
		for (const [guid, animation] of Object.entries(Data.animations)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			for (const motion of (animation as any).motions) {
				for (const dirCase of motion.dirCases) {
					update(dirCase.layers);
				}
			}
			File.planToSave(meta);
		}
	}
	if (verNum < Updater.getVersionNumber('1.0.139')) {
		const keys = Object.keys(Inspector.animParticleLayer.create());
		const update = (layers) => {
			const length = layers.length;
			for (let i = 0; i < length; i++) {
				const sLayer = layers[i];
				switch (sLayer.class) {
					case 'joint':
						update(sLayer.children);
						continue;
					case 'particle': {
						const dLayer = Inspector.animParticleLayer.create();
						for (const key of keys) {
							if (key in sLayer) {
								dLayer[key] = sLayer[key];
							}
						}
						layers[i] = dLayer;
						continue;
					}
				}
			}
		};
		for (const [guid, animation] of Object.entries(Data.animations)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			for (const motion of (animation as any).motions) {
				for (const dirCase of motion.dirCases) {
					update(dirCase.layers);
				}
			}
			File.planToSave(meta);
		}
	}
};
