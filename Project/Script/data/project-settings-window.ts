import { ipcRenderer } from 'electron';
import { $, getElementWriter } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Selector } from '@/browser/resource-selector.ts';
import { Data } from './data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Log } from '@/log/log-window.ts';
import { Title } from '@/title/title-bar.ts';
import { Local } from '@/tools/localization.ts';
import { AttributeListInterface } from '@/tools/property-list.ts';
import { Window } from '@/tools/window-object.ts';

export const Project = {
	data: null,
	changed: false,
	importedFonts: null,
	languages: null,
	tscStarted: false,
	initialize: null,
	open: null,
	startTSC: null,
	stopTSC: null,
	windowClose: null,
	windowClosed: null,
	projectChange: null,
	dataChange: null,
	paramInput: null,
	confirm: null
};

Project.initialize = function () {
	$('#config-window-display').loadItems([
		{ name: 'Windowed', value: 'windowed' },
		{ name: 'Maximized', value: 'maximized' },
		{ name: 'Fullscreen', value: 'fullscreen' }
	]);

	$('#config-collision-actor-enabled').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	$('#config-collision-scene-enabled').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	$('#config-collision-scene-enabled')
		.enableHiddenMode()
		.relate([{ case: true, targets: [$('#config-collision-scene-actorSize')] }]);

	$('#config-collision-trigger-collideWithActorShape').loadItems([
		{ name: "Collide With Actor's Shape", value: true },
		{ name: "Collide With Actor's Anchor", value: false }
	]);

	$('#config-text-importedFonts').bind(this.importedFonts);

	$('#config-text-highDefinition').loadItems([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);

	$('#config-actor-tempAttributes').bind(new AttributeListInterface());

	$('#config-webgl-desynchronized').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	$('#config-webgl-textureMagFilter').loadItems([
		{ name: 'Nearest', value: 'nearest' },
		{ name: 'Linear', value: 'linear' }
	]);

	$('#config-webgl-textureMinFilter').loadItems([
		{ name: 'Nearest', value: 'nearest' },
		{ name: 'Linear', value: 'linear' }
	]);

	$('#config-script-autoCompile').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);

	$('#config-save-location').loadItems([
		{ name: 'App Data', value: 'app-data' },
		{ name: 'Documents', value: 'documents' },
		{ name: 'Local Directory', value: 'local' }
	]);

	$('#config-save-location')
		.enableHiddenMode()
		.relate([
			{
				case: ['app-data', 'documents'],
				targets: [$('#config-save-subdir')]
			}
		]);

	$('#config-localization-languages').bind(this.languages);

	$('#config-preload').loadItems([
		{ name: 'Never', value: 'never' },
		{ name: 'Always', value: 'always' },
		{ name: 'Only on Deployment', value: 'deployed' }
	]);

	window.on('datachange', this.projectChange);
	$('#project-settings').on('close', this.windowClose);
	$('#project-settings').on('closed', this.windowClosed);
	$('#project-settings').on('change', this.dataChange);
	$('#project-confirm').on('click', this.confirm);
	$(`#config-window-title, #config-window-width, #config-window-height,
    #config-window-display, #config-resolution-width, #config-resolution-height,
    #config-resolution-sceneScale, #config-resolution-uiScale,
    #config-scene-padding, #config-scene-animationInterval,
    #config-tileArea-expansionTop, #config-tileArea-expansionLeft,
    #config-tileArea-expansionRight, #config-tileArea-expansionBottom,
    #config-animationArea-expansionTop, #config-animationArea-expansionLeft,
    #config-animationArea-expansionRight, #config-animationArea-expansionBottom,
    #config-lightArea-expansionTop, #config-lightArea-expansionLeft,
    #config-lightArea-expansionRight, #config-lightArea-expansionBottom,
    #config-virtualAxis-up, #config-virtualAxis-down, #config-virtualAxis-left, #config-virtualAxis-right,
    #config-collision-actor-enabled, #config-collision-scene-enabled, #config-collision-scene-actorSize,
    #config-collision-trigger-collideWithActorShape, #config-text-fontFamily,
    #config-text-highDefinition, #config-animation-frameRate,
    #config-soundAttenuation-distance, #config-soundAttenuation-easingId,
    #config-webgl-desynchronized, #config-webgl-textureMagFilter, #config-webgl-textureMinFilter,
    #config-script-autoCompile, #config-save-location, #config-save-subdir,
    #config-localization-languages, #config-localization-default, #config-preload, #config-deadzone`).on(
		'input',
		this.paramInput
	);
};

Project.open = function () {
	Window.open('project-settings');

	this.data = Object.clone(Data.config);

	$('#config-soundAttenuation-easingId').loadItems(Data.createEasingItems());

	const write = getElementWriter('config', this.data);
	write('window-title');
	write('window-width');
	write('window-height');
	write('window-display');
	write('resolution-width');
	write('resolution-height');
	write('resolution-sceneScale');
	write('resolution-uiScale');
	write('scene-padding');
	write('scene-animationInterval');
	write('tileArea-expansionTop');
	write('tileArea-expansionLeft');
	write('tileArea-expansionRight');
	write('tileArea-expansionBottom');
	write('animationArea-expansionTop');
	write('animationArea-expansionLeft');
	write('animationArea-expansionRight');
	write('animationArea-expansionBottom');
	write('lightArea-expansionTop');
	write('lightArea-expansionLeft');
	write('lightArea-expansionRight');
	write('lightArea-expansionBottom');
	write('virtualAxis-up');
	write('virtualAxis-down');
	write('virtualAxis-left');
	write('virtualAxis-right');
	write('collision-actor-enabled');
	write('collision-scene-enabled');
	write('collision-scene-actorSize');
	write('collision-trigger-collideWithActorShape');
	write('text-importedFonts');
	write('text-fontFamily');
	write('text-highDefinition');
	write('actor-tempAttributes');
	write('animation-frameRate');
	write('soundAttenuation-distance');
	write('soundAttenuation-easingId');
	write('webgl-desynchronized');
	write('webgl-textureMagFilter');
	write('webgl-textureMinFilter');
	write('script-autoCompile');
	write('save-location');
	write('save-subdir');
	write('localization-languages');
	write('localization-default');
	write('preload');
	write('deadzone');
};

