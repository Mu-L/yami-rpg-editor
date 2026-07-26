import { $ } from '@/util/dom.ts';
import { ctrl } from '@/util/event-accessors.ts';
import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Shortcuts } from '@/tools/shortcut-registry.ts';
import { DetailBox } from '@/components/detail-box.ts';
import { DetailSummary } from '@/components/detail-summary.ts';
import { Menu } from '@/components/menu-list.ts';
import { TextArea } from '@/components/text-area.ts';
import { TreeList } from '@/components/tree-list.ts';
import { GUID } from '@/file/guid.ts';
import { ExportLanguage } from './export-language-window.ts';
import { ImportLanguage } from './import-language-window.ts';
import { Reference } from '@/log/related-references.ts';
import { History } from '@/tools/history.ts';
import { Local } from '@/tools/localization.ts';
import { Selection } from '@/tools/text-capture.ts';
import { UndoManager } from '@/tools/undo-manager.ts';
import { Window } from '@/tools/window-object.ts';
import { ipcRenderer } from 'electron';

export const Localization = {
	list: $('#localization-list'),
	panel: $('#localization-inspector').hide(),
	searcher: $('#localization-searcher'),
	inputs: null,
	target: null,
	data: null,
	idMap: null,
	languages: null,
	history: null,
	changed: false,
	initialize: null,
	open: null,
	undo: null,
	redo: null,
	createId: null,
	register: null,
	unregister: null,
	getItemById: null,
	openContentPanel: null,
	closeContentPanel: null,
	unpackLocalization: null,
	packLocalization: null,
	resizeTextArea: null,
	windowClose: null,
	windowClosed: null,
	keydown: null,
	listKeydown: null,
	listPointerdown: null,
	listDoubleclick: null,
	listSelect: null,
	listRecord: null,
	listOpen: null,
	listPopup: null,
	panelInput: null,
	panelKeydown: null,
	searcherInput: null,
	confirm: null,
	apply: null,
	// runtime 挂载: createInputs/fromExcel/toExcel 在本文件下方动态挂载
	createInputs: null as any,
	fromExcel: null as any,
	toExcel: null as any
};

Localization.list.copy = null;
Localization.list.paste = null;
Localization.list.delete = null;
Localization.list.saveScroll = null;
Localization.list.restoreScroll = null;
Localization.list.cancelSearch = null;
Localization.list.createItem = null;
Localization.list.createIcon = null;
Localization.list.addElementClass = null;
Localization.list.updateItemClass = null;
Localization.list.updateItemName = null;
Localization.list.createInitText = null;
Localization.list.updateInitText = null;
Localization.list.onCreate = null;
Localization.list.onDelete = null;
Localization.list.onResume = null;

Localization.initialize = function () {
	const { list } = this;
	list.removable = true;
	list.renamable = true;
	list.bind(() => this.data);
	list.creators.push(list.addElementClass);
	list.updaters.push(list.updateItemClass);
	list.creators.push(list.createInitText);
	list.creators.push(list.updateInitText);

	this.panel.item = null;

	this.searcher.addCloseButton();

	History.processors['localization-list-operation'] = (operation, data) => {
		const { response } = data;
		list.restore(operation, response);
		if (list.read() === null && this.panel.item !== null) {
			this.closeContentPanel();
		}
		this.changed = true;
	};
	History.processors['localization-content-change'] = (operation, data) => {
		const { item, language, content } = data;
		data.content = item.contents[language];
		item.contents[language] = content;
		if (this.panel.item === item) {
			const textarea = this.inputs[language];
			textarea.write(content);
			this.resizeTextArea(textarea);
		} else {
			list.select(item);
			list.expandToSelection();
			list.scrollToSelection();
		}
		list.updateInitText(item);
		this.changed = true;
	};

	$('#localization').on('close', this.windowClose);
	$('#localization').on('closed', this.windowClosed);
	list.on('keydown', this.listKeydown);
	list.on('pointerdown', this.listPointerdown);
	list.on('pointerdown', Reference.getPointerdownListener(list), {
		capture: true
	});
	list.on('doubleclick', this.listDoubleclick, { capture: true });
	list.on('select', this.listSelect);
	list.on('record', this.listRecord);
	list.on('open', this.listOpen);
	list.on('popup', this.listPopup);
	this.panel.on('input', this.panelInput);
	this.panel.on('keydown', this.panelKeydown);
	this.searcher.on('input', this.searcherInput);
	this.searcher.on('compositionend', this.searcherInput);
	$('#localization-confirm').on('click', this.confirm);
	$('#localization-apply').on('click', this.apply);
	$('#localization-to-excel').on('click', this.toExcel);
	$('#localization-from-excel').on('click', this.fromExcel);

	ExportLanguage.initialize();
	ImportLanguage.initialize();
};

