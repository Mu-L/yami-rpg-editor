import { Data } from '../data/data-object.ts';
import { File } from '../file/file-system-core.ts';
import { Inspector } from '../inspector/inspector.ts';
import { Updater } from './updater.ts';

// 更新角色数据
Updater.updateActors = function (verNum) {
	// 更新到1.0.13版本：添加scale属性
	// 更新到1.0.28版本：添加priority属性
	// 更新到1.0.45版本：添加shape属性
	// 更新到1.0.105版本：添加inventory属性
	// 更新到1.0.122版本：添加immovable|inherit属性
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const actors = Data.actors;
		const keys = Object.keys(Inspector.fileActor.create());
		for (const [guid, sActor] of Object.entries(actors)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dActor = Inspector.fileActor.create();
			for (const key of keys) {
				if (key in sActor) {
					dActor[key] = sActor[key];
					continue;
				}
				switch (key) {
					case 'immovable':
						dActor[key] = false;
						continue;
				}
			}
			actors[guid] = dActor;
			File.planToSave(meta);
		}
	}
};
