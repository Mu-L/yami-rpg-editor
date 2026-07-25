// 全局类型扩展声明 本文件集中声明 Project/Script/util/ 各模块对内置对象 / window 的新增成员类型, 避免 TS2339 / TS2551 报错。所有扩展均来自 util/*.ts 的实际运行时挂载。

// 注：本文件保持 ambient script（无顶层 import/export），interface 声明才能自动合并到全局。故 EditorEvent 别名在此内联，不 import types/editor-event.ts（顶层 import 会破坏 ambient 语义）。
type EditorEvent =
	| KeyboardEvent
	| MouseEvent
	| PointerEvent
	| DragEvent
	| WheelEvent
	| InputEvent
	| Event;

interface Clipboard {
	has(format: string): boolean;
	read(format: string): any;
	write(format: string, object: any): void;
}

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

interface ArrayConstructor {
	empty: any[];
	subtract<T>(a: T[], b: T[]): T[];
}

interface Array<T> {
	append(value: T): boolean;
	remove(value: T): boolean;
	set(array: Array<T>): void;
}

interface StringConstructor {
	compress(string: string): string;
}

interface NumberConstructor {
	computeIndexDigits(length: number): number;
	padZero(number: number, length: number, padString?: string): string;
}

interface ObjectConstructor {
	empty: Record<string, never>;
	clone<T>(object: T): T;
}

interface RegExpConstructor {
	number: RegExp;
}

interface MouseEvent {
	getRelativeCoords(element: HTMLElement): { x: number; y: number };
}

interface PointerEvent {
	relate(event: PointerEvent): boolean;
}

interface NodeList {
	enable(): void;
	disable(): void;
}

interface FunctionConstructor {
	empty: () => void;
}

declare namespace CSS {
	function encodeURL(url: string): string;
	function rasterize(...args: any[]): any;
	function getDevicePixelContentBoxSize(element: HTMLElement): {
		width: number;
		height: number;
	};
}

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
	resize(width: number, height: number): void;
}

interface DataTransfer {
	hideDragImage(): void;
}

interface HTMLElement {
	count: number;
	test(name: string): RegExp;
	seek(name: string): HTMLElement | null;
	direction: number;
	// ScrollBar / CommandList 共用的滚动监听方法（scroll-listener.ts 中挂载到 HTMLElement.prototype）
	addScrollListener: (...args: any[]) => any;
	removeScrollListener: (...args: any[]) => any;
	// element-methods.ts 中挂载到 HTMLElement.prototype 的元素方法 注：show/hide/clear 等方法被子类（FilterBox/LoadingOverlay/ToastManager 等）重写为不同签名，故返回类型用 any 兼容子类，避免 TS2416 冲突。
	dataValue: any;
	read(): any;
	write(value: any): any;
	clear(): any;
	enable(): void;
	disable(): void;
	hasClass(className: string): boolean;
	addClass(className: string): boolean;
	removeClass(className: string): boolean;
	seekUp(tagName: string, count?: number): HTMLElement | null;
	css(...args: any[]): CSSStyleDeclaration;
	rect(): DOMRect;
	hide(): any;
	show(...args: any[]): any;
	hideChildNodes(): void;
	showChildNodes(): void;
	getFocus(mode?: string | null): void;
	setTooltip(content?: string): void;
	addScrollbars(): void;
	addSetScrollMethod(): void;
	hasScrollBar(): boolean;
	isInContent(event: EditorEvent): boolean;
	dispatchChangeEvent(index?: number): void;
	dispatchResizeEvent(): void;
	dispatchUpdateEvent(): void;
	listenDraggingScrollbarEvent(...args: any[]): void;
	beginScrolling(): void;
	endScrolling(): void;
	setScroll(left: number, top: number): void;
	setScrollLeft(left: number): void;
	setScrollTop(top: number): void;
	updateScrollbars(): void;
	scrollPointerup: (event: EditorEvent) => void;
	scrollPointermove: (event: EditorEvent) => void;
	scrollPointerdown?: (event: EditorEvent) => void;
	dragging: any;
	// scroll-bar.ts 中 ScrollBar 类方法（addScrollbars 内 hBar/vBar 调用）
	bind(target: HTMLElement, type: string): void;
	updateHorizontalBar(): void;
	updateVerticalBar(): void;
	// file-body-pane.ts 中局使用
	isImageChanged: () => boolean;
	content: HTMLElement;
	// parameter-pane.ts 中局使用（container/row 元素属性）
	parameters: any;
	key: any;
	wraps: any[];
	// tab-bar.ts 中局使用（items[i].item / popup menu 元素属性）
	item: any;
	value: any;
	clientX: number;
	clientY: number;
	// file-head-pane.ts 中局使用（elFolder/elArrow/head 元素属性）
	file: any;
	folders: any[];
	target: any;
	links: any;
	// toast.ts 中局使用（el._timer 挂载 setTimeout 句柄）
	_timer: any;
	// file-browser.ts 中局使用（sFile.stats.ino 取文件 inode）
	stats: { ino: number };
}

