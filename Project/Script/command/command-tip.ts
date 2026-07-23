import { $ } from '../util/dom.ts';
import { Command } from './command-object.ts';
import { File } from '../file/file-system-core.ts';
import { Local } from '../tools/localization.ts';
import { Window } from '../tools/window-object.ts';

// ******************************** 指令提示框 ********************************

// 指令提示列表项（commands.json 中数据节点）
export interface CommandSuggestionItem {
	value: string;
	name?: string;
	desc?: string;
	unspacedName?: string;
	class: string;
	keywords?: string;
	expanded?: boolean;
	children?: CommandSuggestionItem[] | null;
	// 列表渲染时挂载的 DOM 元素
	element?: HTMLElement & { item: CommandSuggestionItem };
	item?: CommandSuggestionItem;
}

type ListMethod = ((...args: any[]) => any) | null;

interface CommandSuggestionList {
	createIcon: ListMethod;
	createComment: ListMethod;
	searchNodesAlgorithm: ListMethod;
	updateCommandNames: ListMethod;
	createCommandTip: ListMethod;
	selectDefaultCommand: ListMethod;
	creators: ListMethod[];
	elements: any[] & { count: number };
	initialized: boolean;
	selection: CommandSuggestionItem | null;
	pressing: ((event: PointerEvent) => void) | null;
	bind(getter: () => any): void;
	scrollAndResize(): void;
	getSelectionPosition(): { x: number; y: number } | null;
	update(): void;
	dispatchUpdateEvent(): void;
	resize(): void;
	hide(): HTMLElement | void;
	show(): HTMLElement | void;
	scrollToSelection(mode?: string): void;
	deleteNodeParameters(data: any): void;
	searchNodes(text: string): void;
	selectRelative(direction: string): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	scrollToHome(): void;
	scrollToEnd(): void;
	read(): CommandSuggestionItem | null;
	hasClass(name: string): boolean;
	open(item: CommandSuggestionItem): void;
	select(item: CommandSuggestionItem): void;
	appendChild<T extends Node>(node: T): T;
	insertBefore<T extends Node>(node: T, ref: T | null): T;
	contains(node: Node | null): boolean;
	on(type: string, listener: (event: any) => void, options?: any): void;
	textContent: string;
	style: CSSStyleDeclaration;
	data: CommandSuggestionItem[] | Promise<CommandSuggestionItem[]> | null;
	item: CommandSuggestionItem;
	class: string;
	parentNode: Node & { item?: CommandSuggestionItem };
}

interface CommandSuggestionWidget extends HTMLElement {
	enableAmbient: boolean;
	x: number;
	y: number;
}

interface CommandSuggestionSearcher extends HTMLElement {
	input: HTMLInputElement & { id: string };
	addCloseButton(): void;
	deleteInputContent(): void;
	on(type: string, listener: (event: any) => void, options?: any): void;
	getFocus(mode?: string): void;
	read(): any;
}

interface CommandSuggestionShape {
	widget: CommandSuggestionWidget;
	searcher: CommandSuggestionSearcher;
	list: CommandSuggestionList;
	data: CommandSuggestionItem[] | Promise<CommandSuggestionItem[]> | null;
	initialize: (() => void) | null;
	open: (() => void) | null;
	select: ((item: CommandSuggestionItem) => void) | null;
	windowLocalize: ((event: Event) => void) | null;
	windowClose: ((event: Event) => void) | null;
	pointerdown: ((event: PointerEvent) => void) | null;
	searcherKeydown: ((event: KeyboardEvent) => void) | null;
	searcherInput: ((event: InputEvent) => void) | null;
	listKeydown:
		((this: CommandSuggestionList, event: KeyboardEvent) => void) | null;
	listPointerdown:
		((this: CommandSuggestionList, event: PointerEvent) => void) | null;
	listUpdate: ((this: CommandSuggestionList, event: Event) => void) | null;
	listOpen:
		| ((
				this: CommandSuggestionList,
				event: Event & { value: CommandSuggestionItem }
		  ) => void)
		| null;
}

