// 全局类型扩展声明
// 本文件集中声明 Project/Script/util/ 各模块对内置对象 / window 的新增成员类型,
// 避免 TS2339 / TS2551 报错。所有扩展均来自 util/*.ts 的实际运行时挂载。

// ============== Clipboard 静态扩展 (util/clipboard.ts) ==============
// util/clipboard.ts 中 Object.assign(Clipboard, {...}) 挂载到全局 Clipboard 构造函数对象本身（静态方法）
// 注：Clipboard 是构造函数对象，interface Clipboard 声明的是实例方法；
// Object.assign 挂载点是构造函数对象本身（静态方法），与 instance interface 不同。
// 调用方用 (Clipboard as any).write/read 绕过静态方法 vs 实例方法的类型冲突。
// 注：lib.dom.d.ts 的 Clipboard interface 优先级高于 declare var 声明合并，
// 无法通过 global.d.ts 根上消除协变冲突 —— 调用方必须用 `(Clipboard as any).xxx` 必要断言。
interface Clipboard {
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

// ============== String 扩展 (util/string.ts) ==============
interface StringConstructor {
	compress(string: string): string;
}

// ============== Number 扩展 (util/number.ts) ==============
interface NumberConstructor {
	computeIndexDigits(length: number): number;
	padZero(number: number, length: number, padString?: string): string;
}

// ============== Object 扩展 (util/object.ts) ==============
interface ObjectConstructor {
	empty: Record<string, never>;
	clone<T>(object: T): T;
}

// ============== RegExp 扩展 (util/regexp.ts) ==============
interface RegExpConstructor {
	number: RegExp;
}

// ============== MouseEvent 扩展 (util/mouse-event.ts) ==============
interface MouseEvent {
	getRelativeCoords(element: HTMLElement): { x: number; y: number };
}

// ============== PointerEvent 扩展 (util/pointer-event.ts) ==============
interface PointerEvent {
	relate(event: PointerEvent): boolean;
}

// ============== NodeList 扩展 (util/node-list.ts) ==============
interface NodeList {
	enable(): void;
	disable(): void;
}

// ============== Function 扩展 (util/function.ts) ==============
interface FunctionConstructor {
	empty: () => void;
}

// ============== CSS 扩展 (util/css.ts) ==============
declare namespace CSS {
	function encodeURL(url: string): string;
	function rasterize(...args: any[]): any;
	function getDevicePixelContentBoxSize(element: HTMLElement): {
		width: number;
		height: number;
	};
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
	resize(width: number, height: number): void;
}

// ============== DataTransfer 扩展 (util/data-transfer.ts) ==============
interface DataTransfer {
	hideDragImage(): void;
}

// ============== HTMLElement 扩展 == count / test / seek ==============
interface HTMLElement {
	count: number;
	test(name: string): RegExp;
	seek(name: string): HTMLElement | null;
	direction: number;
	// ScrollBar / CommandList 共用的滚动监听方法（scroll-listener.ts 中挂载到 HTMLElement.prototype）
	addScrollListener: (...args: any[]) => any;
	removeScrollListener: (...args: any[]) => any;
	// element-methods.ts 中挂载到 HTMLElement.prototype 的元素方法
	// 注：show/hide/clear 等方法被子类（FilterBox/LoadingOverlay/ToastManager 等）重写为不同签名，
	// 故返回类型用 any 兼容子类，避免 TS2416 冲突。
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
	isInContent(event: any): boolean;
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
	scrollPointerup: (event: any) => void;
	scrollPointermove: (event: any) => void;
	scrollPointerdown?: (event: any) => void;
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

// ============== TextBox 扩展 (components/text-box.ts + tree-list.ts) ==============
interface TextBox extends HTMLElement {
	lastText: string;
	hiddenNodes: any[];
	// module/resource.ts 中局使用（textbox.input.readOnly 访问内部 input 元素）
	input: HTMLInputElement;
}

// ============== path 扩展 (util/config.ts: path.slash) ==============
interface PlatformPath {
	slash: (path: string) => string;
}

// ============== Window 自定义成员 ==============
interface Window {
	config: any;
	on: (
		eventName: string,
		handler: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	) => void;
	off: (
		eventName: string,
		handler: (event: any) => void,
		options?: boolean | EventListenerOptions
	) => void;
	spaceKey: boolean;
}

// ============== Event / KeyboardEvent 扩展 (util/keyboard.ts + Electron) ==============
interface Event {
	spaceKey: boolean;
	cmdOrCtrlKey: boolean;
	doubleclickProcessed: boolean;
	// file-body-pane.ts 中局使用（popup menu 的原始事件）
	raw: any;
	// param-list.ts 中局使用（event.latest）
	latest: any;
	// check-box.ts 中局使用（write/input 事件挂载 .value）
	value: any;
	// select-box.ts 中局使用（input 事件挂载 .last）
	last: any;
}

// ============== EventTarget 扩展 (util/event-target.ts) ==============
// 注：listener 签名 `(event: any) => void` 对齐 event-target.ts 实现签名，
// 兼容 EventListenerOrEventListenerObject（lib.dom.d.ts 的 addEventListener 重载要求）。
// 协变冲突（子类 `(event: PointerEvent) => void` 比基类更具体）不在此根上消除 ——
// 因 `addEventListener` 重载约束，改用调用点 `as unknown as` 绕。
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
	windowVariableChange: (event: any) => void;
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

// ============== Element / ParentNode / ChildNode 扩展 ==============
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

// ============== Event / KeyboardEvent 扩展 ==============
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

// ============== NodeListOf 扩展 (util/node-list.ts) ==============
interface NodeListOf<TNode extends Node> {
	on: (
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	) => void;
	off: (
		type: string,
		listener: (event: any) => void,
		options?: boolean | EventListenerOptions
	) => void;
}

// ============== NodeList 扩展 (util/node-list.ts) ==============
interface NodeList {
	on(type: string, listener: (event: any) => void, options?: any): NodeList;
	enable(): void;
	disable(): void;
	// tab-bar.ts 中局使用（this.childNodes 解构 { item }）
	item: any;
}

// ============== MouseEvent 扩展 (util/mouse-event.ts) ==============
interface MouseEvent {
	getRelativeCoords(element: HTMLElement): { x: number; y: number };
}

// ============== PointerEvent 扩展 (util/pointer-event.ts) ==============
interface PointerEvent {
	relate(event: PointerEvent): boolean;
}

// ============== String 扩展 (util/string.ts) ==============
interface String {
	test(name: string): RegExp;
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

// ============== HTMLButtonElement 扩展 (components/button-extension.ts) ==============
interface HTMLButtonElement {
	enable(): void;
	disable(): void;
}

interface HTMLInputElement {
	getFocus(mode?: string): HTMLInputElement;
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
