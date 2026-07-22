import { $, getElementReader } from '../util/dom.ts';
import { Light } from '../scene/light.ts';
import { PresetObject } from '../tools/scene-preset-window.ts';
import { Window } from '../tools/window-object.ts';

// ******************************** 位置访问器窗口 ********************************

// 位置访问器目标对象（由调用方传入）
interface PositionGetterTarget {
	dataValue: PositionData;
	input: (getter: any) => void;
	isPluginInput?: boolean;
}

// 位置数据对象（switch 各 type 含不同字段）
interface PositionData {
	type:
		| 'absolute'
		| 'relative'
		| 'actor'
		| 'trigger'
		| 'light'
		| 'region'
		| 'object'
		| 'mouse';
	x?: number;
	y?: number;
	actor?: any;
	trigger?: any;
	light?: any;
	region?: any;
	mode?: string;
	objectId?: string;
}

type PositionGetterMethod = ((...args: any[]) => any) | null;

interface PositionGetterShape {
	target: PositionGetterTarget | null;
	initialize: (() => void) | null;
	open: ((target: PositionGetterTarget) => void) | null;
	checkDataForPlugin: ((data: any) => boolean) | null;
	createDefaultForPlugin:
		(() => { getter: string; type: string; x: number; y: number }) | null;
	confirm: ((event: Event) => void) | null;
}

export const PositionGetter: PositionGetterShape = {
	// properties
	target: null,
	// methods
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	// events
	confirm: null
};

// 初始化
PositionGetter.initialize = function (): void {
	// 创建类型选项
	($('#positionGetter-type') as any).loadItems([
		{ name: 'Absolute Coordinates', value: 'absolute' },
		{ name: 'Relative Coordinates', value: 'relative' },
		{ name: 'Position of Actor', value: 'actor' },
		{ name: 'Position of Trigger', value: 'trigger' },
		{ name: 'Position of Light', value: 'light' },
		{ name: 'Position of Region', value: 'region' },
		{ name: 'Position of Object', value: 'object' },
		{ name: 'Position of Mouse', value: 'mouse' }
	]);

	// 设置类型关联元素
	($('#positionGetter-type') as any).enableHiddenMode().relate([
		{
			case: 'absolute',
			targets: [
				$('#positionGetter-common-x'),
				$('#positionGetter-common-y')
			]
		},
		{
			case: 'relative',
			targets: [
				$('#positionGetter-common-x'),
				$('#positionGetter-common-y')
			]
		},
		{ case: 'actor', targets: [$('#positionGetter-actor')] },
		{ case: 'trigger', targets: [$('#positionGetter-trigger')] },
		{ case: 'light', targets: [$('#positionGetter-light')] },
		{
			case: 'region',
			targets: [
				$('#positionGetter-region'),
				$('#positionGetter-region-mode')
			]
		},
		{ case: 'object', targets: [$('#positionGetter-objectId')] }
	]);

	// 创建区域模式选项
	($('#positionGetter-region-mode') as any).loadItems([
		{ name: 'Center', value: 'center' },
		{ name: 'Random', value: 'random' },
		{ name: 'Random - Land', value: 'random-land' },
		{ name: 'Random - Water', value: 'random-water' },
		{ name: 'Random - Wall', value: 'random-wall' }
	]);

	// 侦听事件
	($('#positionGetter-confirm') as HTMLElement).on('click', this.confirm!);
};

// 打开窗口
PositionGetter.open = function (
	this: PositionGetterShape,
	target: PositionGetterTarget
): void {
	this.target = target;
	Window.open('positionGetter');

	let commonX = 0;
	let commonY = 0;
	let actor = { type: 'trigger' };
	let trigger = { type: 'trigger' };
	let light = { type: 'trigger' };
	let region = { type: 'trigger' };
	let regionMode = 'center';
	let objectId = PresetObject.getDefaultPresetId('any');
	const position = target.dataValue;
	switch (position.type) {
		case 'absolute':
			commonX = position.x!;
			commonY = position.y!;
			break;
		case 'relative':
			commonX = position.x!;
			commonY = position.y!;
			break;
		case 'actor':
			actor = position.actor!;
			break;
		case 'trigger':
			trigger = position.trigger!;
			break;
		case 'light':
			light = position.light!;
			break;
		case 'region':
			region = position.region!;
			regionMode = position.mode!;
			break;
		case 'object':
			objectId = position.objectId!;
			break;
	}
	($('#positionGetter-type') as HTMLElement & { write(v: any): void }).write(
		position.type
	);
	(
		$('#positionGetter-common-x') as HTMLElement & { write(v: any): void }
	).write(commonX);
	(
		$('#positionGetter-common-y') as HTMLElement & { write(v: any): void }
	).write(commonY);
	($('#positionGetter-actor') as HTMLElement & { write(v: any): void }).write(
		actor
	);
	(
		$('#positionGetter-trigger') as HTMLElement & { write(v: any): void }
	).write(trigger);
	($('#positionGetter-light') as HTMLElement & { write(v: any): void }).write(
		light
	);
	(
		$('#positionGetter-region') as HTMLElement & { write(v: any): void }
	).write(region);
	(
		$('#positionGetter-region-mode') as HTMLElement & {
			write(v: any): void;
		}
	).write(regionMode);
	(
		$('#positionGetter-objectId') as HTMLElement & { write(v: any): void }
	).write(objectId);
	(
		$('#positionGetter-type') as HTMLElement & { getFocus(): void }
	).getFocus();
};

// 检查插件版本的位置访问器数据有效性
PositionGetter.checkDataForPlugin = function (data: any): boolean {
	if (data instanceof Object) {
		return (data as { getter?: string }).getter === 'position';
	}
	return false;
};

// 创建插件版本的默认位置访问器
PositionGetter.createDefaultForPlugin = function (): {
	getter: string;
	type: string;
	x: number;
	y: number;
} {
	return { getter: 'position', type: 'absolute', x: 0, y: 0 };
};

// 确定按钮 - 鼠标点击事件
PositionGetter.confirm = function (
	this: PositionGetterShape,
	event: Event
): void {
	const read = getElementReader('positionGetter');
	const type = read('type');
	let getter: any;
	switch (type) {
		case 'absolute': {
			const x = read('common-x');
			const y = read('common-y');
			getter = { type, x, y };
			break;
		}
		case 'relative': {
			const x = read('common-x');
			const y = read('common-y');
			getter = { type, x, y };
			break;
		}
		case 'actor': {
			const actor = read('actor');
			getter = { type, actor };
			break;
		}
		case 'trigger': {
			const trigger = read('trigger');
			getter = { type, trigger };
			break;
		}
		case 'light': {
			const light = read('light');
			getter = { type, light };
			break;
		}
		case 'region': {
			const region = read('region');
			const mode = read('region-mode');
			getter = { type, region, mode };
			break;
		}
		case 'object': {
			const objectId = read('objectId');
			if (objectId === '') {
				return (
					$('#positionGetter-objectId') as HTMLElement & {
						getFocus(): void;
					}
				).getFocus();
			}
			getter = { type, objectId };
			break;
		}
		case 'mouse':
			getter = { type };
			break;
	}
	// 如果是插件输入框，额外附加一个属性
	if (this.target!.isPluginInput) {
		getter = { getter: 'position', ...getter };
	}
	this.target!.input(getter);
	Window.close('positionGetter');
}.bind(PositionGetter);
