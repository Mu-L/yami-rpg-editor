import { $, getElementWriter } from '@/util/dom.ts';
import { Browser } from '@/browser/project-browser.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { AttributeListInterface } from '@/tools/property-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

{
	const FileState = {
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

	FileState.initialize = function () {
		$('#fileState-attributes').bind(new AttributeListInterface());

		$('#fileState-events').bind(new EventListInterface(this));

		$('#fileState-scripts').bind(new ScriptListInterface());

		$('#fileState-parameter-pane').bind($('#fileState-scripts'));

		$('#fileState-icon, #fileState-clip, #fileState-inherit').on('input', this.paramInput);
		$('#fileState-attributes, #fileState-events, #fileState-scripts').on(
			'change',
			this.listChange
		);
	};

	FileState.create = function () {
		return {
			icon: '',
			clip: [0, 0, 32, 32],
			inherit: '',
			attributes: [],
			events: [],
			scripts: []
		};
	};

	FileState.open = function (state, meta) {
		if (this.meta !== meta) {
			this.target = state;
			this.meta = meta;

			const write = getElementWriter('fileState', state);
			write('icon');
			write('clip');
			write('inherit');
			write('attributes');
			write('events');
			write('scripts');
		}
	};

	FileState.close = function () {
		if (this.target) {
			Browser.unselect(this.meta);
			this.target = null;
			this.meta = null;
			$('#fileState-attributes').clear();
			$('#fileState-events').clear();
			$('#fileState-scripts').clear();
			$('#fileState-parameter-pane').clear();
		}
	};

	FileState.update = function (state, key, value) {
		File.planToSave(this.meta);
		switch (key) {
			case 'icon':
			case 'clip':
				if (state[key] !== value) {
					state[key] = value;
					Browser.body.updateIcon(this.meta.file);
				}
				break;
			case 'inherit':
				if (state[key] !== value) {
					state[key] = value;
				}
				break;
		}
	};

	FileState.paramInput = function (event) {
		FileState.update(FileState.target, Inspector.getKey(this), this.read());
	};

	FileState.listChange = function (event) {
		File.planToSave(FileState.meta);
	};

	Inspector.fileState = FileState;
}
