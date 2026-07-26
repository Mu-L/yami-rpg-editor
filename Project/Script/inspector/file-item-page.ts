import { $, getElementWriter } from '@/util/dom.ts';
import { Browser } from '@/browser/project-browser.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { AttributeListInterface } from '@/tools/property-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

{
	const FileItem = {
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

	FileItem.initialize = function () {
		$('#fileItem-attributes').bind(new AttributeListInterface());

		$('#fileItem-events').bind(new EventListInterface(this));

		$('#fileItem-scripts').bind(new ScriptListInterface());

		$('#fileItem-parameter-pane').bind($('#fileItem-scripts'));

		$('#fileItem-icon, #fileItem-clip, #fileItem-inherit').on('input', this.paramInput);
		$('#fileItem-attributes, #fileItem-events, #fileItem-scripts').on(
			'change',
			this.listChange
		);
	};

	FileItem.create = function () {
		return {
			icon: '',
			clip: [0, 0, 32, 32],
			inherit: '',
			attributes: [],
			events: [],
			scripts: []
		};
	};

	FileItem.open = function (item, meta) {
		if (this.meta !== meta) {
			this.target = item;
			this.meta = meta;

			const write = getElementWriter('fileItem', item);
			write('icon');
			write('clip');
			write('inherit');
			write('attributes');
			write('events');
			write('scripts');
		}
	};

	FileItem.close = function () {
		if (this.target) {
			Browser.unselect(this.meta);
			this.target = null;
			this.meta = null;
			$('#fileItem-attributes').clear();
			$('#fileItem-events').clear();
			$('#fileItem-scripts').clear();
			$('#fileItem-parameter-pane').clear();
		}
	};

	FileItem.update = function (item, key, value) {
		File.planToSave(this.meta);
		switch (key) {
			case 'icon':
			case 'clip':
				if (item[key] !== value) {
					item[key] = value;
					Browser.body.updateIcon(this.meta.file);
				}
				break;
			case 'inherit':
				if (item[key] !== value) {
					item[key] = value;
				}
				break;
		}
	};

	FileItem.paramInput = function () {
		FileItem.update(FileItem.target, Inspector.getKey(this), this.read());
	};

	FileItem.listChange = function () {
		File.planToSave(FileItem.meta);
	};

	Inspector.fileItem = FileItem;
}
