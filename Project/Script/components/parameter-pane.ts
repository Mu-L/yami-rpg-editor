import { CheckBox } from './check-box.ts';
import { ColorBox } from './color-box.ts';
import { KeyboardBox } from './keyboard-box.ts';
import { ParamList } from './param-list.ts';
import { TypeRegistry } from './type-registry.ts';
import { CustomBox } from './custom-box.ts';
import { DetailSummary } from './detail-summary.ts';
import { NumberBox } from './number-box.ts';
import { NumberVar } from './number-var.ts';
import { SelectBox } from './select-box.ts';
import { Select } from './select-list.ts';
import { TextBox } from './text-box.ts';
import { TreeList } from './tree-list.ts';
import { Data } from '../data/data-object.ts';
import { PluginManager } from '../plugin/plugin.ts';
import { Local } from '../tools/localization.ts';
import { Selection } from '../tools/text-capture.ts';
import { measureText } from '../util/dom.ts';

export class ParameterPane extends HTMLElement {
	scriptList: HTMLElement | null;
	headPad: HTMLElement | null;
	metas: any[];
	wraps: any[];
	detailBoxes: any[];
	checkBoxes: any[];
	numberBoxes: any[];
	numberVars: any[];
	textBoxes: any[];
	selectBoxes: any[];
	keyboardBoxes: any[];
	colorBoxes: any[];
	customBoxes: any[];
	updateEventEnabled: boolean;
	windowLocalize: (event: Event) => void;
	scriptChange: (event: any) => void;
	getData: () => any[];
	onResize?: () => void;

	constructor() {
		super();

		this.scriptList = null;
		this.headPad = null;
		this.metas = [];
		this.wraps = [];
		this.detailBoxes = [];
		this.checkBoxes = [];
		this.numberBoxes = [];
		this.numberVars = [];
		this.textBoxes = [];
		this.selectBoxes = [];
		this.keyboardBoxes = [];
		this.colorBoxes = [];
		this.customBoxes = [];
		this.updateEventEnabled = false;
		this.windowLocalize = ParameterPane.windowLocalize.bind(this);
		this.scriptChange = ParameterPane.scriptChange.bind(this);

		window.on('localize', this.windowLocalize);
		this.on('change', this.componentChange);
	}

	bind(scriptList: HTMLElement): void {
		this.scriptList = scriptList;
		if (scriptList instanceof ParamList) {
			const { object } = scriptList as unknown as { object: any };
			const { update } = object;
			this.getData = () => (scriptList as unknown as { data: any }).data;
			object.update = (...args: any[]) => {
				update.apply(object, args);
				this.update();
			};
		}
		if (scriptList instanceof TreeList) {
			this.getData = () => {
				const item = (scriptList as HTMLElement & { read(): any }).read();
				return item ? [item] : [];
			};
		}
	}

	rewrite(parameters: any, key: string): void {
		for (const wrap of this.wraps) {
			const script = wrap.box.data;
			const map = script.parameters;
			if (map !== parameters) continue;
			for (const { input } of wrap.children) {
				if (input.key === key) {
					input.write(parameters[key]);
					(
						this.scriptList as (HTMLElement & { dispatchChangeEvent(): void }) | null
					)?.dispatchChangeEvent();
					if (input.branched) {
						(PluginManager as any).reconstruct(script);
						this.updateParamDisplay(wrap.box);
						this.onResize?.();
					}
					return;
				}
			}
		}
	}

