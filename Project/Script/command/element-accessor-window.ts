import { $, getElementReader } from '@/util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { PresetElement } from '@/tools/preset-element-window.ts';
import { Window } from '@/tools/window-object.ts';

interface ElementGetterTarget {
	dataValue: ElementData;
	input: (getter: any) => void;
	isPluginInput?: boolean;
}

interface ElementData {
	type:
		| 'trigger'
		| 'latest'
		| 'by-id'
		| 'by-ancestor-and-id'
		| 'by-index'
		| 'by-button-index'
		| 'selected-button'
		| 'focus'
		| 'parent'
		| 'variable';
	presetId?: string;
	ancestor?: any;
	parent?: any;
	focus?: any;
	index?: number;
	variable?: { type: string; key: string };
}

interface ElementGetterShape {
	target: ElementGetterTarget | null;
	initialize: (() => void) | null;
	open: ((target: ElementGetterTarget) => void) | null;
	checkDataForPlugin: ((data: any) => boolean) | null;
	createDefaultForPlugin: (() => { getter: string; type: string }) | null;
	confirm: ((event: Event) => void) | null;
}

export const ElementGetter: ElementGetterShape = {
	target: null,
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	confirm: null
};

ElementGetter.initialize = function (): void {
	($('#elementGetter-type') as any).loadItems([
		{ name: 'Event Trigger Element', value: 'trigger' },
		{ name: 'Latest Element', value: 'latest' },
		{ name: 'By Element ID', value: 'by-id' },
		{ name: 'By Ancestor And ID', value: 'by-ancestor-and-id' },
		{ name: 'By Parent And Index', value: 'by-index' },
		{ name: 'By Focus And Button Index', value: 'by-button-index' },
		{ name: 'Get Selected Button In Focus', value: 'selected-button' },
		{ name: 'Get The Latest Focus Element', value: 'focus' },
		{ name: 'Get Parent Element', value: 'parent' },
		{ name: 'Variable', value: 'variable' }
	]);

	($('#elementGetter-type') as any).enableHiddenMode().relate([
		{ case: 'by-id', targets: [$('#elementGetter-presetId')] },
		{
			case: 'by-ancestor-and-id',
			targets: [$('#elementGetter-ancestor'), $('#elementGetter-presetId')]
		},
		{
			case: ['by-index', 'by-button-index'],
			targets: [$('#elementGetter-ancestor'), $('#elementGetter-index')]
		},
		{
			case: 'selected-button',
			targets: [$('#elementGetter-ancestor')]
		},
		{
			case: ['parent', 'variable'],
			targets: [$('#elementGetter-variable')]
		}
	]);

	($('#elementGetter-confirm') as HTMLElement).on('click', this.confirm!);
};

ElementGetter.open = function (this: ElementGetterShape, target: ElementGetterTarget): void {
	this.target = target;
	Window.open('elementGetter');

	let index = 0;
	let presetId = PresetElement.getDefaultPresetId();
	let ancestor = { type: 'trigger' };
	let variable = { type: 'local', key: '' };
	const element = target.dataValue;
	switch (element.type) {
		case 'trigger':
		case 'latest':
		case 'focus':
			break;
		case 'by-id':
			presetId = element.presetId!;
			break;
		case 'by-ancestor-and-id':
			ancestor = element.ancestor!;
			presetId = element.presetId!;
			break;
		case 'by-index':
			ancestor = element.parent!;
			index = element.index!;
			break;
		case 'by-button-index':
			ancestor = element.focus!;
			index = element.index!;
			break;
		case 'selected-button':
			ancestor = element.focus!;
			break;
		case 'parent':
		case 'variable':
			variable = element.variable!;
			break;
	}
	($('#elementGetter-type') as HTMLElement & { write(v: any): void }).write(element.type);
	($('#elementGetter-ancestor') as HTMLElement & { write(v: any): void }).write(ancestor);
	($('#elementGetter-presetId') as HTMLElement & { write(v: any): void }).write(presetId);
	($('#elementGetter-index') as HTMLElement & { write(v: any): void }).write(index);
	($('#elementGetter-variable') as HTMLElement & { write(v: any): void }).write(variable);
	($('#elementGetter-type') as HTMLElement & { getFocus(): void }).getFocus();
};

ElementGetter.checkDataForPlugin = function (data: any): boolean {
	if (data instanceof Object) {
		return (data as { getter?: string }).getter === 'element';
	}
	return false;
};

ElementGetter.createDefaultForPlugin = function (): {
	getter: string;
	type: string;
} {
	return { getter: 'element', type: 'trigger' };
};

ElementGetter.confirm = function (this: ElementGetterShape): void {
	const read = getElementReader('elementGetter');
	const type = read('type');
	let getter: any;
	switch (type) {
		case 'trigger':
		case 'latest':
		case 'focus':
			getter = { type };
			break;
		case 'by-id': {
			const presetId = read('presetId');
			if (presetId === '') {
				return (
					$('#elementGetter-presetId') as HTMLElement & {
						getFocus(): void;
					}
				).getFocus();
			}
			getter = { type, presetId };
			break;
		}
		case 'by-ancestor-and-id': {
			const ancestor = read('ancestor');
			const presetId = read('presetId');
			if (presetId === '') {
				return (
					$('#elementGetter-presetId') as HTMLElement & {
						getFocus(): void;
					}
				).getFocus();
			}
			getter = { type, ancestor, presetId };
			break;
		}
		case 'by-index': {
			const parent = read('ancestor');
			const index = read('index');
			getter = { type, parent, index };
			break;
		}
		case 'by-button-index': {
			const focus = read('ancestor');
			const index = read('index');
			getter = { type, focus, index };
			break;
		}
		case 'selected-button': {
			const focus = read('ancestor');
			getter = { type, focus };
			break;
		}
		case 'parent':
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone!(variable)) {
				return (
					$('#elementGetter-variable') as HTMLElement & {
						getFocus(): void;
					}
				).getFocus();
			}
			getter = { type, variable };
			break;
		}
	}
	if (this.target!.isPluginInput) {
		getter = { getter: 'element', ...getter };
	}
	this.target!.input(getter);
	Window.close('elementGetter');
}.bind(ElementGetter);
