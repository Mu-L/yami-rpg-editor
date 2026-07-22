import { $ } from '../util/dom.ts';
import { Window } from '../tools/window-object.ts';
import { StringVar } from '../components/string-var.ts';

// ******************************** 文本提示框 ********************************

// 文本提示列表项
interface TextSuggestionItem {
	name: string;
	icon?: string;
	class?: string;
	comment?: string;
	refCount?: number;
	// 列表渲染时挂载的 DOM 元素
	element?: HTMLElement & { item: TextSuggestionItem };
}

type ListMethod = ((...args: any[]) => any) | null;

interface TextSuggestionList {
	createIcon: ListMethod;
	createText: ListMethod;
	createRefCount: ListMethod;
	createComment: ListMethod;
	selectDefaultCommand: ListMethod;
	updateNodeElement: ListMethod;
	elements: any[] & { count: number };
	selection: TextSuggestionItem | null;
	pressing: ((event: PointerEvent) => void) | null;
	style: CSSStyleDeclaration;
	bind(getter: () => any): void;
	on(type: string, listener: (event: any) => void, options?: any): void;
	off(type: string, listener: (event: any) => void, options?: any): void;
	update(): HTMLElement | void;
	clear(): void;
	hide(): HTMLElement | void;
	show(): HTMLElement | void;
	hasClass(name: string): boolean;
	searchNodes(text: string): void;
	selectRelative(direction: string): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	read(): TextSuggestionItem | null;
	scrollToSelection(mode?: string): void;
	select(item: TextSuggestionItem): void;
	open(item: TextSuggestionItem): void;
	textContent: string;
}

interface TextSuggestionTarget {
	generator: () => TextSuggestionItem[];
	input: { select(): void };
	insert(name: string): void;
	rect(): { left: number; top: number; bottom: number; width: number };
	read(): string;
	contains(node: Node | null): boolean;
	on(type: string, listener: (event: any) => void, options?: any): void;
	off(type: string, listener: (event: any) => void, options?: any): void;
}

type TextBoxMethod = ((this: TextSuggestionTarget, event: any) => void) | null;

interface TextSuggestionShape {
	list: TextSuggestionList;
	inserting: boolean;
	target: TextSuggestionTarget | null;
	data: TextSuggestionItem[] | null;
	initialize: (() => void) | null;
	listen:
		| ((
				textBox: TextSuggestionTarget,
				generator: () => TextSuggestionItem[]
		  ) => void)
		| null;
	open: ((target: TextSuggestionTarget) => void) | null;
	close: (() => void) | null;
	select: ((item: TextSuggestionItem) => void) | null;
	createData: (() => void) | null;
	textBoxFocus: TextBoxMethod;
	textBoxBlur: TextBoxMethod;
	textBoxKeydown: TextBoxMethod;
	textBoxInput: TextBoxMethod;
	listPointerdown:
		((this: TextSuggestionList, event: PointerEvent) => void) | null;
	listUpdate: ((this: TextSuggestionList, event: Event) => void) | null;
	listOpen:
		| ((
				this: TextSuggestionList,
				event: Event & { value: TextSuggestionItem }
		  ) => void)
		| null;
}

export const TextSuggestion: TextSuggestionShape = {
	// properties
	list: $('#text-suggestions'),
	inserting: false,
	target: null,
	data: null,
	// methods
	initialize: null,
	listen: null,
	open: null,
	close: null,
	select: null,
	createData: null,
	// events
	textBoxFocus: null,
	textBoxBlur: null,
	textBoxKeydown: null,
	textBoxInput: null,
	listPointerdown: null,
	listUpdate: null,
	listOpen: null
};

// list methods
TextSuggestion.list.updateNodeElement = null;
TextSuggestion.list.createIcon = null;
TextSuggestion.list.createText = null;
TextSuggestion.list.createRefCount = null;
TextSuggestion.list.createComment = null;
TextSuggestion.list.selectDefaultCommand = null;

// 初始化
TextSuggestion.initialize = function (this: TextSuggestionShape): void {
	// 绑定指令目录列表
	const { list } = this;
	list.bind(() => this.data);

	// 侦听事件
	list.on('pointerdown', this.listPointerdown!);
	list.on('update', this.listUpdate!);
	list.on('open', this.listOpen!);
};