	update(): void {
		this.clear();
		this.appendHeadPad();
		let changed = false;
		const scripts = this.getData();
		const map = (Data as any).manifest.guidMap;
		for (const script of scripts) {
			const meta = map[script.id];
			if (!meta) continue;
			this.metas.push(meta);
			if ((PluginManager as any).reconstruct(script)) {
				changed = true;
			}
			const paramList = meta.parameters;
			if (!paramList.length) continue;
			const langMap = meta.langMap.update();
			const parameters = script.parameters;
			if (meta.overview?.deprecated && paramList.length) {
				const banner = document.createElement('div');
				(banner as any).addClass('deprecated-banner');
				banner.textContent =
					typeof meta.overview.deprecated === 'string'
						? 'deprecated: ' + meta.overview.deprecated
						: 'deprecated';
				this.appendChild(banner);
			}
			// 按 group 分组（保留首次出现顺序），无 group 的参数归到空串主段
			const groupOrder: string[] = [];
			const groupMap = new Map<string, any[]>();
			for (const parameter of paramList) {
				const g = parameter.group || '';
				if (!groupMap.has(g)) {
					groupMap.set(g, []);
					groupOrder.push(g);
				}
				groupMap.get(g)!.push(parameter);
			}
			if (!groupMap.has('')) {
				groupMap.set('', []);
				groupOrder.unshift('');
			}
			const createParamRow = (
				box: any,
				grid: HTMLElement,
				children: any[],
				parameter: any
			) => {
				const inputWrap = this.createParamInput(parameter)!;
				const { label, input } = inputWrap;
				const key = parameter.key;
				const name = langMap.get(parameter.alias) ?? key;
				const desc = langMap.get(parameter.desc);
				const tip = desc ? `<b>${name}</b>\n${desc}` : '';
				this.updateParamInput(inputWrap, parameters[key]);
				label.textContent = name;
				(
					input as HTMLElement & {
						setTooltip(tip: (() => string) | string): void;
						parameters: any;
						key: string;
						enable(): void;
						disable(): void;
						removeClass(cls: string): void;
						addClass(cls: string): void;
						input?: HTMLElement;
					}
				).setTooltip(tip);
				(
					input as HTMLElement & {
						setTooltip(tip: (() => string) | string): void;
						parameters: any;
						key: string;
						enable(): void;
						disable(): void;
						removeClass(cls: string): void;
						addClass(cls: string): void;
						input?: HTMLElement;
					}
				).parameters = parameters;
				(
					input as HTMLElement & {
						setTooltip(tip: (() => string) | string): void;
						parameters: any;
						key: string;
						enable(): void;
						disable(): void;
						removeClass(cls: string): void;
						addClass(cls: string): void;
						input?: HTMLElement;
					}
				).key = key;
				grid.appendChild(label);
				if (parameter.prefix || parameter.suffix) {
					this.applyAffix(input, parameter);
				}
				grid.appendChild(input);
				(
					input as HTMLElement & {
						setTooltip(tip: (() => string) | string): void;
						parameters: any;
						key: string;
						enable(): void;
						disable(): void;
						removeClass(cls: string): void;
						addClass(cls: string): void;
						input?: HTMLElement;
					}
				).enable();
				if (parameter.readonly) {
					(
						input as HTMLElement & {
							setTooltip(tip: (() => string) | string): void;
							parameters: any;
							key: string;
							enable(): void;
							disable(): void;
							removeClass(cls: string): void;
							addClass(cls: string): void;
							input?: HTMLElement;
						}
					).disable();
				}
				if (parameter.validate) {
					const validateInput = () => {
						const val = (
							input as HTMLElement & {
								parameters?: Record<string, any>;
								key: string;
							}
						).parameters?.[(input as HTMLElement & { key: string }).key];
						const ok =
							val !== undefined &&
							(
								PluginManager as unknown as {
									checkValidate(param: any, val: any): boolean;
								}
							).checkValidate(parameter, val);
						if (ok) {
							(
								input as HTMLElement & {
									removeClass(cls: string): void;
								}
							).removeClass('validate-error');
						} else {
							(
								input as HTMLElement & {
									addClass(cls: string): void;
								}
							).addClass('validate-error');
						}
					};
					const nativeInput =
						(input as HTMLElement & { input?: HTMLElement }).input || input;
					nativeInput.addEventListener('input', validateInput);
				}
				children.push(inputWrap);
			};
			for (const g of groupOrder) {
				const isMain = g === '';
				const detailWrap = this.createDetailBox();
				const { box, summary, grid, children } = detailWrap;
				box.meta = meta;
				box.data = script;
				this.wraps.push(detailWrap);
				// 主段（无 @group）与分组段外观一致，均为可折叠 detail-box：
				if (summary instanceof DetailSummary) {
					if (isMain) {
						summary.textContent = Local.get('parameter.param');
					} else {
						summary.textContent = langMap.get(g) ?? g;
					}
				}
				for (const parameter of groupMap.get(g)!) {
					if (parameter.hidden) continue;
					createParamRow(box, grid, children, parameter);
				}
				this.updateParamDisplay(box);
				this.appendChild(box);
			}
		}
		if (changed) {
			(this.scriptList as any)?.dispatchChangeEvent();
		}
		if (this.updateEventEnabled) {
			this.dispatchUpdateEvent();
		}
		this.onResize?.();
		window.on('script-change', this.scriptChange);
	}