export const CommandSuggestion: CommandSuggestionShape = {
	// properties
	widget: $('#command-widget'),
	searcher: $('#command-searcher'),
	list: $('#command-suggestions'),
	data: null,
	// methods
	initialize: null,
	open: null,
	select: null,
	// events
	windowLocalize: null,
	windowClose: null,
	pointerdown: null,
	searcherKeydown: null,
	searcherInput: null,
	listKeydown: null,
	listPointerdown: null,
	listUpdate: null,
	listOpen: null
};

// list methods
CommandSuggestion.list.createIcon = null;
CommandSuggestion.list.createComment = null;
CommandSuggestion.list.searchNodesAlgorithm = null;
CommandSuggestion.list.updateCommandNames = null;
CommandSuggestion.list.createCommandTip = null;
CommandSuggestion.list.selectDefaultCommand = null;

// 初始化
CommandSuggestion.initialize = function (): void {
	// 禁止窗口背景幕布
	this.widget.enableAmbient = false;

	// 设置列表搜索框按钮和其他属性
	this.searcher.addCloseButton();
	const mark = document.createElement('text');
	const input = this.searcher.input;
	input.id = 'command-searcher-input';
	mark.id = 'command-searcher-mark';
	mark.textContent = '>';
	this.searcher.insertBefore(mark, input);

	// 绑定指令目录列表
	const { list } = this;
	list.bind(() => this.data);

	// 挂载列表项创建器/更新器 ——
	// createIcon 创建指令图标，createComment 创建英文注释/方法名提示，
	// createCommandTip 添加 command-suggestion-item class 与 tooltip。
	// 此前这些方法定义了却未挂进 creators/updaters，导致新版 DOM 丢失 class 与 comment 元素。
	list.creators.push(list.createIcon!);
	list.creators.push(list.createComment!);
	list.creators.push(list.createCommandTip!);

	// 加载指令数据
	this.data = File.get({
		local: 'commands.json',
		type: 'json'
	}).then((data: CommandSuggestionItem[]) => {
		this.data = data;
	});

	// 侦听事件
	window.on('localize', this.windowLocalize!);
	this.widget.on('close', this.windowClose!);
	this.searcher.on('keydown', this.searcherKeydown!);
	this.searcher.on('input', this.searcherInput!);
	this.searcher.on('compositionend', this.searcherInput!);
	list.on('keydown', this.listKeydown!);
	list.on('pointerdown', this.listPointerdown!);
	list.on('update', this.listUpdate!);
	list.on('open', this.listOpen!);
};

// 打开
CommandSuggestion.open = function (): void {
	const list = Command.target as CommandSuggestionList;
	list.scrollAndResize();
	const point = list.getSelectionPosition();
	if (point) {
		Window.open('command-widget');
		const { widget, list, searcher } = this;
		const x = point.x - 5;
		const y = point.y;
		widget.x = x;
		widget.y = y;
		widget.style.left = `${x}px`;
		widget.style.top = `${y}px`;
		if (!list.initialized) {
			list.initialized = true;
			list.updateCommandNames!();
			list.update();
			list.selectDefaultCommand!();
		} else {
			list.dispatchUpdateEvent();
			list.resize();
		}
		searcher.getFocus();
		window.on('pointerdown', this.pointerdown!, { capture: true });
	}
};

// 选择指令
CommandSuggestion.select = function (item: CommandSuggestionItem): void {
	Window.close('command-widget');
	Command.open!(item.value);
};

// 窗口 - 本地化事件
CommandSuggestion.windowLocalize = function (event: Event): void {
	// 用重置textContent代替clear来保留选中项
	const { list, data } = CommandSuggestion;
	if (list.initialized) {
		list.initialized = false;
		list.textContent = '';
		list.deleteNodeParameters(data);
	}
};

// 窗口 - 关闭事件
CommandSuggestion.windowClose = function (event: Event): void {
	// 删除内容会触发search|update|scroll行为
	// 但是异步触发的scroll事件因为列表被隐藏而不会刷新列表项
	CommandSuggestion.searcher.deleteInputContent();
	CommandSuggestion.list.hide();
	window.off('pointerdown', CommandSuggestion.pointerdown!, {
		capture: true
	});
};

