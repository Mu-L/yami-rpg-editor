import { $, getElementWriter } from '../util/dom.ts';
import { Browser } from '../browser/project-browser.ts';
import { File } from '../file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { EventListInterface } from '../tools/event-list.ts';
import { AttributeListInterface } from '../tools/property-list.ts';
import { ScriptListInterface } from '../tools/script-list.ts';

{
	const FileEquipment = {
		target: null,
		meta: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null,
		listChange: null
	};

	FileEquipment.initialize = function () {
		$('#fileEquipment-attributes').bind(new AttributeListInterface());

		$('#fileEquipment-events').bind(new EventListInterface(this));

		$('#fileEquipment-scripts').bind(new ScriptListInterface());

		$('#fileEquipment-parameter-pane').bind($('#fileEquipment-scripts'));

		$('#fileEquipment-icon, #fileEquipment-clip, #fileEquipment-inherit').on(
			'input',
			this.paramInput
		);
		$('#fileEquipment-attributes, #fileEquipment-events, #fileEquipment-scripts').on(
			'change',
			this.listChange
		);
	};

	FileEquipment.create = function () {
		return {
			icon: '',
			clip: [0, 0, 32, 32],
			inherit: '',
			attributes: [],
			events: [],
			scripts: []
		};
	};

	FileEquipment.open = function (equipment, meta) {
		if (this.meta !== meta) {
			this.target = equipment;
			this.meta = meta;

			const write = getElementWriter('fileEquipment', equipment);
			write('icon');
			write('clip');
			write('inherit');
			write('attributes');
			write('events');
			write('scripts');
		}
	};

	FileEquipment.close = function () {
		if (this.target) {
			Browser.unselect(this.meta);
			this.target = null;
			this.meta = null;
			$('#fileEquipment-attributes').clear();
			$('#fileEquipment-events').clear();
			$('#fileEquipment-scripts').clear();
			$('#fileEquipment-parameter-pane').clear();
		}
	};

	FileEquipment.update = function (equipment, key, value) {
		File.planToSave(this.meta);
		switch (key) {
			case 'icon':
			case 'clip':
				if (equipment[key] !== value) {
					equipment[key] = value;
					Browser.body.updateIcon(this.meta.file);
				}
				break;
			case 'inherit':
				if (equipment[key] !== value) {
					equipment[key] = value;
				}
				break;
		}
	};

	FileEquipment.paramInput = function (event) {
		FileEquipment.update(FileEquipment.target, Inspector.getKey(this), this.read());
	};

	FileEquipment.listChange = function (event) {
		File.planToSave(FileEquipment.meta);
	};

	Inspector.fileEquipment = FileEquipment;
}
