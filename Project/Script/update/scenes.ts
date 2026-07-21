import { Data } from '../data/data-object.ts';
import { File } from '../file/file-system-core.ts';
import { Inspector } from '../inspector/inspector.ts';
import { Updater } from './updater.ts';

// 更新场景数据
Updater.updateScenes = function (verNum) {
	// 替换场景对象
	const replaceSceneObject = (replacer) => {
		// 遍历对象列表中的所有对象
		const forEachObject = (objects, replacer, meta) => {
			const length = objects.length;
			for (let i = 0; i < length; i++) {
				const object = objects[i];
				// 如果替换器函数返回对象，则替换原对象
				const replacement = replacer(object);
				if (replacement instanceof Object) {
					objects[i] = replacement;
					// 计划保存场景文件
					File.planToSave(meta);
				}
				// 遍历下一级目录的对象
				if (object.children instanceof Array) {
					forEachObject(object.children, replacer, meta);
				}
			}
		};
		// 遍历所有场景
		for (const [guid, scene] of Object.entries(Data.scenes)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			forEachObject(scene.objects, replacer, meta);
		}
	};
	// 更新到1.0.116版本
	// 删除scene.contrast属性
	// 添加scene.ambient.direct属性
	if (verNum < Updater.getVersionNumber('1.0.116')) {
		for (const [guid, scene] of Object.entries(Data.scenes)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			delete scene.contrast;
			scene.ambient.direct = 0;
			File.planToSave(meta);
		}
	}
	// 更新到1.0.116版本：添加light.direct属性
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
	// 更新到1.0.122版本：添加actor.type属性
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