Localization.createInputs = function () {
	const inputs = (this.inputs = {});
	for (const language of this.languages) {
		const detailBox = new DetailBox();
		detailBox.setAttribute('open', '');
		const detailSummary = new DetailSummary();
		detailSummary.textContent = Local.get('languages.' + language);
		const textarea = new TextArea();
		(textarea as TextArea & { language: string }).language = language;
		textarea.setAttribute('menu', 'tag-global tag-dynamic-global-var');
		textarea.addClass('localization-text-area');
		detailBox.appendChild(detailSummary);
		detailBox.appendChild(textarea);
		this.panel.appendChild(detailBox);
		inputs[language] = textarea;
		Selection.addEventListeners(textarea);
	}
};

Localization.open = function (target = null) {
	this.target = target;
	this._previousActive = UndoManager.getActive();
	this.history = new History(100);
	UndoManager.setActive(this);
	this.unpackLocalization();
	this.createInputs();
	Window.open('localization');

	const list = this.list;
	const item = !target ? undefined : this.getItemById(target.read());
	if (item) {
		list.initialize();
		list.select(item);
		list.expandToSelection(false);
		list.update();
		list.restoreScroll();
		list.scrollToSelection('middle');
	} else {
		list.update();
		list.restoreScroll();
		if (target instanceof Object) {
			list.select(list.data[0]);
		}
	}

	list.getFocus();

	window.on('keydown', this.keydown);
	window.on('keydown', Reference.getKeydownListener(list, 'localization'));
};

Localization.undo = function () {
	if (this.history.canUndo()) {
		this.history.restore('undo');
	}
};

Localization.redo = function () {
	if (this.history.canRedo()) {
		this.history.restore('redo');
	}
};

Localization.createId = function () {
	let id;
	do {
		id = GUID.generate64bit();
	} while (this.idMap[id]);
	return id;
};

Localization.register = function (item) {
	if (item.class === 'folder') {
		for (const child of item.children) {
			Localization.register(child);
		}
	} else {
		Localization.idMap[item.id] = true;
	}
};

Localization.unregister = function (item) {
	if (item.class === 'folder') {
		for (const child of item.children) {
			Localization.unregister(child);
		}
	} else {
		delete Localization.idMap[item.id];
	}
};

Localization.getItemById = (function IIFE() {
	const find = (items, id) => {
		const length = items.length;
		for (let i = 0; i < length; i++) {
			const item = items[i];
			if (item.id === id) {
				return item;
			}
			if (item.class === 'folder') {
				const result = find(item.children, id);
				if (result !== undefined) {
					return result;
				}
			}
		}
		return undefined;
	};
	return function (id) {
		return find(this.data, id);
	};
})();

Localization.openContentPanel = function (item) {
	const panel = this.panel;
	if (panel.item !== item) {
		panel.item = item;
		panel.show();
		const { inputs } = this;
		for (const language of this.languages) {
			const textarea = inputs[language];
			textarea.write(item.contents[language]);
			this.resizeTextArea(textarea);
		}
	}
};

Localization.closeContentPanel = function () {
	const panel = this.panel;
	if (panel.item) {
		panel.item = null;
		panel.hide();
	}
};

