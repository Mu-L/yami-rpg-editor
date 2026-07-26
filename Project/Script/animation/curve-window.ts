import { $ } from '@/util/dom.ts';
import { Timer } from '@/util/timer.ts';
import { Animation } from './animation-window.ts';
import { Data } from '@/data/data-object.ts';
import { Easing } from '@/data/transition-window.ts';
import { Layout } from '@/layout/layout.ts';

type CurveState = 'closed' | 'open';

type CurveMethod = ((...args: any[]) => any) | null;

interface CurveShape {
	state: CurveState;
	page: HTMLElement & { hide(): HTMLElement; show(): HTMLElement };
	head: HTMLElement;
	list: HTMLElement & {
		hide(): HTMLElement;
		show(): HTMLElement;
		defaultItem: { name: string; value: string };
		setItemNames: ((options: Record<string, string>) => void) | null;
		dataValue: string | null;
		update(): void;
		on(type: string, listener: (event: any) => void): void;
	};
	canvas: HTMLCanvasElement;
	target: any | null;
	index: number | null;
	curveMap: any | null;
	initialize: (() => void) | null;
	open: (() => void) | null;
	load: CurveMethod;
	close: (() => void) | null;
	suspend: (() => void) | null;
	resume: (() => void) | null;
	updateHead: (() => void) | null;
	updateEasingOptions: (() => void) | null;
	updateTimeline: ((target?: any) => void) | null;
	resize: (() => void) | null;
	drawCurve: (() => void) | null;
	requestRendering: (() => void) | null;
	renderingFunction: (() => void) | null;
	stopRendering: (() => void) | null;
	windowResize: (() => void) | null;
	themechange: ((event: Event) => void) | null;
	datachange: ((event: Event) => void) | null;
	easingIdWrite: ((event: Event) => void) | null;
	easingIdInput: ((event: Event) => void) | null;
	settingsPointerdown: ((event: PointerEvent) => void) | null;
}

export const Curve: CurveShape = {
	state: 'closed',
	page: $('#animation-easing').hide(),
	head: $('#animation-easing-head'),
	list: $('#animation-easing-id').hide(),
	canvas: $('#animation-easing-canvas'),
	target: null,
	index: null,
	curveMap: null,
	initialize: null,
	open: null,
	load: null,
	close: null,
	suspend: null,
	resume: null,
	updateHead: null,
	updateEasingOptions: null,
	updateTimeline: null,
	resize: null,
	drawCurve: null,
	requestRendering: null,
	renderingFunction: null,
	stopRendering: null,
	windowResize: null,
	themechange: null,
	datachange: null,
	easingIdWrite: null,
	easingIdInput: null,
	settingsPointerdown: null
};

Curve.initialize = function () {
	this.curveMap = new Easing.CurveMap();

	this.list.defaultItem = { name: 'No Easing', value: '' };

	// 过渡方式 - 重写设置选项名字方法
	this.list.setItemNames = function (options) {
		const item = this.defaultItem;
		const key = item.value;
		const name = options[key];
		if (name !== undefined) {
			item.name = name;
		}
		if (this.dataValue !== null) {
			this.update();
		}
	};

	window.on('themechange', this.themechange);
	window.on('datachange', this.datachange);
	this.page.on('resize', this.windowResize);
	this.list.on('write', this.easingIdWrite);
	this.list.on('input', this.easingIdInput);
	$('#animation-easing-settings').on('pointerdown', this.settingsPointerdown);
};

Curve.open = function () {
	if (this.state === 'closed') {
		this.state = 'open';
		this.page.show();
		this.windowResize();
		this.updateEasingOptions();
	}
};

Curve.load = function (frame) {
	if (this.target !== frame) {
		this.target = frame;
		if (frame) {
			this.list.show();
			this.list.write(frame.easingId);
		} else {
			this.list.hide();
			this.index = null;
			this.requestRendering();
		}
	}
};

Curve.close = function () {
	if (this.state !== 'closed') {
		this.state = 'closed';
		this.page.hide();
		this.stopRendering();
	}
};

Curve.suspend = function () {
	if (this.state === 'open') {
		this.state = 'suspended';
		this.stopRendering();
	}
};

Curve.resume = function () {
	if (this.state === 'suspended') {
		this.state = 'open';
		this.resize();
		this.requestRendering();
	}
};

Curve.updateHead = function () {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const { nav } = Layout.getGroupOfElement(head);
		const nRect = nav.rect();
		const iRect = nav.lastChild.rect();
		const left = iRect.right - nRect.left;
		if (head.left !== left) {
			head.left = left;
			head.style.left = `${left}px`;
		}
	}
};

Curve.updateEasingOptions = function () {
	const { list } = this;
	const { easings } = Data;
	if (list.data !== easings) {
		list.data = easings;
		const head = list.defaultItem;
		const items = Data.createEasingItems();
		list.loadItems([head, ...items]);
	}
};

Curve.updateTimeline = function (target) {
	const easing = !!target.easingId;
	const { key } = target;
	if (key.easing !== easing) {
		key.easing = easing;
		if (easing) {
			key.addClass('easing');
		} else {
			key.removeClass('easing');
		}
	}
};

Curve.resize = function () {
	if (this.state === 'open') {
		const screenBox = CSS.getDevicePixelContentBoxSize(this.page);
		const screenWidth = screenBox.width;
		const screenHeight = screenBox.height;

		if (this.canvas.width !== screenWidth || this.canvas.height !== screenHeight) {
			this.canvas.width = screenWidth;
			this.canvas.height = screenHeight;
		}
	}
};

