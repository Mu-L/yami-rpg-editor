import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Updater } from './updater.ts';

Updater.updateTilesets = function (verNum) {
	if (verNum < Updater.getVersionNumber('1.0.60')) {
		const tilesets = Data.tilesets;
		for (const [guid, tileset] of Object.entries<any>(tilesets)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const length = tileset.width * tileset.height;
			tileset.terrains = new Array(length).fill(0);
			File.planToSave(meta);
		}
	}
	if (verNum < Updater.getVersionNumber('1.0.85')) {
		const tilesets = Data.tilesets;
		for (const [guid, tileset] of Object.entries<any>(tilesets)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const length = tileset.width * tileset.height;
			tileset.tags = new Array(length).fill(0);
			File.planToSave(meta);
		}
	}
};