	appendHeadPad(): void {
		let { headPad } = this;
		if (headPad === null) {
			headPad = document.createElement('empty');
			headPad.style.display = 'none';
			this.headPad = headPad;
		}
		this.appendChild(headPad);
	}

	createDetailBox(): any {
		const { detailBoxes } = this;
		let box: HTMLElement;
		if (detailBoxes.length !== 0) {
			box = detailBoxes.pop().box;
			// 复用池内 box 时先清空残留的 summary/grid，避免多次复用累积
			while (box.firstChild) {
				box.removeChild(box.firstChild);
			}
		} else {
			box = document.createElement('detail-box');
			box.setAttribute('open', '');
		}
		const tag = 'detail-box';
		const summary = document.createElement('detail-summary');
		const grid = document.createElement('detail-grid');
		const wrap = { tag, box, summary, grid, children: [] as any[] };
		box.appendChild(summary);
		box.appendChild(grid);
		(box as any).wrap = wrap;
		return wrap;
	}

	createParamInput(parameter: any): any {
		const config = TypeRegistry.get(parameter.type);
		if (config) {
			return config.create(this, parameter);
		}
		return undefined;
	}

	updateParamInput(wrap: any, value: any): void {
		// if (value === undefined) {
		switch (wrap.tag) {
			case 'check-box':
			case 'text-box':
				wrap.input.read() !== value && wrap.input.write(value);
				break;
			case 'number-box':
				if (wrap.input.read() !== value) {
					wrap.input.write(value);
				} else {
					wrap.input.input.value = value.toString();
				}
				break;
			case 'number-var':
				if (wrap.input.read() !== value) {
					wrap.input.write(value);
				} else if (typeof value === 'number') {
					wrap.input.numBox.input.value = value.toString();
				}
				break;
			case 'keyboard-box':
			case 'color-box':
				wrap.input.read() !== value && wrap.input.write(value);
				break;
			case 'select-box':
			case 'custom-box':
				// 由于选择框和自定义框选项内容不固定
				if (wrap.input.read() !== value) {
					wrap.input.write(value);
				} else {
					wrap.input.update();
				}
				break;
			case 'repeatable-group':
				if (wrap.input.read() !== value) {
					wrap.input.write(value);
				}
				break;
		}
	}

	updateParamDisplay(detailBox: any): void {
		const { states } = detailBox.meta.manager;
		const mParams = detailBox.meta.parameters;
		const paramMap: Record<string, any> = {};
		for (const p of mParams) paramMap[p.key] = p;
		for (const wrap of detailBox.wrap.children) {
			const key = wrap.input.key;
			switch (states[key]) {
				case false:
					wrap.label.hide();
					wrap.input.hide();
					continue;
				default:
					wrap.label.show();
					wrap.input.show();
					continue;
			}
		}
		for (const wrap of detailBox.wrap.children) {
			const key = wrap.input.key;
			const param = paramMap[key];
			const parameters = wrap.input.parameters;
			if (param?.validate && parameters) {
				const value = parameters[key];
				const ok = (PluginManager as any).checkValidate(param, value);
				if (ok) {
					wrap.input.removeClass('validate-error');
				} else {
					wrap.input.addClass('validate-error');
				}
			} else {
				wrap.input.removeClass('validate-error');
			}
		}
	}

