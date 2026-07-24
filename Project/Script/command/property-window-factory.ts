import { $, getElementReader, getElementWriter } from '../util/dom.ts';
import { Command } from './command-object.ts';
import { Token } from './mark-string-manager.ts';
import { Local } from '../tools/localization.ts';
import { Window } from '../tools/window-object.ts';

// ******************************** 属性窗口工厂 ********************************

// 属性键配置项
interface PropertyKeyConfig {
	name: string;
	value: string;
	cases?: string[];
	uiName?: string;
	default?: any;
	targets?: string[];
}

// parsers 闭包签名：(value, get, name) => string
type ParserFn = (value: any, get: (key: string) => string, name: string) => string;

// 属性窗口工厂配置
interface PropertyWindowConfig {
	prefix: string;
	locale: string;
	keys: PropertyKeyConfig[];
	parseValue?: (key: string, value: any, get: (key: string) => string) => string;
	parsers?: Record<string, ParserFn>;
	init?: (this: any) => void;
	openData?: (defaults: Record<string, any>, key: string, value: any) => void;
	saveData?: (key: string, read: (k: string) => any) => any;
	subRelates?: Array<{
		selector: string;
		cases: Array<{ case: string; targets: string[] }>;
	}>;
}

// 属性窗口返回契约
interface PropertyWindow {
	target: any;
	initialize: (() => void) | null;
	parse: ((data: { key: string; value: any }, listData?: boolean) => string) | null;
	open: ((data?: { key: string; value: any }) => void) | null;
	save: (() => { key: string; value: any }) | null;
	confirm: ((event: Event) => { key: string; value: any }) | null;
}

export function createPropertyWindow(config: PropertyWindowConfig): PropertyWindow {
	const { prefix, locale, keys, parseValue, parsers, init, openData, saveData, subRelates } =
		config;

	const PropertyWindow = {
		target: null,
		initialize: null,
		parse: null,
		open: null,
		save: null,
		confirm: null
	};

	PropertyWindow.initialize = function () {
		const items = keys.map((k) => ({ name: k.name, value: k.value }));
		$(`#${prefix}-property-key`).loadItems(items);

		const relates = keys.map((k) => {
			const caseValue = k.cases ?? k.value;
			const uiName = k.uiName ?? k.value;
			const targets = k.targets
				? k.targets.map((id) => $(`#${prefix}-property-${id}`))
				: [$(`#${prefix}-property-${uiName}`)];
			return { case: caseValue, targets };
		});
		$(`#${prefix}-property-key`).enableHiddenMode().relate(relates);

		if (subRelates) {
			for (const sr of subRelates) {
				const subRelates2 = sr.cases.map((c) => ({
					case: c.case,
					targets: c.targets.map((id) => $(`#${prefix}-property-${id}`))
				}));
				$(`#${prefix}-property-${sr.selector}`).enableHiddenMode().relate(subRelates2);
			}
		}

		init?.call(this);

		$(`#${prefix}-property-confirm`).on('click', this.confirm);
	};

	PropertyWindow.parse = function ({ key, value }, listData) {
		const get = Local.createGetter(locale);
		const name = get(key).replace('.', Token('.'));
		let string;

		if (parsers) {
			const parser = parsers[key];
			if (parser) {
				string = parser(value, get, name);
			}
		} else if (parseValue) {
			string = name + Token('(') + parseValue(key, value, get) + Token(')');
		}

		if (listData) {
			string = Command.removeTextTags(string);
		}
		return string;
	};

	PropertyWindow.open = function (data) {
		const defaultKey = keys[0].value;
		const defaultVal = keys[0].default;
		const key = data?.key ?? defaultKey;
		const value = data?.value ?? defaultVal;

		Window.open(`${prefix}-property`);

		const defaults = {};
		for (const k of keys) {
			defaults[k.uiName ?? k.value] = k.default;
		}

		if (openData) {
			openData(defaults, key, value);
		} else {
			defaults[key] = value;
		}

		const write = getElementWriter(`${prefix}-property`, defaults);
		write('key', key);
		for (const k of keys) {
			write(k.uiName ?? k.value);
		}
		$(`#${prefix}-property-key`).getFocus();
	};

	PropertyWindow.save = function () {
		const read = getElementReader(`${prefix}-property`);
		const key = read('key');
		let value;

		if (saveData) {
			value = saveData(key, read);
		} else {
			const keyObj = keys.find((k) => k.value === key);
			value = read(keyObj?.uiName ?? key);
		}

		Window.close(`${prefix}-property`);
		return { key, value };
	};

	PropertyWindow.confirm = function (event) {
		return PropertyWindow.target.save();
	};

	return PropertyWindow;
}