// 侦听文本输入框
TextSuggestion.listen = function (
	this: TextSuggestionShape,
	textBox: TextSuggestionTarget,
	generator: () => TextSuggestionItem[]
): void {
	textBox.generator = generator;
	textBox.on('focus', this.textBoxFocus!);
	textBox.on('blur', this.textBoxBlur!);
	textBox.on('keydown', this.textBoxKeydown!);
	textBox.on('input', this.textBoxInput!);
	textBox.on('compositionend', this.textBoxInput!);
};

// 打开
TextSuggestion.open = function (
	this: TextSuggestionShape,
	target: TextSuggestionTarget
): void {
	if (this.target !== target) {
		this.target = target;
		this.createData!();
		this.list.update();
		this.list.selectDefaultCommand!();
	}
};

// 关闭
TextSuggestion.close = function (this: TextSuggestionShape): void {
	this.target = null;
	this.data = null;
	this.list.clear();
	this.list.hide();
};

// 选择文本
TextSuggestion.select = function (
	this: TextSuggestionShape,
	item: TextSuggestionItem
): void {
	this.inserting = true;
	let target:
		| TextSuggestionTarget
		| { input: { select(): void }; insert(name: string): void } =
		this.target!;
	if (target instanceof StringVar) {
		target = (target as unknown as { strBox: TextSuggestionTarget }).strBox;
	}
	target.input.select();
	target.insert(item.name);
	this.inserting = false;
	this.close!();
};

// 创建数据
TextSuggestion.createData = function (this: TextSuggestionShape): void {
	if (!this.data) {
		this.data = this.target!.generator();
	}
};

// 文本框 - 获得焦点事件
TextSuggestion.textBoxFocus = function (
	this: TextSuggestionTarget,
	event: Event
): void {
	const text = this.read().trim();
	TextSuggestion.open(this);
	TextSuggestion.list.searchNodes(text);
	TextSuggestion.list.selectDefaultCommand!();
};

// 文本框 - 失去焦点事件
TextSuggestion.textBoxBlur = function (
	this: TextSuggestionTarget,
	event: Event
): void {
	TextSuggestion.close!();
};

// 文本框 - 键盘按下事件
TextSuggestion.textBoxKeydown = function (
	this: TextSuggestionTarget,
	event: KeyboardEvent
): void {
	if (!TextSuggestion.list.hasClass('hidden')) {
		switch (event.code) {
			case 'ArrowUp':
			case 'ArrowDown':
				event.preventDefault();
				TextSuggestion.list.selectRelative(
					event.code.slice(5).toLowerCase()
				);
				break;
			case 'PageUp':
				TextSuggestion.list.pageUp(true);
				break;
			case 'PageDown':
				TextSuggestion.list.pageDown(true);
				break;
			case 'Enter':
			case 'NumpadEnter': {
				const item = TextSuggestion.list.read();
				if (item) {
					// 阻止触发确定按钮点击操作
					event.stopPropagation();
					TextSuggestion.list.open(item);
				}
				break;
			}
			case 'Escape':
				event.stopPropagation();
				TextSuggestion.close!();
				break;
		}
	}
};

// 文本框 - 输入事件
TextSuggestion.textBoxInput = function (
	this: TextSuggestionTarget,
	event: InputEvent
): void {
	if (
		this.contains(document.activeElement as Node | null) &&
		TextSuggestion.inserting === false &&
		event.inputType !== 'insertCompositionText'
	) {
		const text = this.read().trim();
		TextSuggestion.open(this);
		TextSuggestion.list.searchNodes(text);
		TextSuggestion.list.selectDefaultCommand!();
	}
};

// 列表 - 指针按下事件
TextSuggestion.listPointerdown = function (
	this: TextSuggestionList,
	event: PointerEvent
): void {
	const element = event.target as HTMLElement & {
		item: TextSuggestionItem;
		tagName: string;
	};
	if (element.tagName === 'NODE-ITEM') {
		// 阻止文本输入框的blur行为
		event.preventDefault();
		const pressing = this.pressing;
		const pointerup = (event: PointerEvent): void => {
			if (pressing === pointerup) {
				this.pressing = null;
				if (element.contains(event.target as Node)) {
					TextSuggestion.select(element.item);
				}
			}
		};
		this.pressing = pointerup;
		window.on('pointerup', pointerup, { once: true });
	}
};