	createCheckBox(): any {
		const { checkBoxes } = this;
		if (checkBoxes.length !== 0) {
			return checkBoxes.pop();
		}
		const tag = 'check-box';
		const label = document.createElement('text');
		const input = new CheckBox(true);
		(input as any).inputEventEnabled = true;
		(input as any).addClass('standard');
		(input as any).addClass('large');
		return { tag, label, input };
	}

	createNumberBox(): any {
		const { numberBoxes } = this;
		if (numberBoxes.length !== 0) {
			return numberBoxes.pop();
		}
		const tag = 'number-box';
		const label = document.createElement('text');
		const input = new NumberBox();
		return { tag, label, input };
	}

	createNumberVar(): any {
		const { numberVars } = this;
		if (numberVars.length !== 0) {
			return numberVars.pop();
		}
		const tag = 'number-var';
		const label = document.createElement('text');
		const input = new NumberVar();
		return { tag, label, input };
	}

	createTextBox(): any {
		const { textBoxes } = this;
		if (textBoxes.length !== 0) {
			return textBoxes.pop();
		}
		const tag = 'text-box';
		const label = document.createElement('text');
		const input = new TextBox();
		(input as any).on('keydown', (Selection as any).inputKeydown);
		(input as any).on('keyup', (Selection as any).inputKeyup);
		(input as any).on('pointerdown', (Selection as any).inputPointerdown);
		(input as any).on('pointerup', (Selection as any).inputPointerup);
		return { tag, label, input };
	}

	createSelectBox(): any {
		const { selectBoxes } = this;
		if (selectBoxes.length !== 0) {
			return selectBoxes.pop();
		}
		const tag = 'select-box';
		const label = document.createElement('text');
		const input = new SelectBox();
		return { tag, label, input };
	}

	createKeyboardBox(): any {
		const { keyboardBoxes } = this;
		if (keyboardBoxes.length !== 0) {
			return keyboardBoxes.pop();
		}
		const tag = 'keyboard-box';
		const label = document.createElement('text');
		const input = new KeyboardBox();
		return { tag, label, input };
	}

	createColorBox(): any {
		const { colorBoxes } = this;
		if (colorBoxes.length !== 0) {
			return colorBoxes.pop();
		}
		const tag = 'color-box';
		const label = document.createElement('text');
		const input = new ColorBox();
		return { tag, label, input };
	}

	createCustomBox(): any {
		const { customBoxes } = this;
		if (customBoxes.length !== 0) {
			return customBoxes.pop();
		}
		const tag = 'custom-box';
		const label = document.createElement('text');
		const input = new CustomBox();
		return { tag, label, input };
	}