// 指针按下事件
CommandSuggestion.pointerdown = function (event: PointerEvent): void {
	const { widget, list } = CommandSuggestion;
	if (
		!widget.contains(event.target as Node) &&
		!list.contains(event.target as Node)
	) {
		event.preventDefault();
		Window.close('command-widget');
	}
};

// 搜索框 - 键盘按下事件
CommandSuggestion.searcherKeydown = function (event: KeyboardEvent): void {
	switch (event.code) {
		case 'ArrowUp':
		case 'ArrowDown':
			event.preventDefault();
			CommandSuggestion.list.selectRelative(
				event.code.slice(5).toLowerCase()
			);
			break;
		case 'PageUp':
			CommandSuggestion.list.pageUp(true);
			break;
		case 'PageDown':
			CommandSuggestion.list.pageDown(true);
			break;
		case 'Enter':
		case 'NumpadEnter': {
			const item = CommandSuggestion.list.read();
			if (item && !CommandSuggestion.list.hasClass('hidden')) {
				// 阻止触发确定按钮点击操作
				event.stopPropagation();
				CommandSuggestion.list.open(item);
			}
			break;
		}
	}
};

// 搜索框 - 输入事件
CommandSuggestion.searcherInput = function (event: InputEvent): void {
	if (event.inputType !== 'insertCompositionText') {
		const text = String.compress(this.read());
		CommandSuggestion.list.searchNodes(text);
		CommandSuggestion.list.selectDefaultCommand!();
	}
};

// 列表 - 键盘按下事件
CommandSuggestion.listKeydown = function (event: KeyboardEvent): void {
	switch (event.code) {
		case 'Tab':
			// 提前让搜索框获得焦点
			event.preventDefault();
			CommandSuggestion.searcher.input.focus();
			break;
		case 'Home':
			event.preventDefault();
			this.scrollToHome();
			break;
		case 'End':
			event.preventDefault();
			this.scrollToEnd();
			break;
		case 'PageUp':
			event.preventDefault();
			this.pageUp(true);
			break;
		case 'PageDown':
			event.preventDefault();
			this.pageDown(true);
			break;
	}
};

// 列表 - 指针按下事件
CommandSuggestion.listPointerdown = function (event: PointerEvent): void {
	const element = event.target as HTMLElement & {
		item: CommandSuggestionItem;
	};
	if (element.tagName === 'NODE-ITEM' && element.item.class !== 'folder') {
		const pointerup = (event: PointerEvent) => {
			if (this.pressing === pointerup) {
				this.pressing = null;
				if (element.contains(event.target as Node)) {
					CommandSuggestion.select(element.item);
				}
			}
		};
		this.pressing = pointerup;
		window.on('pointerup', pointerup, { once: true });
	}
};

// 列表 - 更新事件
CommandSuggestion.listUpdate = function (event: Event): void {
	const MAX_LINES = 30;
	const { x, y } = CommandSuggestion.widget;
	const space = window.innerHeight - y - 20;
	const below = space >= 200;
	const capacity = below ? Math.floor(space / 20) : Math.floor(y / 20);
	const lines = Math.min(this.elements.count, capacity, MAX_LINES);
	const top = below ? y + 20 : y - lines * 20;
	if (lines !== 0) {
		this.style.left = `${x}px`;
		this.style.top = `${top}px`;
		this.style.height = `${lines * 20}px`;
		this.style.zIndex = (Window.frames.length - 1).toString();
		this.show();
	} else {
		this.hide();
	}
};

// 列表 - 打开事件
CommandSuggestion.listOpen = function (
	event: Event & { value: CommandSuggestionItem }
): void {
	const item = event.value;
	// 指令选项在列表中的时候打开
	if (item.class !== 'folder' && item.element!.parentNode) {
		CommandSuggestion.select(item);
	}
};

// 列表 - 重写创建图标方法
CommandSuggestion.list.createIcon = (function IIFE() {
	return function (item: CommandSuggestionItem): HTMLElement {
		const icon = document.createElement('node-icon') as HTMLElement;
		switch (item.class) {
			case 'folder':
				icon.addClass('icon-folder');
				break;
			default:
				icon.addClass('icon-command');
				icon.addClass(item.class);
				break;
		}
		return icon;
	};
})();

