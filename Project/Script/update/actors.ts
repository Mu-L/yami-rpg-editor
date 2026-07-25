import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Updater } from './updater.ts';

Updater.updateActors = function (verNum) {
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
				if (key in (sActor as any)) {
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
