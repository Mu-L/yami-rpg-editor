import { Data } from '../data/data-object.ts';
import { File } from '../file/file-system-core.ts';
import { Inspector } from '../inspector/inspector.ts';
import { Updater } from './updater.ts';

// 更新物品数据
Updater.updateItems = function (verNum) {
	// 更新到1.0.122版本：添加inherit属性
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const items = Data.items;
		const keys = Object.keys(Inspector.fileItem.create());
		for (const [guid, sItem] of Object.entries(items)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dItem = Inspector.fileItem.create();
			for (const key of keys) {
				if (key in sItem) {
					dItem[key] = sItem[key];
				}
			}
			items[guid] = dItem;
			File.planToSave(meta);
		}
	}
};
