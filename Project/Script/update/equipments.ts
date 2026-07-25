import { Data } from '../data/data-object.ts';
import { File } from '../file/file-system-core.ts';
import { Inspector } from '../inspector/inspector.ts';
import { Updater } from './updater.ts';

Updater.updateEquipments = function (verNum) {
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const equipments = Data.equipments;
		const keys = Object.keys(Inspector.fileEquipment.create());
		for (const [guid, sEquipment] of Object.entries(equipments)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dEquipment = Inspector.fileEquipment.create();
			for (const key of keys) {
				if (key in (sEquipment as any)) {
					dEquipment[key] = sEquipment[key];
				}
			}
			equipments[guid] = dEquipment;
			File.planToSave(meta);
		}
	}
};
