import { $ } from '@/util/dom.ts';
import { Path } from '@/util/config.ts';
import { File } from '@/file/file-system-core.ts';
import { Editor } from '@/main/editor.ts';
import { Data } from '@/data/data-object.ts';
import { FSP } from '@/file/file-system.ts';
import { Local } from '@/tools/localization.ts';
import { Window } from '@/tools/window-object.ts';

export const ExportLanguage = {
	initialize: null,
	open: null,
	exportLanguagePack: null,
	stringifyLanguagePack: null,
	confirm: null
};

ExportLanguage.initialize = function () {
	$('#exportLanguage-confirm').on('click', this.confirm);
};

ExportLanguage.open = function () {
	Window.open('exportLanguage');

	const items = [];
	const none = { name: Local.get('common.none'), value: '' };
	for (const language of Data.config.localization.languages) {
		items.push({
			name: Local.get('languages.' + language.name),
			value: language.name
		});
	}
	$('#exportLanguage-first').loadItems(items);
	$('#exportLanguage-first').writeDefault();
	$('#exportLanguage-second').loadItems([none, ...items]);
	$('#exportLanguage-second').writeDefault();
};

ExportLanguage.exportLanguagePack = function (first, second) {
	const pack = {};
	const loadText = (items) => {
		for (const item of items) {
			if (item.class === 'folder') {
				loadText(item.children);
			} else {
				const { id, contents } = item;
				pack[id] = contents[first] || contents[second] || '';
			}
		}
	};
	loadText(Data.localization.list);
	return this.stringifyLanguagePack(pack);
};

ExportLanguage.stringifyLanguagePack = function (map) {
	const entries = Object.entries(map);
	const length = entries.length;
	const strings = new Array(length);
	for (let i = 0; i < length; i++) {
		const [id, text] = entries[i];
		strings[i] = '$' + id + '\n' + text;
	}
	return strings.join('\n\n');
};

ExportLanguage.confirm = function (event) {
	Window.close('exportLanguage');
	const dialogs = Editor.config.dialogs;
	const first = $('#exportLanguage-first').read();
	const second = $('#exportLanguage-second').read();
	File.showSaveDialog({
		defaultPath: Path.resolve(dialogs.export, first + '.txt')
	}).then(({ filePath }) => {
		if (filePath) {
			dialogs.export = Path.slash(Path.dirname(filePath));
			const string = ExportLanguage.exportLanguagePack(first, second);
			return FSP.writeFile(filePath, string);
		}
	});
};
