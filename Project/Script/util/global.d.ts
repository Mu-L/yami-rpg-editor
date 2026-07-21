// 全局类型扩展声明
// 本文件集中声明 Project/Script/util/ 各模块对内置对象 / window 的新增成员类型,
// 避免 TS2339 / TS2551 报错。所有扩展均来自 util/*.ts 的实际运行时挂载。

// ============== Clipboard 静态扩展 (util/clipboard.ts) ==============
// 代码以 `Clipboard.has = ...` 形式挂到 Clipboard 构造器上
interface ClipboardConstructor {
	has(format: string): boolean;
	read(format: string): any;
	write(format: string, object: any): void;
}

// ============== Math 扩展 (util/math.ts) ==============
interface Math {
	clamp(number: number, minimum: number, maximum: number): number;
	roundTo(number: number, decimalPlaces: number): number;
	dist(x1: number, y1: number, x2: number, y2: number): number;
	randomBetween(value1: number, value2: number): number;
	radians(degrees: number): number;
	degrees(radians: number): number;
	modDegrees(degrees: number, period?: number): number;
	modRadians(radians: number, period?: number): number;
}

// ============== Array 扩展 (util/array.ts) ==============
interface ArrayConstructor {
	empty: any[];
	subtract<T>(a: T[], b: T[]): T[];
}

interface Array<T> {
	append(value: T): boolean;
	remove(value: T): boolean;
	set(array: Array<T>): void;
}

// ============== Function 扩展 (util/function.ts) ==============
interface FunctionConstructor {
	empty: () => void;
}

// ============== CSS 扩展 (util/css.ts) ==============
interface CSS {
	encodeURL(url: string): string;
	rasterize(...args: any[]): any;
	getDevicePixelContentBoxSize(...args: any[]): any;
}

// ============== CanvasRenderingContext2D 扩展 (util/canvas.ts) ==============
interface CanvasRenderingContext2D {
	drawAndFitImage(
		image: CanvasImageSource,
		sx: number,
		sy: number,
		sw: number,
		sh: number,
		dx: number,
		dy: number,
		dw: number,
		dh: number
	): void;
}

// ============== Clipboard 扩展 (util/clipboard.ts) ==============
interface Clipboard {
	has(types: string | string[]): boolean;
	read(...args: any[]): any;
	write(...args: any[]): any;
}

// ============== DataTransfer 扩展 (util/data-transfer.ts) ==============
interface DataTransfer {
	hideDragImage(): void;
}

// ============== path 扩展 (util/config.ts: path.slash) ==============
interface PlatformPath {
	slash: string;
}