// 列表 - 创建注释
CommandSuggestion.list.createComment = function (
	item: CommandSuggestionItem
): void {
	// 非英文语言包
	if (item.class !== 'folder' && !/^en/.test(Local.language)) {
		// 获取自定义指令的关键字或内置指令的方法名
		const string =
			item.class === 'custom'
				? (item.keywords ?? item.value)
				: item.value;
		if (string) {
			const comment = document.createElement('text');
			comment.addClass('command-suggestion-comment');
			comment.textContent =
				string.charAt(0).toUpperCase() + string.slice(1);
			item.element!.appendChild(comment);
		}
	}
};

// 列表 - 重写搜索节点算法
CommandSuggestion.list.searchNodesAlgorithm = function (
	data: CommandSuggestionItem[],
	keyword: RegExp,
	list: CommandSuggestionItem[]
): void {
	const length = data.length;
	for (let i = 0; i < length; i++) {
		const item = data[i];
		// item.keywords可以是undefined
		switch (item.class) {
			default: {
				if (
					keyword.test(item.unspacedName ?? '') ||
					keyword.test(item.class) ||
					keyword.test(item.value) ||
					keyword.test(item.keywords ?? '')
				) {
					list.push(item);
				}
				const children = item.children;
				if (children instanceof Array) {
					(this as any).searchNodesAlgorithm(children, keyword, list);
				}
				continue;
			}
			case 'custom':
				if (
					keyword.test(item.unspacedName ?? '') ||
					keyword.test(item.class) ||
					keyword.test(item.keywords ?? '')
				) {
					list.push(item);
				}
				continue;
		}
	}
};

// 列表扩展方法 - 更新指令名称
CommandSuggestion.list.updateCommandNames = (function IIFE() {
	const update = (
		data: CommandSuggestionItem[],
		get: (key: string) => string
	): void => {
		const length = data.length;
		for (let i = 0; i < length; i++) {
			const item = data[i];
			const key = item.value;
			const name = get(key);
			const desc = get(key + '.desc');
			item.name = name;
			item.desc = desc;
			item.unspacedName = String.compress(name);
			const children = item.children;
			if (children instanceof Array && key !== 'custom') {
				update(children, get);
			}
		}
	};
	return function (this: CommandSuggestionList): void {
		update(
			this.data as CommandSuggestionItem[],
			Local.createGetter('command')
		);
	};
})();

// 列表扩展方法 - 创建指令提示
CommandSuggestion.list.createCommandTip = (function IIFE() {
	const separator = /\s*,\s*/;
	return function (item: CommandSuggestionItem): void {
		const element = item.element!;
		const words = Command.words as {
			push(s: string): number;
			join(j?: string): string;
		} & Array<string>;
		words.push(item.class);
		if (item.class !== 'custom') {
			words.push(item.value);
		}
		if (item.keywords) {
			for (const keyword of item.keywords.split(separator)) {
				words.push(keyword);
			}
		}
		const tip1 =
			item.class === 'folder'
				? ''
				: `$${item.name}\n${item.desc ?? ''}\n`;
		const tip2 = `$${Local.get('command.keywords')}\n${words.join(', ')}`;
		element.addClass('command-suggestion-item');
		element.setTooltip(Local.parseTip(tip1 + tip2));
	};
})();

// 列表扩展方法 - 选择默认指令选项
CommandSuggestion.list.selectDefaultCommand = function (
	this: CommandSuggestionList
): void {
	// 如果有选中的指令存在于结果列表中则返回
	const { selection, elements } = this;
	const { count } = elements;
	if (selection && selection.class !== 'folder') {
		for (let i = 0; i < count; i++) {
			if (elements[i].item === selection) {
				this.scrollToSelection('middle');
				return;
			}
		}
	}
	// 从结果列表中选择第一个匹配的指令选项
	for (let i = 0; i < count; i++) {
		const item = elements[i].item;
		if (item.class !== 'folder') {
			this.select(item);
			this.scrollToSelection('middle');
			return;
		}
	}
};