Localization.unpackLocalization = (function IIFE() {
	class ReferencedFolder {
		data: any;
		class: string;
		name: string;
		children: any[];
		constructor(item: any) {
			this.data = item;
			this.class = item.class;
			this.name = item.name;
			this.children = clone(item.children);
		}

		get expanded() {
			return this.data.expanded;
		}

		set expanded(value: any) {
			this.data.expanded = value;
			File.planToSave(Data.manifest.project.localization);
		}
	}
	const clone = (items) => {
		const length = items.length;
		const copies = Array(length);
		for (let i = 0; i < length; i++) {
			const item = items[i];
			if (item.class !== 'folder') {
				copies[i] = Object.clone(item);
				Localization.idMap[item.id] = true;
			} else {
				copies[i] = new ReferencedFolder(item);
			}
		}
		return copies;
	};
	return function () {
		this.idMap = {};
		this.data = clone(Data.localization.list);
		this.languages = Data.config.localization.languages.map((lang) => lang.name);
	};
})();

Localization.packLocalization = (function IIFE() {
	const clone = (items) => {
		const length = items.length;
		const copies = Array(length);
		for (let i = 0; i < length; i++) {
			const item = items[i];
			if (item.class !== 'folder') {
				copies[i] = Object.clone(item);
			} else {
				copies[i] = {
					class: item.class,
					name: item.name,
					expanded: item.expanded,
					children: clone(item.children)
				};
			}
		}
		return copies;
	};
	return function () {
		Data.localization.list = clone(this.data);
		Data.createLocalizationMap();
	};
})();

Localization.resizeTextArea = function (textarea) {
	const shadowDOM = textarea.querySelector('textarea');
	textarea.style.height = '0';
	textarea.style.height = `${Math.clamp(shadowDOM.scrollHeight + 11, 40, 200)}px`;
};

