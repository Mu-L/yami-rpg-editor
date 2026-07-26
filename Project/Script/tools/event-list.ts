import { Command } from '@/command/command-object.ts';
import { Data } from '@/data/data-object.ts';
import { EventEditor } from '@/command/event-editor.ts';
import { TreeList } from '@/components/tree-list.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Local } from './localization.ts';

import { IListInterface } from '@/types/list-interface.ts';

export class EventListInterface implements IListInterface {
	target: HTMLElement | null;
	type: string;
	filter: string;
	editor: any | null;
	owner: any | null;
	eventItem: any | null;
	editCallback: (() => void) | null;
	insertCallback: (() => void) | null;
	history: any | null;

	constructor(editor?: any, owner?: any) {
		this.editor = editor ?? null;
		this.owner = owner ?? null;
	}

	initialize(list: any): void {
		list.togglable = true;
		this.filter = list.getAttribute('filter');
		this.type = `${this.filter}.event`;
		this.editCallback = () => list.save();
		this.insertCallback = () => {
			if (list.inserting) {
				list.save();
				list.inserting = false;
			} else {
				list.start--;
				list.save();
				list.select(list.start + 1);
			}
		};

		const { editor, owner } = this;
		if (editor && owner) {
			this.history = new Inspector.ParamHistory(editor, owner, list);
			this.history.save = EventListInterface.historySave;
		}

		window.on('localize', () => {
			if (list.data) list.update();
		});
	}

	parse(event: any) {
		const { type } = event;
		if (EventListInterface.guidRegExp.test(type)) {
			Command.invalid = false;
			const groupKey = this.filter + '-event';
			const eventType = Command.parseGroupEnumString(groupKey, type);
			const eventClass = Command.invalid ? 'invalid' : event.enabled ? '' : 'weak';
			return {
				content: Command.removeTextTags(eventType),
				class: eventClass
			};
		}
		return {
			content: Local.get('eventTypes.' + type),
			class: event.enabled ? '' : 'weak'
		};
	}

	update(list: any) {
		const elements = list.elements;
		const items = list.read();
		const length = items.length;
		if (length !== 0) {
			const flags = {};
			for (let i = length - 1; i >= 0; i--) {
				const { type } = items[i];
				if (flags[type]) {
					elements[i].addClass('weak');
				} else {
					flags[type] = true;
				}
			}
		}

		const item = this.editor?.target;
		if (item?.events === list.read()) {
			const element = item.element;
			const list = element?.parentNode;
			if (list instanceof TreeList) {
				(list as any).updateEventIcon(item);
			}
		}
	}

	open(event: any) {
		const filter = this.filter;
		let callback = this.editCallback;
		let inserting = false;
		if (event === undefined) {
			event = Inspector.fileEvent.create(filter);
			callback = this.insertCallback;
			inserting = true;
		}
		const target = this.editor.target;
		if (target.guid) {
			const id = target.guid;
			const fileName = Data.manifest.guidMap[id]?.file.basename;
			this.eventItem = EventEditor.openLocalEvent(
				inserting,
				filter,
				fileName,
				event,
				callback
			);
		} else if (target.presetId) {
			const id = target.presetId;
			const preset = Data.scenePresets[id] ?? Data.uiPresets[id];
			if (preset) {
				const rootId = preset.sceneId ?? preset.uiId;
				const rootName = Data.manifest.guidMap[rootId]?.file.basename;
				const eventName = `${rootName}.${preset.data.name}`;
				this.eventItem = EventEditor.openLocalEvent(
					inserting,
					filter,
					eventName,
					event,
					callback
				);
			}
		}
	}

	save() {
		return EventEditor.save(this.eventItem);
	}

	static guidRegExp = /^[0-9a-f]{16}$/;

	static historySave(data: any) {
		Inspector.ParamHistory.prototype.save.call(this, data);
		if (data.type === 'inspector-param-replace') {
			delete data.swap.commands.symbol;
		}
	}
}