Project.startTSC = function () {
	if (!this.tscStarted) {
		this.tscStarted = true;
		ipcRenderer.send('start-tsc', File.root);
	}
};

Project.stopTSC = function () {
	if (this.tscStarted) {
		this.tscStarted = false;
		ipcRenderer.send('stop-tsc');
		Log.clear();
	}
};

Project.windowClose = function (event) {
	if (Project.changed) {
		event.preventDefault();
		const get = Local.createGetter('confirmation');
		Window.confirm(
			{
				message: get('closeUnsavedProjectSettings')
			},
			[
				{
					label: get('yes'),
					click: () => {
						Project.changed = false;
						Window.close('project-settings');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
};

Project.windowClosed = function () {
	Project.data = null;
};

Project.projectChange = function (event) {
	if (event.key === 'config') {
		const last = event.last.script;
		const current = Data.config.script;
		if (current.autoCompile !== last.autoCompile) {
			if (current.autoCompile) {
				Project.startTSC();
			} else {
				Project.stopTSC();
			}
		}
	}
};

Project.dataChange = function () {
	this.changed = true;
}.bind(Project);

Project.paramInput = function () {
	const key = Inspector.getKey(this);
	const value = this.read();
	const keys = key.split('-');
	const end = keys.length - 1;
	let node = Project.data;
	for (let i = 0; i < end; i++) {
		node = node[keys[i]];
	}
	const property = keys[end];
	if (node[property] !== value) {
		node[property] = value;
	}
};

(Project as any).filterDuplicateLanguages = function () {
	const local = this.data.localization;
	const languages = [];
	for (const language of local.languages) {
		languages.append(language);
	}
	local.languages = languages;
};

Project.confirm = function () {
	if (this.changed) {
		this.changed = false;
		this.filterDuplicateLanguages();
		const last = Data.config;
		const title1 = Data.config.window.title;
		const title2 = this.data.window.title;
		Data.config = this.data;
		File.planToSave(Data.manifest.project.config);
		if (title1 !== title2) {
			Title.updateTitleName();
		}
		const datachange = new Event('datachange');
		datachange.key = 'config';
		datachange.last = last;
		window.dispatchEvent(datachange);
	}
	Window.close('project-settings');
}.bind(Project);

Project.importedFonts = {
	fontId: null,
	filter: 'font',
	initialize: function () {},
	parse: function (fontId) {
		return Command.removeTextTags(Command.parseFileName(fontId));
	},
	open: function (fontId = '') {
		this.fontId = fontId;
		Selector.open(this, false);
	},
	save: function () {
		return this.fontId;
	},
	read: function () {
		return this.fontId;
	},
	input: function (fontId) {
		this.fontId = fontId;
		this.target.save();
	}
};

Project.languages = {
	initialize: function (list) {
		$('#language-confirm').on('click', () => {
			if (list.inserting) {
				const languages = Project.data.localization.languages;
				const langName = $('#language-name').read();
				if (languages.find((lang) => lang.name === langName)) {
					return $('#language-name').getFocus();
				}
			}
			this.target.save();
			Window.close('language');
		});
	},
	parse: function (language) {
		return [
			{ content: Local.get('languages.' + language.name) },
			{ content: language.name, class: 'weak' }
		];
	},
	open: function (language = { name: '', font: '', scale: 1 }) {
		$('#language-name').loadItems(this.createAllItems());
		$('#language-name').write2(language.name);
		$('#language-font').write(language.font);
		$('#language-scale').write(language.scale);
		$('#language-name').getFocus();
		Window.open('language');
	},
	save: function () {
		return {
			name: $('#language-name').read(),
			font: $('#language-font').read(),
			scale: $('#language-scale').read()
		};
	},
	update: function () {
		const selectBox = $('#config-localization-default');
		const defaultLang = selectBox.read();
		selectBox.loadItems(Project.languages.createValidItems());
		if (defaultLang) selectBox.write(defaultLang);
	},
	createAllItems: function () {
		const items = [];
		const languages = Local.get('languages');
		if (languages) {
			for (const [value, name] of Object.entries(languages)) {
				if (value !== 'auto') {
					items.push({ name, value });
				}
			}
		}
		return items;
	},
	createValidItems: function () {
		const items = [];
		const languages = Local.get('languages');
		if (languages) {
			const langList = new Set(Project.data.localization.languages.map((lang) => lang.name));
			for (const [value, name] of Object.entries(languages)) {
				if (value === 'auto' || langList.has(value)) {
					items.push({ name, value });
				}
			}
		}
		return items;
	}
};
