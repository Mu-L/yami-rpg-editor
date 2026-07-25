import { Data } from '../data/data-object.ts';
import { File } from '../file/file-system-core.ts';
import { Inspector } from '../inspector/inspector.ts';
import { Updater } from './updater.ts';

Updater.updateStates = function (verNum) {
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const states = Data.states;
		const keys = Object.keys(Inspector.fileState.create());
		for (const [guid, sState] of Object.entries(states)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dState = Inspector.fileState.create();
			for (const key of keys) {
				if (key in (sState as any)) {
					dState[key] = sState[key];
				}
			}
			states[guid] = dState;
			File.planToSave(meta);
		}
	}
};