	createRepeatableGroup(parameter: any): any {
		const template = parameter.repeatableGroup.parameters;
		const tag = 'repeatable-group';
		const label = document.createElement('text');
		const container = document.createElement('div');
		container.className = 'repeatable-group';
		const rowsEl = document.createElement('div');
		rowsEl.className = 'repeatable-group-rows';
		const addBtn = document.createElement('button');
		addBtn.textContent = '+';
		addBtn.className = 'add-row-btn';
		container.appendChild(rowsEl);
		container.appendChild(addBtn);
		(container as any).setTooltip = () => {};
		(container as any).parameters = null;
		(container as any).key = null;
		const pane = this;
		(container as any).read = function () {
			const result: any[] = [];
			for (const rowEl of rowsEl.children as any) {
				const data: Record<string, any> = {};
				for (const { param, input } of (rowEl as any).wraps) {
					data[param.key] = input.read();
				}
				result.push(data);
			}
			return result;
		};
		(container as any).write = function (value: any[]) {
			rowsEl.innerHTML = '';
			let arr = value;
			if (!arr || arr.length === 0) {
				const empty: Record<string, any> = {};
				for (const subParam of template) {
					empty[subParam.key] = subParam.value;
				}
				arr = [empty];
			}
			for (const item of arr) {
				const row = document.createElement('div');
				row.className = 'repeatable-group-row';
				const removeBtn = document.createElement('button');
				removeBtn.className = 'repeatable-group-remove';
				removeBtn.textContent = '×';
				removeBtn.onclick = function (e: MouseEvent) {
					e.stopPropagation();
					row.remove();
					container.dispatchEvent(new Event('change', { bubbles: true }));
				};
				row.appendChild(removeBtn);
				const grid = document.createElement('detail-grid');
				row.appendChild(grid);
				(row as any).wraps = template.map((subParam: any) => {
					const wrap = TypeRegistry.get(subParam.type).create(pane, subParam);
					const val =
						item[subParam.key] !== undefined ? item[subParam.key] : subParam.value;
					(wrap as any).label.textContent = '';
					(wrap as any).input.parameters = item;
					(wrap as any).input.key = subParam.key;
					(wrap as any).input.write(val);
					(wrap as any).input.enable();
					(wrap as any).input.removeClass('validate-error');
					if (subParam.readonly) {
						(wrap as any).input.disable();
					}
					grid.appendChild((wrap as any).label);
					if (subParam.prefix || subParam.suffix) {
						pane.applyAffix((wrap as any).input, subParam);
					}
					grid.appendChild((wrap as any).input);
					return { param: subParam, ...wrap };
				});
				rowsEl.appendChild(row);
			}
		};
		addBtn.onclick = function (e: MouseEvent) {
			e.stopPropagation();
			const empty: Record<string, any> = {};
			for (const subParam of template) {
				empty[subParam.key] = subParam.value;
			}
			const data = (container as any).read();
			data.push(empty);
			(container as any).write(data);
			container.dispatchEvent(new Event('change', { bubbles: true }));
		};
		return { tag, label, input: container };
	}

	recycle(wrap: any): void {
		switch (wrap.tag) {
			case 'detail-box': {
				const { children } = wrap;
				let i = children.length;
				while (--i >= 0) {
					this.recycle(children[i]);
				}
				children.length = 0;
				wrap.box.meta = null;
				wrap.box.data = null;
				this.detailBoxes.push(wrap);
				break;
			}
			case 'check-box':
				wrap.label.remove();
				wrap.input.remove();
				wrap.input.parameters = null;
				wrap.input.key = null;
				this.checkBoxes.push(wrap);
				break;
			case 'number-box':
				wrap.label.remove();
				wrap.input.remove();
				wrap.input.parameters = null;
				wrap.input.key = null;
				this.numberBoxes.push(wrap);
				break;
			case 'number-var':
				wrap.label.remove();
				wrap.input.remove();
				wrap.input.parameters = null;
				wrap.input.key = null;
				this.numberVars.push(wrap);
				break;
			case 'text-box':
				wrap.label.remove();
				wrap.input.remove();
				wrap.input.parameters = null;
				wrap.input.key = null;
				this.textBoxes.push(wrap);
				break;
			case 'select-box':
				wrap.label.remove();
				wrap.input.remove();
				wrap.input.parameters = null;
				wrap.input.key = null;
				wrap.input.clear();
				this.selectBoxes.push(wrap);
				break;
			case 'keyboard-box':
				wrap.label.remove();
				wrap.input.remove();
				wrap.input.parameters = null;
				wrap.input.key = null;
				this.keyboardBoxes.push(wrap);
				break;
			case 'color-box':
				wrap.label.remove();
				wrap.input.remove();
				wrap.input.parameters = null;
				wrap.input.key = null;
				if (wrap.input.tabIndex === 0) {
					this.colorBoxes.push(wrap);
				}
				break;
			case 'custom-box':
				wrap.label.remove();
				wrap.input.remove();
				wrap.input.parameters = null;
				wrap.input.key = null;
				// 应该丢弃它避免接收过期的数据
				if (wrap.input.tabIndex === 0) {
					this.customBoxes.push(wrap);
				}
				break;
			case 'repeatable-group':
				wrap.label.remove();
				wrap.input.remove();
				wrap.input.parameters = null;
				wrap.input.key = null;
				break;
		}
	}

