import { $ } from '@/util/dom.ts';
import { Editor } from '@/main/editor.ts';
import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Local } from '@/tools/localization.ts';
import { Window } from '@/tools/window-object.ts';
import { Path } from '@/util/config.ts';

export const ImportLanguage = {
	filePath: '',
	initialize: null,
	open: null,
	importLanguagePack: null,
	parseLanguagePack: null,
	confirm: null
};

ImportLanguage.initialize = function () {
	$('#importLanguage-confirm').on('click', this.confirm);
};

ImportLanguage.open = function () {
	const dialogs = Editor.config.dialogs;
	File.showOpenDialog({
		defaultPath: Path.resolve(dialogs.import),
		filters: [
			{
				name: 'Language Pack',
				extensions: ['txt']
			}
		]
	}).then(({ filePaths }) => {
		if (filePaths.length === 1) {
			Window.open('importLanguage');
			const items = [];
			for (const language of Data.config.localization.languages) {
				items.push({
					name: Local.get('languages.' + language.name),
					value: language.name
				});
			}
			const filePath = (this.filePath = filePaths[0]);
			const basename = Path.basename(filePath);
			const extname = Path.extname(basename);
			const language = Path.basename(filePath, extname);
			$('#importLanguage-language').loadItems(items);
			$('#importLanguage-language').write2(language);
			$('#importLanguage-language').getFocus();
			dialogs.import = Path.slash(Path.dirname(filePath));
		}
	});
};

ImportLanguage.importLanguagePack = function (language, string) {
	const map = Data.localization.map;
	for (const [id, text] of Object.entries(this.parseLanguagePack(string))) {
		const item = map[id];
		if (item?.contents[language] !== undefined) {
			item.contents[language] = text;
		}
	}
	File.planToSave(Data.manifest.project.localization);
};

ImportLanguage.parseLanguagePack = function (string) {
	const regexp = /\$([0-9a-fA-F]{16})\n([\s\S]*?)\n?(?=\n?\$[0-9a-fA-F]{16}|$)/g;
	const map = {};
	let match;
	while ((match = regexp.exec(string))) {
		const id = match[1].toLowerCase();
		const text = match[2];
		map[id] = text;
	}
	return map;
};

ImportLanguage.confirm = function (event) {
	const get = Local.createGetter('confirmation');
	const filename = Path.basename(ImportLanguage.filePath);
	const language = $('#importLanguage-language').read();
	const langname = Local.get('languages.' + language);
	Window.confirm(
		{
			message: get('importLanguagePack')
				.replace('<filename>', filename)
				.replace('<langname>', langname)
		},
		[
			{
				label: get('confirm'),
				click: () => {
					Window.close('importLanguage');
					File.get({
						local: ImportLanguage.filePath,
						type: 'text'
					}).then((text) => {
						if (text) {
							ImportLanguage.importLanguagePack(language, text);
						}
					});
				}
			},
			{
				label: get('cancel')
			}
		]
	);
};