Localization.windowClose = function (event) {
	this.list.saveScroll();
	if (this.changed) {
		event.preventDefault();
		const get = Local.createGetter('confirmation');
		Window.confirm(
			{
				message: get('closeUnsavedLocalization')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						Window.close('localization');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(Localization);

Localization.windowClosed = function () {
	this.data = null;
	this.idMap = null;
	this.inputs = null;
	UndoManager.setActive(this._previousActive);
	this._previousActive = null;
	this.history = null;
	this.languages = null;
	this.searcher.write('');
	this.list.clear();
	this.panel.clear();
	this.closeContentPanel();
	window.off('keydown', this.keydown);
	window.off('keydown', Reference.getKeydownListener(this.list));
}.bind(Localization);

Localization.keydown = Shortcuts.createUndoRedo(Localization);

Localization.listKeydown = function (event) {
	const item = this.read();
	if (event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'KeyC':
				this.copy(item);
				break;
			case 'KeyV':
				this.paste();
				break;
		}
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'Insert':
				this.addNodeTo(this.createItem(), item);
				break;
			case 'Delete':
				this.delete(item);
				break;
			case 'Backspace':
				this.cancelSearch();
				break;
		}
	}
};

Localization.listPointerdown = function (event) {
	switch (event.button) {
		case 0:
			if (event.target === this) {
				this.unselect();
				Localization.closeContentPanel();
			}
			break;
		case 3:
			this.cancelSearch();
			break;
	}
};

Localization.listDoubleclick = function (event) {
	if (Localization.target && Localization.list.read()?.id !== undefined) {
		Localization.target.getFocus?.();
		event.stopPropagation();
		event.preventDefault();
		Localization.confirm();
	}
};

Localization.listSelect = function (event) {
	const item = event.value;
	return item.class !== 'folder'
		? Localization.openContentPanel(item)
		: Localization.closeContentPanel();
};

Localization.listRecord = function (event) {
	Localization.changed = true;
	Localization.history.save({
		type: 'localization-list-operation',
		response: event.value
	});
};

Localization.listOpen = function (event) {
	Localization.listDoubleclick(event);
};

Localization.listPopup = function (event) {
	const item = event.value;
	const selected = !!item;
	const copyable = selected && item.class !== 'folder';
	const pastable = (Clipboard as any).has('yami.data.localization');
	const undoable = Localization.history.canUndo();
	const redoable = Localization.history.canRedo();
	const get = Local.createGetter('menuLocalList');
	const items: any[] = [
		{
			label: get('create'),
			submenu: [
				{
					label: get('create.folder'),
					click: () => {
						this.addNodeTo(this.createFolder(), item);
					}
				},
				{
					label: get('create.text'),
					accelerator: 'Insert',
					click: () => {
						this.addNodeTo(this.createItem(), item);
					}
				}
			]
		},
		{
			label: get('copy'),
			accelerator: ctrl('C'),
			enabled: copyable,
			click: () => {
				this.copy(item);
			}
		},
		{
			label: get('paste'),
			accelerator: ctrl('V'),
			enabled: pastable,
			click: () => {
				this.paste(item);
			}
		},
		{
			label: get('delete'),
			accelerator: 'Delete',
			enabled: selected,
			click: () => {
				this.delete(item);
			}
		},
		{
			label: get('rename'),
			accelerator: 'F2',
			enabled: selected,
			click: () => {
				this.rename(item);
			}
		},
		{
			label: get('undo'),
			accelerator: ctrl('Z'),
			enabled: undoable,
			click: () => {
				Localization.undo();
			}
		},
		{
			label: get('redo'),
			accelerator: ctrl('Y'),
			enabled: redoable,
			click: () => {
				Localization.redo();
			}
		}
	];
	if (copyable) {
		items.unshift({
			label: `ID: ${item.id}`,
			style: 'id',
			click: () => {
				void navigator.clipboard.writeText(item.id);
			}
		});
		items.push({
			label: get('find-references'),
			accelerator: 'Alt+LB',
			click: () => {
				Reference.openRelated(item.id);
			}
		});
	}
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		items
	);
};

Localization.panelInput = function (event) {
	const element = event.target;
	if (element.tagName === 'TEXTAREA') {
		const item = Localization.panel.item;
		const textarea = element.parentNode;
		const language = textarea.language;
		const history = Localization.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		if (
			index !== length - 1 ||
			record === undefined ||
			record.item !== item ||
			record.language !== language
		) {
			Localization.history.save({
				type: 'localization-content-change',
				item: item,
				language: language,
				content: item.contents[language]
			});
		}
		item.contents[language] = textarea.read();
		Localization.resizeTextArea(textarea);
		Localization.list.updateInitText(item);
		Localization.changed = true;
	}
};

Localization.panelKeydown = function (event) {
	if (event.target.tagName === 'TEXTAREA' && event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				break;
			default:
				event.stopPropagation();
				break;
		}
	}
};

Localization.searcherInput = function (event) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = this.input.value;
	Localization.list.searchNodesDebounced(text);
};

Localization.confirm = function () {
	if (this.target) {
		const item = this.list.read();
		if (item?.id === undefined) {
			return this.list.getFocus();
		}
		Selection.restoreContext();
		this.apply();
		this.target.input(item.id);
	} else {
		this.apply();
	}
	Window.close('localization');
}.bind(Localization);

Localization.apply = function () {
	if (this.changed) {
		this.changed = false;

		this.packLocalization();
		File.planToSave(Data.manifest.project.localization);

		window.dispatchEvent(new Event('localizationchange'));
	}
}.bind(Localization);

Localization.fromExcel = async function (event) {
	const items = await ipcRenderer.invoke('from-excel');
	if (JSON.stringify(items) == JSON.stringify(Data.localization.list) || !items.length) return;
	Data.localization.list = items;
	Localization.windowClose(event);
	Localization.windowClosed(event);
	Localization.open();
	this.changed = true;
	Localization.apply();
}.bind(Localization);

Localization.toExcel = function () {
	void ipcRenderer.invoke('to-excel', {
		langs: this.languages,
		list: Data.localization.list
	});
}.bind(Localization);

// 列表 - 复制
Localization.list.copy = function (item) {
	if (item?.class !== 'folder') {
		(Clipboard as any).write('yami.data.localization', item);
	}
};