Curve.drawCurve = function () {
	const canvas = this.canvas;
	const width = canvas.width;
	const height = canvas.height;
	if (width * height === 0) {
		return;
	}
	const centerX = width >> 1;
	const centerY = height >> 1;
	const spacing = Math.floor(Math.min(width, height) / 12);
	const originX = centerX - spacing * 5;
	const originY = centerY + spacing * 5;
	const fullSize = spacing * 10;

	let { context } = canvas;
	if (!context) {
		context = canvas.context = canvas.getContext('2d', {
			desynchronized: true
		});
	}
	context.clearRect(0, 0, width, height);

	context.strokeStyle = canvas.gridColor;
	context.setLineDash([1]);
	for (let y = originY % spacing; y < height; y += spacing) {
		context.beginPath();
		context.moveTo(0, y + 0.5);
		context.lineTo(width, y + 0.5);
		context.stroke();
	}
	for (let x = originX % spacing; x < width; x += spacing) {
		context.beginPath();
		context.moveTo(x + 0.5, 0);
		context.lineTo(x + 0.5, height);
		context.stroke();
	}

	context.strokeStyle = canvas.axisColor;
	context.beginPath();
	context.moveTo(originX, originY - fullSize + 0.5);
	context.lineTo(originX + fullSize + 0.5, originY - fullSize + 0.5);
	context.lineTo(originX + fullSize + 0.5, originY);
	context.stroke();

	context.strokeStyle = canvas.axisColor;
	context.setLineDash([]);
	context.beginPath();
	context.moveTo(0, originY + 0.5);
	context.lineTo(width, originY + 0.5);
	context.moveTo(originX + 0.5, 0);
	context.lineTo(originX + 0.5, height);
	context.stroke();

	context.textBaseline = 'top';
	context.font = '12px Arial';
	context.fillStyle = canvas.textColor;
	context.fillText('TIME', originX + 4, originY + 4);
	context.translate(originX, originY);
	context.rotate((Math.PI * 3) / 2);
	context.fillText('PROGRESSION', 4, -12);
	context.setTransform(1, 0, 0, 1, 0, 0);

	switch (this.index) {
		case null:
			break;
		case '':
			context.lineWidth = 2;
			context.strokeStyle = canvas.curveColor;
			context.beginPath();
			context.moveTo(originX + 0.5, originY + 0.5);
			context.lineTo(originX + fullSize + 0.5, originY + 0.5);
			context.lineTo(originX + fullSize + 0.5, originY - fullSize + 0.5);
			context.stroke();
			context.lineWidth = 1;
			break;
		default: {
			context.lineWidth = 2;
			context.strokeStyle = canvas.curveColor;
			context.beginPath();
			context.moveTo(originX + 0.5, originY + 0.5);
			const curveMap = this.curveMap;
			const count = curveMap.count;
			for (let i = 2; i < count; i += 2) {
				context.lineTo(
					originX + curveMap[i] * fullSize + 0.5,
					originY - curveMap[i + 1] * fullSize + 0.5
				);
			}
			context.stroke();
			context.lineWidth = 1;
			break;
		}
	}
};

Curve.requestRendering = function () {
	if (this.state === 'open') {
		Timer.appendUpdater('sharedRendering2', this.renderingFunction);
	}
};

Curve.renderingFunction = function () {
	Curve.drawCurve();
};

Curve.stopRendering = function () {
	Timer.removeUpdater('sharedRendering2', this.renderingFunction);
};

Curve.windowResize = function () {
	if (this.page.clientWidth === 0) {
		return this.suspend();
	}
	this.updateHead();
	switch (this.state) {
		case 'open':
			this.resize();
			this.requestRendering();
			break;
		case 'suspended':
			this.resume();
			break;
	}
}.bind(Curve);

Curve.themechange = function (event) {
	const { canvas } = this;
	switch (event.value) {
		case 'light':
			canvas.textColor = '#808080';
			canvas.gridColor = '#c0c0c0';
			canvas.axisColor = '#606060';
			canvas.curveColor = '#202020';
			break;
		case 'dark':
			canvas.textColor = '#808080';
			canvas.gridColor = '#404040';
			canvas.axisColor = '#808080';
			canvas.curveColor = '#d8d8d8';
			break;
	}
	this.requestRendering();
}.bind(Curve);

Curve.datachange = function (event) {
	if (Curve.state === 'open' && event.key === 'easings') {
		Curve.updateEasingOptions();
		const { index } = Curve;
		if (index !== null) {
			Curve.index = null;
			Curve.list.write(index);
		}
	}
};

Curve.easingIdWrite = function (event) {
	const id = event.value;
	if (Curve.index !== id) {
		Curve.index = id;
		Curve.requestRendering();
		if (id !== '') {
			const easing = Data.easings.map[id];
			const points = easing?.points ?? [
				{ x: 0, y: 0 },
				{ x: 1, y: 1 }
			];
			const { startPoint, endPoint } = Easing;
			Curve.curveMap.update(startPoint, ...points, endPoint);
		}
	}
};

Curve.easingIdInput = function (event) {
	Animation.planToSave();
	Animation.history.save({
		type: 'animation-easing-change',
		motion: Animation.motion,
		direction: Animation.direction,
		target: Animation.target,
		easingId: Curve.target.easingId
	});
	Curve.target.easingId = event.value;
	Curve.updateTimeline(Curve.target);
};

Curve.settingsPointerdown = function () {
	Easing.open();
};
