import { $, getElementWriter } from '@/util/dom.ts';
import { Browser } from '@/browser/project-browser.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { AttributeListInterface } from '@/tools/property-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

interface FileEntityPage {
	target: any;
	meta: any;
	initialize: () => void;
	create: () => object;
	open: (entity: any, meta: any) => void;
	close: () => void;
	update: (entity: any, key: string, value: any) => void;
	paramInput: (event: any) => void;
	listChange: (event: any) => void;
}

function createFileEntityPage(name: string, inspectorKey: string): FileEntityPage {
	const domKey = 'file' + name;
	const entity = {
		target: null,
		meta: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null,
		listChange: null
	} as FileEntityPage;

	entity.initialize = function () {
		$(`#${domKey}-attributes`).bind(new AttributeListInterface());
		$(`#${domKey}-events`).bind(new EventListInterface(this));
		$(`#${domKey}-scripts`).bind(new ScriptListInterface());
		$(`#${domKey}-parameter-pane`).bind($(`#${domKey}-scripts`));
		$(`#${domKey}-icon, #${domKey}-clip, #${domKey}-inherit`).on('input', this.paramInput);
		$(`#${domKey}-attributes, #${domKey}-events, #${domKey}-scripts`).on(
			'change',
			this.listChange
		);
	};

	entity.create = function () {
		return {
			icon: '',
			clip: [0, 0, 32, 32],
			inherit: '',
			attributes: [],
			events: [],
			scripts: []
		};
	};

	entity.open = function (target, meta) {
		if (this.meta !== meta) {
			this.target = target;
			this.meta = meta;
			const write = getElementWriter(domKey, target);
			write('icon');
			write('clip');
			write('inherit');
			write('attributes');
			write('events');
			write('scripts');
		}
	};

	entity.close = function () {
		if (this.target) {
			Browser.unselect(this.meta);
			this.target = null;
			this.meta = null;
			$(`#${domKey}-attributes`).clear();
			$(`#${domKey}-events`).clear();
			$(`#${domKey}-scripts`).clear();
			$(`#${domKey}-parameter-pane`).clear();
		}
	};

	entity.update = function (target, key, value) {
		File.planToSave(this.meta);
		switch (key) {
			case 'icon':
			case 'clip':
				if (target[key] !== value) {
					target[key] = value;
					Browser.body.updateIcon(this.meta.file);
				}
				break;
			case 'inherit':
				if (target[key] !== value) {
					target[key] = value;
				}
				break;
		}
	};

	entity.paramInput = function (event) {
		entity.update(entity.target, Inspector.getKey(this), this.read());
	};

	entity.listChange = function (event) {
		File.planToSave(entity.meta);
	};

	Inspector[inspectorKey] = entity;
	return entity;
}

export const FileSkill = createFileEntityPage('Skill', 'fileSkill');
export const FileItem = createFileEntityPage('Item', 'fileItem');
export const FileEquipment = createFileEntityPage('Equipment', 'fileEquipment');
export const FileState = createFileEntityPage('State', 'fileState');
