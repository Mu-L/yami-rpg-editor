import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Updater } from './updater.ts';

Updater.updateParticles = function (verNum) {
	if (verNum < Updater.getVersionNumber('1.0.95')) {
		const convert = (array) => {
			const min = array[0];
			const max = array[1];
			const std = Math.roundTo((min + max) / 2, 4);
			const dev = Math.roundTo(Math.abs(std - min), 4);
			array[0] = std;
			array[1] = dev;
		};
		for (const [guid, particle] of Object.entries(Data.particles)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			for (const layer of (particle as any).layers) {
				convert(layer.anchor.x);
				convert(layer.anchor.y);
				convert(layer.anchor.speedX);
				convert(layer.anchor.speedY);
				convert(layer.movement.angle);
				convert(layer.movement.speed);
				convert(layer.movement.accelAngle);
				convert(layer.movement.accel);
				convert(layer.rotation.angle);
				convert(layer.rotation.speed);
				convert(layer.rotation.accel);
				convert(layer.hRotation.radius);
				convert(layer.hRotation.expansionSpeed);
				convert(layer.hRotation.expansionAccel);
				convert(layer.hRotation.angle);
				convert(layer.hRotation.angularSpeed);
				convert(layer.hRotation.angularAccel);
				convert(layer.scale.factor);
				convert(layer.scale.speed);
				convert(layer.scale.accel);
			}
			File.planToSave(meta);
		}
	}
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const keys = Object.keys(Inspector.particleLayer.create());
		for (const [guid, particle] of Object.entries(Data.particles)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const layers = (particle as any).layers;
			for (let i = 0; i < layers.length; i++) {
				const sLayer = layers[i];
				const dLayer = Inspector.particleLayer.create();
				for (const key of keys) {
					if (key in sLayer) {
						dLayer[key] = sLayer[key];
						continue;
					}
					switch (key) {
						case 'sprite':
							if (typeof sLayer.hframes === 'number') {
								dLayer[key].hframes = sLayer.hframes;
							}
							if (typeof sLayer.vframes === 'number') {
								dLayer[key].vframes = sLayer.vframes;
							}
							continue;
					}
				}
				layers[i] = dLayer;
			}
			File.planToSave(meta);
		}
	}
};
