import { $, getElementWriter } from '@/util/dom.ts';
import { Browser } from '@/browser/project-browser.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { AttributeListInterface } from '@/tools/property-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

{
	const FileSkill = {
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

	FileSkill.initialize = function () {
		$('#fileSkill-attributes').bind(new AttributeListInterface());

		$('#fileSkill-events').bind(new EventListInterface(this));

		$('#fileSkill-scripts').bind(new ScriptListInterface());

		$('#fileSkill-parameter-pane').bind($('#fileSkill-scripts'));

		$('#fileSkill-icon, #fileSkill-clip, #fileSkill-inherit').on('input', this.paramInput);
		$('#fileSkill-attributes, #fileSkill-events, #fileSkill-scripts').on(
			'change',
			this.listChange
		);
	};

	FileSkill.create = function () {
		return {
			icon: '',
			clip: [0, 0, 32, 32],
			inherit: '',
			attributes: [],
			events: [],
			scripts: []
		};
	};

	FileSkill.open = function (skill, meta) {
		if (this.meta !== meta) {
			this.target = skill;
			this.meta = meta;

			const write = getElementWriter('fileSkill', skill);
			write('icon');
			write('clip');
			write('inherit');
			write('attributes');
			write('events');
			write('scripts');
		}
	};

	FileSkill.close = function () {
		if (this.target) {
			Browser.unselect(this.meta);
			this.target = null;
			this.meta = null;
			$('#fileSkill-attributes').clear();
			$('#fileSkill-events').clear();
			$('#fileSkill-scripts').clear();
			$('#fileSkill-parameter-pane').clear();
		}
	};

	FileSkill.update = function (skill, key, value) {
		File.planToSave(this.meta);
		switch (key) {
			case 'icon':
			case 'clip':
				if (skill[key] !== value) {
					skill[key] = value;
					Browser.body.updateIcon(this.meta.file);
				}
				break;
			case 'inherit':
				if (skill[key] !== value) {
					skill[key] = value;
				}
				break;
		}
	};

	FileSkill.paramInput = function () {
		FileSkill.update(FileSkill.target, Inspector.getKey(this), this.read());
	};

	FileSkill.listChange = function () {
		File.planToSave(FileSkill.meta);
	};

	Inspector.fileSkill = FileSkill;
}