// ============== Window 自定义成员 ==============
interface Window {
	config: any;
	on(
		eventName: string,
		handler: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	off(
		eventName: string,
		handler: (event: any) => void,
		options?: boolean | EventListenerOptions
	): void;
	spaceKey: boolean;
}

// ============== Event / KeyboardEvent 扩展 (util/keyboard.ts + Electron) ==============
interface Event {
	spaceKey: boolean;
	cmdOrCtrlKey: boolean;
	doubleclickProcessed: boolean;
}

// ============== EventTarget 扩展 (util/event-target.ts) ==============
interface EventTarget {
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	off(
		type: string,
		listener: (event: any) => void,
		options?: boolean | EventListenerOptions
	): void;
}

// ============== HTMLElement 扩展 (components/ 大量自定义元素属性) ==============
// 注意: getFocus/show/hide/close/click/enable/disable/blur/focus/empty 等方法
// 在 components/ 内的自定义元素类中被重写, 故不在此声明, 让子类自己定义.
interface HTMLElement {
	addClass(name: string): void;
	removeClass(name: string): void;
	hasClass(name: string): boolean;
	dispatchChangeEvent(): void;
	dispatchUpdateEvent(): void;
	css(): CSSStyleDeclaration;
	css(property: string): string;
	css(property: string, value: string): void;
	css(properties: Record<string, string>): void;
	setTooltip(text: string): void;
	showChildNodes(): void;
	hideChildNodes(): void;
	listenDraggingScrollbarEvent(): void;
	append(...nodes: (Node | string)[]): void;
	_paddingTop: number;
	innerHeight: number;
	dataValue: any;
	dataIndex: any;
	varSpace: any;
	varType: any;
	varKey: any;
	varId: any;
	varMap: any;
	varList: any;
	currentType: any;
	script: any;
	rect: any;
	path: any;
	data: any;
	value: any;
	name: string;
	fileBox: any;
	history: any;
	links: any;
	submenu: any;
	dragging: any;
	restoring: boolean;
	_built: boolean;
	_checkVariablesScheduled: boolean;
	windowVariableChange: (event: any) => void;
	speedX: number;
	speedY: number;
	complete: boolean;
	start: number;
	back: any;
	item: any;
	hasScrollBar: boolean;
	elements: any[];
}

// ============== Element / ParentNode / ChildNode 扩展 ==============
interface Element {
	addClass(name: string): void;
	removeClass(name: string): void;
	hasClass(name: string): boolean;
}

interface ParentNode {}

interface ChildNode {}

// ============== Event / KeyboardEvent 扩展 ==============
interface Event {
	target: HTMLElement;
	cmdOrCtrlKey: boolean;
	doubleclickProcessed: boolean;
	value: any;
}

interface KeyboardEvent {
	cmdOrCtrlKey: boolean;
}

// ============== NodeListOf 扩展 (util/node-list.ts) ==============
interface NodeListOf<TNode extends Node> {
	on(type: string, listener: (event: any) => void): void;
	off(type: string, listener: (event: any) => void): void;
}

// ============== NodeList 扩展 (util/node-list.ts) ==============
interface NodeList {
	on(type: string, listener: (event: any) => void, options?: any): NodeList;
	enable(): void;
	disable(): void;
}

// ============== MouseEvent 扩展 (util/mouse-event.ts) ==============
interface MouseEvent {
	getRelativeCoords(element: HTMLElement): { x: number; y: number };
}

// ============== PointerEvent 扩展 (util/pointer-event.ts) ==============
interface PointerEvent {
	relate(event: PointerEvent): boolean;
}

// ============== StringConstructor 扩展 (util/string.ts) ==============
interface StringConstructor {
	compress(string: string): string;
}

// ============== RegExpConstructor 扩展 (util/regexp.ts) ==============
interface RegExpConstructor {
	number: RegExp;
}

// ============== NumberConstructor 扩展 (util/number.ts) ==============
interface NumberConstructor {
	computeIndexDigits(length: number): number;
	padZero(number: number, length: number, padString?: string): string;
}

// ============== ObjectConstructor 扩展 (util/object.ts) ==============
interface ObjectConstructor {
	empty: Record<string, never>;
	clone<T>(object: T): T;
}

// ============== Timer 静态成员扩展 (util/timer.ts) ==============
// Timer 类在 timer.ts 内 export, 但静态属性 / 方法在文件末尾动态挂载,
// 这些不在 class 体内声明, 需在此补充类型
interface TimerStatic {
	timers: any[];
	updaters: {
		stageAnimation: ((deltaTime: number) => void) | null;
		stageRendering: ((deltaTime: number) => void) | null;
		sharedAnimation: ((deltaTime: number) => void) | null;
		sharedRendering: ((deltaTime: number) => void) | null;
		sharedRendering2: ((deltaTime: number) => void) | null;
	};
	timestamp: number;
	deltaTime: number;
	frameCount: number;
	frameTime: number;
	tpf: number;
	animationIndex: number;
	animationWaiting: number;
	initialize: ((this: TimerStatic) => void) | null;
	start: ((timestamp: number) => void) | null;
	update: ((timestamp: number) => void) | null;
	play: ((this: TimerStatic) => void) | null;
	appendUpdater:
		((key: string, updater: (deltaTime: number) => void) => void) | null;
	removeUpdater:
		((key: string, updater: (deltaTime: number) => void) => void) | null;
}
