import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Log } from '@/log/log-window.ts';
import { Printer } from '@/printer/printer.ts';

export const GameLocal = {
	active: '',
	language: '',
	refRegexp: /<ref:([0-9a-f]{16})>/g,
	langRemap: {
		'zh-HK': 'zh-TW',
		'zh-SG': 'zh-TW'
	},
	initialize: null,
	setLanguage: null,
	getLanguage: null,
	get: null,
	replace: null,
	reloadLanguages: null,
	datachange: null
};

GameLocal.initialize = function () {
	this.setLanguage(Data.config.localization.default);

	window.on('datachange', this.datachange);
};

GameLocal.setLanguage = async function (language) {
	if (this.language !== language || language === 'auto') {
		const languages = Data.config.localization.languages;
		let active = language;
		if (active === 'auto') {
			active = this.getLanguage();
		}
		let settings = languages.find((lang) => lang.name === active);
		if (!settings) settings = languages[0] ?? { name: active, font: '', scale: 1 };
		try {
			this.active = settings.name;
			this.language = language;
			window.dispatchEvent(new Event('localizationchange'));
			Printer.setLanguageFont(settings.font);
			Printer.setSizeScale(settings.scale);
			Printer.setWordWrap(['zh-CN', 'zh-TW', 'ja', 'ko'].includes(active) ? 'break' : 'keep');
		} catch (error: any) {
			Log.throw(error);
		}
	}
};

GameLocal.getLanguage = function () {
	const languages = Data.config.localization.languages.map((lang) => lang.name);
	let nLanguage = navigator.language;
	if (this.langRemap[nLanguage]) {
		nLanguage = this.langRemap[nLanguage];
	}
	let language = languages[0] ?? nLanguage;
	let matchedWeight = 0;
	const sKeys = nLanguage.split('-');
	for (const key of languages) {
		const dKeys = key.split('-');
		if (sKeys[0] === dKeys[0]) {
			let weight = 0;
			for (let sKey of sKeys) {
				if (dKeys.includes(sKey)) {
					weight++;
				}
			}
			if (matchedWeight < weight) {
				matchedWeight = weight;
				language = key;
			}
		}
	}
	return language;
};

GameLocal.get = function (id) {
	const map = Data.localization.map;
	return map[id]?.contents[this.active];
};

GameLocal.replace = function (text) {
	return text.replace(this.refRegexp, (match, refId) => {
		const ref = this.get(refId);
		return ref !== undefined ? ref : match;
	});
};

GameLocal.reloadLanguages = function () {
	const languages = Data.config.localization.languages.map((lang) => lang.name);
	const reload = (items) => {
		for (const item of items) {
			if (item.class === 'folder') {
				reload(item.children);
			} else {
				const contents = {};
				for (const language of languages) {
					contents[language] = item.contents[language] ?? '';
				}
				item.contents = contents;
			}
		}
	};
	reload(Data.localization.list);
	File.planToSave(Data.manifest.project.localization);
};

GameLocal.datachange = function (event) {
	if (event.key === 'config') {
		const last = event.last.localization;
		const now = Data.config.localization;
		const lastLanguages = last.languages.map((lang) => lang.name);
		const nowLanguages = now.languages.map((lang) => lang.name);
		if (JSON.stringify(lastLanguages) !== JSON.stringify(nowLanguages)) {
			GameLocal.reloadLanguages();
			// 如果是自动语言，随着语言列表的变化重新加载
			if (now.default === 'auto') {
				GameLocal.setLanguage(now.default);
				return;
			}
		}
		// 默认语言改变时重新设置语言
		if (last.default !== now.default) {
			GameLocal.setLanguage(now.default);
			return;
		}
		const selector = (lang) => lang.name === GameLocal.active;
		const lastSettings = last.languages.find(selector);
		const nowSettings = now.languages.find(selector);
		if (JSON.stringify(lastSettings ?? '') !== JSON.stringify(nowSettings ?? '')) {
			Printer.setLanguageFont(nowSettings?.font ?? Printer.languageFont);
			Printer.setSizeScale(nowSettings?.scale ?? Printer.sizeScale);
		}
	}
};