// 列表 - 粘贴
Localization.list.paste = function (dItem) {
	const copy = (Clipboard as any).read('yami.data.localization');
	if (copy) {
		// 只有冲突时进行更换ID 支持跨项目复制保留ID
		if (Localization.idMap[copy.id]) {
			copy.id = Localization.createId();
			copy.name += ' - Copy';
		}
		this.addNodeTo(copy, dItem);
	}
};

// 列表 - 删除
Localization.list.delete = function (item) {
	if (item) {
		const get = Local.createGetter('confirmation');
		Window.confirm(
			{
				message: get('deleteSingleFile').replace('<filename>', item.name)
			},
			[
				{
					label: get('yes'),
					click: () => {
						const elements = this.elements;
						const index = elements.indexOf(item.element);
						this.deleteNode(item);
						Localization.closeContentPanel();
						const last = elements.count - 1;
						const element = elements[Math.min(index, last)];
						if (element instanceof HTMLElement) {
							this.select(element.item);
						}
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
};

// 列表 - 保存滚动状态
Localization.list.saveScroll = function () {
	const { localization } = Data;
	// 将数据保存在外部可以切换项目后重置
	if (localization.scrollTop === undefined) {
		Object.defineProperty(localization, 'scrollTop', {
			writable: true,
			value: 0
		});
	}
	localization.scrollTop = this.scrollTop;
};

// 列表 - 恢复滚动状态
Localization.list.restoreScroll = function () {
	this.scrollTop = Data.localization.scrollTop ?? 0;
};

// 列表 - 取消搜索
Localization.list.cancelSearch = function () {
	if (this.display === 'search') {
		const active = document.activeElement;
		Localization.searcher.deleteInputContent();
		this.expandToSelection();
		this.scrollToSelection();
		active.focus();
	}
};

// 列表 - 创建文件夹
Localization.list.createFolder = function () {
	return {
		class: 'folder',
		name: 'New Folder',
		expanded: false,
		children: []
	};
};

// 列表 - 创建本地化项目
Localization.list.createItem = function () {
	const contents = {};
	for (const language of Localization.languages) {
		contents[language] = '';
	}
	return {
		id: Localization.createId(),
		name: '',
		contents: contents
	};
};

// 列表 - 重写创建图标方法
Localization.list.createIcon = function (item) {
	const icon = document.createElement('node-icon');
	if (item.class !== 'folder') {
		icon.addClass('icon-string');
	} else {
		icon.addClass('icon-folder');
	}
	return icon;
};

// 列表 - 添加元素类名
Localization.list.addElementClass = function (item) {
	item.element.addClass('localization-item');
};

// 列表 - 更新项目类名
Localization.list.updateItemClass = function (item) {
	if (item.class !== 'folder') {
		item.element.addClass('reference');
	} else {
		item.element.removeClass('reference');
	}
};

// 列表 - 重写更新项目名称方法
Localization.list.updateItemName = function (item) {
	TreeList.prototype.updateItemName.call(this, item);
	this.updateInitText(item);
};

// 列表 - 创建初始化文本
Localization.list.createInitText = function (item) {
	if (item.class !== 'folder') {
		const { element } = item;
		const initText = document.createElement('text');
		initText.addClass('localization-init-text');
		element.appendChild(initText);
		element.initText = initText;
		element.attrValue = '';
	}
};

// 列表 - 更新初始化文本
Localization.list.updateInitText = function (item) {
	const { element } = item;
	if (element.initText !== undefined) {
		let value = '';
		for (const language of Localization.languages) {
			if (item.contents[language]) {
				value = item.contents[language];
				break;
			}
		}
		if (item.name !== '') {
			if (value !== '') {
				value = ' = ' + value;
			}
		} else {
			if (value === '') {
				value = 'Text';
			}
		}
		if (element.attrValue !== value) {
			element.attrValue = value;
			element.initText.textContent = value;
		}
	}
};

// 列表 - 在创建数据时回调
Localization.list.onCreate = function (item) {
	Localization.register(item);
};

// 列表 - 在删除数据时回调
Localization.list.onDelete = function (item) {
	Localization.unregister(item);
};

// 列表 - 在恢复数据时回调
Localization.list.onResume = function (item) {
	Localization.register(item);
};
