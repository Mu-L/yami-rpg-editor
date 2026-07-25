import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Updater } from './updater.ts';

Updater.updateScenes = function (verNum) {
	const replaceSceneObject = (replacer) => {
		const forEachObject = (objects, replacer, meta) => {
			const length = objects.length;
			for (let i = 0; i < length; i++) {
				const object = objects[i];
				const replacement = replacer(object);
				if (replacement instanceof Object) {
					objects[i] = replacement;
					File.planToSave(meta);
				}
				if (object.children instanceof Array) {
					forEachObject(object.children, replacer, meta);
				}
			}
		};
		for (const [guid, scene] of Object.entries(Data.scenes)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			forEachObject((scene as any).objects, replacer, meta);
		}
	};
	if (verNum < Updater.getVersionNumber('1.0.116')) {
		for (const [guid, scene] of Object.entries(Data.scenes)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			delete (scene as any).contrast;
			(scene as any).ambient.direct = 0;
			File.planToSave(meta);
		}
	}
	if (verNum < Updater.getVersionNumber('1.0.116')) {
		const keys = Object.keys(Inspector.sceneLight.create());
		replaceSceneObject((object) => {
			if (object.class === 'light') {
				const sLight = object;
				const dLight = Inspector.sceneLight.create();
				for (const key of keys) {
					if (key in sLight) {
						dLight[key] = sLight[key];
					}
				}
				return dLight;
			}
		});
	}
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const keys = Object.keys(Inspector.sceneActor.create());
		replaceSceneObject((object) => {
			if (object.class === 'actor') {
				const sActor = object;
				const dActor = Inspector.sceneActor.create();
				for (const key of keys) {
					if (key in sActor) {
						dActor[key] = sActor[key];
					}
				}
				return dActor;
			}
		});
	}
};