// 列表 - 更新事件
TextSuggestion.listUpdate = function (
	this: TextSuggestionList,
	event: Event
): void {
	const MAX_LINES = 30;
	const rect = TextSuggestion.target!.rect();
	const rl = rect.left;
	const rt = rect.top;
	const rb = rect.bottom;
	const rw = rect.width;
	const space = window.innerHeight - rb;
	const below = space >= 200;
	const capacity = below ? Math.floor(space / 20) : Math.floor(rt / 20);
	const lines = Math.min(this.elements.count, capacity, MAX_LINES);
	const top = below ? rb : rt - lines * 20;
	if (
		lines !== 0 &&
		!(
			lines === 1 &&
			this.elements[0].item.name === TextSuggestion.target!.read()
		)
	) {
		this.style.left = `${rl}px`;
		this.style.top = `${top}px`;
		this.style.width = `calc(${rw}px - var(--2dpx))`;
		this.style.height = `${lines * 20}px`;
		this.style.zIndex = (Window.frames.length + 1).toString();
		this.show();
	} else {
		this.hide();
	}
};

// 列表 - 打开事件
TextSuggestion.listOpen = function (
	this: TextSuggestionList,
	event: Event & { value: TextSuggestionItem }
): void {
	const item = event.value;
	// 指令选项在列表中的时候打开
	if (item.element!.parentNode) {
		TextSuggestion.select(item);
	}
};

// 列表 - 重写更新节点元素方法
TextSuggestion.list.updateNodeElement = function (
	this: TextSuggestionList,
	element: HTMLElement & { item: TextSuggestionItem; initialized?: boolean }
): void {
	if (!element.initialized) {
		(element as any).initialized = true;
		(this as any).createIcon(element);
		(this as any).createText(element);
		(this as any).createRefCount(element);
		(this as any).createComment(element);
		element.addClass('text-suggestion-item');
	}
};

// 列表 - 创建图标
TextSuggestion.list.createIcon = function (
	this: TextSuggestionList,
	element: HTMLElement & { item: TextSuggestionItem }
): void {
	if (element.item.icon) {
		const icon = document.createElement('node-icon') as HTMLElement;
		icon.addClass(element.item.icon);
		element.appendChild(icon);
	}
};

// 列表 - 创建文本
TextSuggestion.list.createText = function (
	this: TextSuggestionList,
	element: HTMLElement & { item: TextSuggestionItem }
): void {
	const item = element.item;
	const text = document.createElement('text');
	text.addClass('text-suggestion-content');
	if (item.class) text.addClass(item.class);
	text.textContent = item.name;
	element.appendChild(text);
};

// 列表 - 创建引用计数
TextSuggestion.list.createRefCount = function (
	this: TextSuggestionList,
	element: HTMLElement & { item: TextSuggestionItem }
): void {
	if (element.item.refCount) {
		const comment = document.createElement('text');
		comment.addClass('text-suggestion-ref-count');
		comment.textContent = String(element.item.refCount);
		element.appendChild(comment);
	}
};

// 列表 - 创建注释
TextSuggestion.list.createComment = function (
	this: TextSuggestionList,
	element: HTMLElement & { item: TextSuggestionItem }
): void {
	if (element.item.comment) {
		const comment = document.createElement('text');
		comment.addClass('text-suggestion-comment');
		comment.textContent = element.item.comment;
		element.appendChild(comment);
	}
};

// 列表扩展方法 - 选择默认指令选项
TextSuggestion.list.selectDefaultCommand = function (
	this: TextSuggestionList
): void {
	// 如果有选中的指令存在于结果列表中则返回
	const { selection, elements } = this;
	const { count } = elements;
	if (selection) {
		for (let i = 0; i < count; i++) {
			if (elements[i].item === selection) {
				this.scrollToSelection('middle');
				return;
			}
		}
	}
	// 从结果列表中选择第一个匹配的指令选项
	for (let i = 0; i < count; i++) {
		this.select(elements[i].item);
		this.scrollToSelection('middle');
		return;
	}
};
