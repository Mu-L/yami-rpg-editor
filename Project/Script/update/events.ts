import { Data } from '../data/data-object.ts';
import { EventEditor } from '../command/event-editor.ts';
import { File } from '../file/file-system-core.ts';
import { Inspector } from '../inspector/inspector.ts';
import { Updater } from './updater.ts';

Updater.updateLocalEvents = function (verNum) {
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const listMap = EventEditor.getAllLocalEvents();
		for (const [guid, events] of Object.entries(listMap)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			for (const event of events as any) {
				const { commands } = event;
				delete event.commands;
				event.enabled = true;
				event.commands = commands;
			}
			File.planToSave(meta, guid);
		}
	}
};

Updater.updateGlobalEvents = function (verNum) {
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const events = Data.events;
		const keys = Object.keys(Inspector.fileEvent.create('global'));
		for (const [guid, sEvent] of Object.entries(events)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dEvent = Inspector.fileEvent.create('global');
			for (const key of keys) {
				if (key in (sEvent as any)) {
					dEvent[key] = sEvent[key];
					continue;
				}
				switch (key) {
					case 'namespace':
						dEvent[key] = false;
						continue;
				}
			}
			events[guid] = dEvent;
			File.planToSave(meta);
		}
	}
};

Updater.updateGlobalEvent = function (meta) {
	const guid = meta.guid;
	const sEvent = Data.events[guid];
	if ('namespace' in sEvent || 'priority' in sEvent) return;
	const dEvent = Inspector.fileEvent.create('global');
	for (const key of Object.keys(dEvent)) {
		if (key in (sEvent as any)) {
			dEvent[key] = sEvent[key];
			continue;
		}
		switch (key) {
			case 'namespace':
				dEvent[key] = false;
				continue;
		}
	}
	Data.events[guid] = dEvent;
	File.planToSave(meta);
};