interface TextBox extends HTMLElement {
	lastText: string;
	hiddenNodes: any[];
	// module/resource.ts 中局使用（textbox.input.readOnly 访问内部 input 元素）
	input: HTMLInputElement;
}

interface PlatformPath {
	slash: (path: string) => string;
}

interface Window {
	config: any;
	on: (
		eventName: string,
		handler: (event: EditorEvent) => void,
		options?: boolean | AddEventListenerOptions
	) => void;
	off: (
		eventName: string,
		handler: (event: EditorEvent) => void,
		options?: boolean | EventListenerOptions
	) => void;
	spaceKey: boolean;
}

interface Event {
	spaceKey: boolean;
	cmdOrCtrlKey: boolean;
	doubleclickProcessed: boolean;
	// file-body-pane.ts 中局使用（popup menu 的原始事件）
	raw: any;
	// param-list.ts 中局使用（event.latest）
	latest: any;
	value: any;
	// select-box.ts 中局使用（input 事件挂载 .last）
	last: any;
}

interface EventTarget {
	on(
		type: string,
		listener: (event: EditorEvent) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	off(
		type: string,
		listener: (event: EditorEvent) => void,
		options?: boolean | EventListenerOptions
	): void;
}

interface HTMLElement {
	addClass(name: string): boolean;
	removeClass(name: string): boolean;
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
	read(...args: any[]): any;
	inputCode(code: any): void;
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
	windowVariableChange: (event: EditorEvent) => void;
	speedX: number;
	speedY: number;
	complete: boolean;
	start: number;
	back: any;
	item: any;
	hasScrollBar(): boolean;
	elements: any[];
	show(...args: any[]): any;
	hide(...args: any[]): any;
}

interface Element {
	addClass(name: string): boolean;
	removeClass(name: string): boolean;
	hasClass(name: string): boolean;
	varType: any;
	varKey: any;
	varId: any;
	varSpace: any;
	currentType: any;
	focus(): void;
	blur(): void;
	show(...args: any[]): any;
	hide(...args: any[]): any;
	// parameter-pane.ts 中局使用（rowsEl.children 迭代为 Element，需访问 .wraps）
	wraps: any[];
	// transition-window.ts 中局使用（keyTextNode = createElement('text') 为 Element，需访问 .key）
	key: any;
}

interface ParentNode {
	rect: any;
	read(...args: any[]): any;
	directory: any;
	activeWheel: any;
	inputCode(code: any): void;
	// file-head-pane.ts 中局使用（head = this.parentNode 为 ParentNode，需访问 .links）
	links: any;
}

interface ChildNode {
	querySelector(selectors: string): HTMLElement | null;
	tagName: string;
	getAttribute(name: string): string | null;
	dataValue: any;
	// tab-bar.ts 中局使用（items[i] 为 ChildNode，需访问 .item）
	item: any;
	// menu-list.ts 中局使用（li 为 ChildNode，需访问 .label/.accelerator）
	label: any;
	accelerator: any;
}

interface Event {
	target: HTMLElement;
	cmdOrCtrlKey: boolean;
	doubleclickProcessed: boolean;
	value: any;
	clientX: number;
	clientY: number;
	lastValue: any;
	key: any;
	last: any;
}

interface KeyboardEvent {
	cmdOrCtrlKey: boolean;
}

interface NodeListOf<TNode extends Node> {
	on: (
		type: string,
		listener: (event: EditorEvent) => void,
		options?: boolean | AddEventListenerOptions
	) => void;
	off: (
		type: string,
		listener: (event: EditorEvent) => void,
		options?: boolean | EventListenerOptions
	) => void;
}

interface NodeList {
	on(type: string, listener: (event: EditorEvent) => void, options?: any): NodeList;
	enable(): void;
	disable(): void;
	// tab-bar.ts 中局使用（this.childNodes 解构 { item }）
	item: any;
}

interface MouseEvent {
	getRelativeCoords(element: HTMLElement): { x: number; y: number };
}

interface PointerEvent {
	relate(event: PointerEvent): boolean;
}

interface String {
	test(name: string): RegExp;
}

interface StringConstructor {
	compress(string: string): string;
}

interface RegExpConstructor {
	number: RegExp;
}

interface NumberConstructor {
	computeIndexDigits(length: number): number;
	padZero(number: number, length: number, padString?: string): string;
}

interface ObjectConstructor {
	empty: Record<string, never>;
	clone<T>(object: T): T;
}

interface HTMLButtonElement {
	enable(): void;
	disable(): void;
}

interface HTMLInputElement {
	getFocus(mode?: string): HTMLInputElement;
}

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
	appendUpdater: ((key: string, updater: (deltaTime: number) => void) => void) | null;
	removeUpdater: ((key: string, updater: (deltaTime: number) => void) => void) | null;
}