	clear(): void {
		this.metas = [];
		const { wraps } = this;
		let i = wraps.length;
		if (i !== 0) {
			while (--i >= 0) {
				this.recycle(wraps[i]);
			}
			wraps.length = 0;
			this.textContent = '';
		}
		if (!(this.scriptList as any)?.data) {
			window.off('script-change', this.scriptChange);
		}
	}

	on: (
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	) => void = (type, listener, options) => {
		this.addEventListener(type, listener, options);
		if (type === 'update') {
			this.updateEventEnabled = true;
		}
	};

	componentChange(event: Event): void {
		let element = event.target as any as HTMLElement;
		if (element.tagName === 'INPUT') {
			element = element.parentNode as HTMLElement;
		}
		if (element.parentNode instanceof NumberVar) {
			element = element.parentNode as HTMLElement;
		}
		const { parameters, key } = element as any;
		const { scriptList } = this;
		if (scriptList instanceof ParamList) {
			const { history } = scriptList as any;
			const { editor } = history;
			if (editor) {
				history.save({
					type: 'script-parameter-change',
					editor: editor,
					target: editor.target,
					meta: editor.meta,
					list: this,
					parameters: parameters,
					key: key,
					value: parameters[key]
				});
			}
		}
		parameters[key] = (element as any).read();
		(scriptList as any)?.dispatchChangeEvent(1);
		const grid = element.parentNode as HTMLElement;
		const detail = grid.parentNode as any;
		if (detail?.meta) {
			if ((element as any).branched) {
				(PluginManager as any).reconstruct(detail.data);
			}
			this.updateParamDisplay(detail);
			this.onResize?.();
		}
	}

	applyAffix(input: HTMLElement, param: any): void {
		const font = 'var(--font-family-mono)';
		if (param.prefix) {
			const pre = document.createElement('text');
			pre.textContent = param.prefix;
			(pre as any).addClass('param-affix');
			(pre as any).addClass('left');
			(input as any).insertBefore(pre, (input as any).input);
		}
		if (param.suffix) {
			const suf = document.createElement('text');
			suf.textContent = param.suffix;
			(suf as any).addClass('param-affix');
			(suf as any).addClass('right');
			(input as any).insertBefore(suf, (input as any).input);
		}
		if ((input as any).input) {
			if (param.prefix) {
				const pw = measureText(param.prefix, font).width + 8;
				(input as any).input.style.paddingLeft = pw + 'px';
			}
			if (param.suffix) {
				const sw = measureText(param.suffix, font).width + 8;
				(input as any).input.style.paddingRight = sw + 'px';
			}
		}
	}

	static windowLocalize(this: ParameterPane, event: Event): void {
		for (const { langMap } of (this as any).metas) {
			const oldMap = langMap.active;
			const newMap = langMap.update().active;
			if (oldMap !== newMap) {
				(this as any).update();
				return;
			}
		}
	}

	static scriptChange(this: ParameterPane, event: any): void {
		for (const meta of (this as any).metas) {
			if (meta === event.changedMeta) {
				if ((this as any).contains(Select.target)) {
					Select.close();
				}
				(this as any).update();
				return;
			}
		}
	}
}

customElements.define('parameter-pane', ParameterPane);
