import { $, getElementWriter } from '@/util/dom.ts';
import { Selector } from '@/browser/resource-selector.ts';
import { Command } from './command-object.ts';
import { Menu } from '@/components/menu-list.ts';
import { TreeList } from '@/components/tree-list.ts';
import { Data } from '@/data/data-object.ts';
import { Easing } from '@/data/transition-window.ts';
import { File } from '@/file/file-system-core.ts';
import { PluginManager } from '@/plugin/plugin.ts';
import { Local } from '@/tools/localization.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';
import { Window } from '@/tools/window-object.ts';
import { ctrl } from '@/util/event-accessors.ts';

interface CustomCommandData {
	id: string;
	enabled: boolean;
	alias: string;
	keywords: string;
	parameters?: Record<string, any>;
}

// 自定义指令列表元素契约
interface CustomCommandList {
	removable: boolean;
	creators: any[];
	updaters: any[];
	insert: ((dItem?: any) => void) | null;
	toggle: ((item: CustomCommandData | null) => void) | null;
	copy: ((item: CustomCommandData | null) => void) | null;
	paste: ((dItem?: any) => void) | null;
	delete: (item: any) => void;
	saveSelection: (() => void) | null;
	restoreSelection: (() => void) | null;
	updateNodeElement: any;
	addElementClass: any;
	updateTextNode: any;
	updateToggleStyle: (item: any) => void;
	createEditIcon: any;
	edit: (item: CustomCommandData) => void;
	bind(getter: () => any): void;
	on(type: string, listener: (event: any) => void): void;
	getFocus(): void;
	read(): CustomCommandData | null;
	clear(): void;
	update(): void;
	select(item: CustomCommandData): void;
	scrollToSelection(): void;
	addNodeTo(node: any, dItem: any): void;
	data: CustomCommandData[];
}

type CustomCommandMethod = ((...args: any[]) => any) | null;

interface CustomCommandShape {
	list: CustomCommandList;
	overviewPane: HTMLElement & {
		hide(): HTMLElement & { hide(): HTMLElement };
		show(): HTMLElement;
	};
	overview: HTMLElement & {
		clear(): HTMLElement;
		appendChild<T extends Node>(node: T): T;
	};
	settingsPane: HTMLElement & { hide(): HTMLElement; show(): HTMLElement };
	data: CustomCommandData[] | null;
	meta: any;
	symbol: symbol | null;
	changed: boolean;
	initialize: (() => void) | null;
	open: (() => void) | null;
	load: ((item: CustomCommandData) => Promise<void>) | null;
	unload: (() => void) | null;
	loadOverview: (() => void) | null;
	createData: ((id: string) => CustomCommandData) | null;
	getItemById: ((id: string) => CustomCommandData | null) | null;
	windowClose: ((event: Event) => void) | null;
	windowClosed: ((event: Event) => void) | null;
	pointerdown: CustomCommandMethod;
	scriptChange: ((event: Event & { changedMeta: any }) => void) | null;
	listKeydown: ((this: CustomCommandList, event: KeyboardEvent) => void) | null;
	listSelect: ((event: Event & { value: CustomCommandData }) => void) | null;
	listUnselect: (() => void) | null;
	listChange: (() => void) | null;
	listPopup:
		| ((
				this: CustomCommandList,
				event: PointerEvent & {
					value: CustomCommandData | null;
					clientX: number;
					clientY: number;
				}
		  ) => void)
		| null;
	listOpen:
		| ((this: CustomCommandList, event: Event & { value: CustomCommandData }) => void)
		| null;
	paramInput: ((this: HTMLElement & { id: string; read(): string }, event: Event) => void) | null;
	confirm: ((event: Event) => void) | null;
	apply: ((event: any) => void) | null;
}

export const CustomCommand: CustomCommandShape = {
	list: $('#command-list'),
	overviewPane: $('#command-overview-detail').hide(),
	overview: $('#command-overview'),
	settingsPane: $('#command-settings-detail').hide(),
	data: null,
	meta: null,
	symbol: null,
	changed: false,
	initialize: null,
	open: null,
	load: null,
	unload: null,
	loadOverview: null,
	createData: null,
	getItemById: null,
	windowClose: null,
	windowClosed: null,
	pointerdown: null,
	scriptChange: null,
	listKeydown: null,
	listSelect: null,
	listUnselect: null,
	listChange: null,
	listPopup: null,
	listOpen: null,
	paramInput: null,
	confirm: null,
	apply: null
};

CustomCommand.list.insert = null;
CustomCommand.list.toggle = null;
CustomCommand.list.copy = null;
CustomCommand.list.paste = null;
CustomCommand.list.delete = PluginManager.list.delete;
CustomCommand.list.saveSelection = null;
CustomCommand.list.restoreSelection = null;
CustomCommand.list.updateNodeElement = Easing.list.updateNodeElement;
CustomCommand.list.addElementClass = PluginManager.list.addElementClass;
CustomCommand.list.updateTextNode = PluginManager.list.updateTextNode;
CustomCommand.list.updateToggleStyle = PluginManager.list.updateToggleStyle;
CustomCommand.list.createEditIcon = PluginManager.list.createEditIcon;

CustomCommand.initialize = function (this: CustomCommandShape): void {
	const { list } = this;
	list.removable = true;
	list.bind(() => this.data);
	list.creators.push(list.addElementClass);
	list.creators.push(list.updateToggleStyle);
	list.updaters.push(list.updateTextNode);
	list.creators.push(list.createEditIcon);

	($('#command') as HTMLElement).on('close', this.windowClose!);
	($('#command') as HTMLElement).on('closed', this.windowClosed!);
	list.on('keydown', this.listKeydown!);
	list.on('select', this.listSelect!);
	list.on('unselect', this.listUnselect!);
	list.on('change', this.listChange!);
	list.on('popup', this.listPopup!);
	list.on('open', this.listOpen!);
	list.on('pointerdown', ScriptListInterface.listPointerdown);
	($('#command-alias, #command-keywords') as HTMLElement).on('input', this.paramInput!);
	($('#command-confirm') as HTMLElement).on('click', this.confirm!);
	($('#command-apply') as HTMLElement).on('click', this.apply!);
};

CustomCommand.open = function (this: CustomCommandShape): void {
	Window.open('command');

	this.data = Object.clone(Data.commands);

	this.list.restoreSelection!();

	this.list.getFocus();

	window.on('pointerdown', this.pointerdown!);
	window.on('script-change', this.scriptChange!);
};

CustomCommand.load = async function (
	this: CustomCommandShape,
	item: CustomCommandData
): Promise<void> {
	const symbol = (this.symbol = Symbol());
	const meta = await Data.scripts[item.id];
	if (this.symbol === symbol) {
		this.symbol = null;
		this.meta = meta;
		this.loadOverview!();
		const data = this.list.read();
		if (data) {
			const write = getElementWriter('command', data);
			write('alias');
			write('keywords');
			this.settingsPane.show();
		}
	}
};

CustomCommand.unload = function (this: CustomCommandShape): void {
	this.meta = null;
	this.symbol = null;
	this.overview.clear();
	this.overviewPane.hide();
	this.settingsPane.hide();
};

CustomCommand.loadOverview = function (this: CustomCommandShape): void {
	const { meta } = this;
	if (!meta) return;
	const elements = PluginManager.createOverview(meta, true);
	const overview = this.overview.clear();
	for (const element of elements) {
		overview.appendChild(element);
	}
	this.overviewPane.show();
};

CustomCommand.createData = function (this: CustomCommandShape, id: string): CustomCommandData {
	return {
		id: id,
		enabled: true,
		alias: '',
		keywords: ''
	};
};

CustomCommand.getItemById = Easing.getItemById;

CustomCommand.windowClose = function (this: CustomCommandShape, event: Event): void {
	if (this.changed) {
		event.preventDefault();
		const get = Local.createGetter('confirmation');
		Window.confirm(
			{
				message: get('closeUnsavedCommands')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						Window.close('command');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(CustomCommand);

CustomCommand.windowClosed = function (this: CustomCommandShape, event: Event): void {
	this.list.saveSelection!();
	this.data = null;
	this.list.clear();
	window.off('pointerdown', this.pointerdown!);
	window.off('script-change', this.scriptChange!);
}.bind(CustomCommand);

CustomCommand.pointerdown = PluginManager.pointerdown;

CustomCommand.scriptChange = function (event: Event & { changedMeta: any }): void {
	if (CustomCommand.meta === event.changedMeta) {
		CustomCommand.loadOverview!();
	}
};

CustomCommand.listKeydown = function (
	this: CustomCommandList,
	event: KeyboardEvent & { cmdOrCtrlKey: boolean; altKey: boolean }
): void {
	const item = this.read();
	if (event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'KeyC':
				this.copy!(item);
				break;
			case 'KeyV':
				this.paste!();
				break;
		}
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'Insert':
				this.insert!(item);
				break;
			case 'Slash':
				this.toggle!(item);
				break;
			case 'Delete':
				this.delete(item);
				break;
		}
	}
};

CustomCommand.listSelect = function (event: Event & { value: CustomCommandData }): void {
	CustomCommand.load!(event.value);
};

CustomCommand.listUnselect = function (): void {
	CustomCommand.unload!();
};

CustomCommand.listChange = function (): void {
	CustomCommand.changed = true;
};

CustomCommand.listPopup = function (
	this: CustomCommandList,
	event: PointerEvent & {
		value: CustomCommandData | null;
		clientX: number;
		clientY: number;
	}
): void {
	const item = event.value;
	const selected = !!item;
	const pastable = (Clipboard as any).has('yami.data.customCommand');
	const deletable = selected;
	const get = Local.createGetter('menuCustomCommandList');
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			{
				label: get('edit'),
				accelerator: 'Enter',
				enabled: selected,
				click: () => {
					this.edit(item!);
				}
			},
			{
				label: get('insert'),
				accelerator: 'Insert',
				click: () => {
					this.insert!(item);
				}
			},
			{
				label: get('toggle'),
				accelerator: '/',
				enabled: selected,
				click: () => {
					this.toggle!(item);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: selected,
				click: () => {
					this.copy!(item);
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					this.paste!(item);
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: deletable,
				click: () => {
					this.delete(item);
				}
			}
		]
	);
};

CustomCommand.listOpen = function (
	this: CustomCommandList,
	event: Event & { value: CustomCommandData }
): void {
	this.edit(event.value);
};

CustomCommand.paramInput = function (
	this: HTMLElement & { id: string; read(): string },
	event: Event
): void {
	CustomCommand.changed = true;
	const data = CustomCommand.list.read()!;
	switch (this.id) {
		case 'command-alias':
			(data as CustomCommandData).alias = this.read();
			break;
		case 'command-keywords':
			(data as CustomCommandData).keywords = this.read();
			break;
	}
};

CustomCommand.confirm = function (this: CustomCommandShape, event: Event): void {
	this.apply!(event);
	Window.close('command');
}.bind(CustomCommand);

CustomCommand.apply = function (this: CustomCommandShape, event: any): void {
	if (this.changed) {
		this.changed = false;

		let commands = this.data;
		if (event instanceof Event) {
			commands = Object.clone(commands);
		} else {
			TreeList.deleteCaches(commands);
		}
		Data.commands = commands;
		File.planToSave(Data.manifest.project.commands);
		Command.custom.loadCommandList!();
	}
}.bind(CustomCommand);

CustomCommand.list.edit = function (this: CustomCommandList, item: CustomCommandData): void {
	Selector.open(
		{
			filter: 'script',
			read: () => item.id,
			input: (id: string) => {
				if (item.id !== id) {
					item.id = id;
					item.parameters = {};
					CustomCommand.changed = true;
					// CustomCommand.parameterPane.update()
				}
				this.update();
			}
		},
		false
	);
};

CustomCommand.list.insert = function (this: CustomCommandList, dItem?: any): void {
	Selector.open(
		{
			filter: 'script',
			read: () => '',
			input: (id: string) => {
				this.addNodeTo(CustomCommand.createData!(id), dItem);
			}
		},
		false
	);
};

CustomCommand.list.toggle = function (
	this: CustomCommandList,
	item: CustomCommandData | null
): void {
	if (item) {
		(item as CustomCommandData).enabled = !item.enabled;
		this.updateToggleStyle(item);
		CustomCommand.changed = true;
	}
};

CustomCommand.list.copy = function (item: CustomCommandData | null): void {
	if (item) {
		(Clipboard as any).write('yami.data.customCommand', item);
	}
};

CustomCommand.list.paste = function (this: CustomCommandList, dItem?: any): void {
	const copy = (Clipboard as any).read('yami.data.customCommand');
	if (copy) {
		this.addNodeTo(copy, dItem);
	}
};

CustomCommand.list.saveSelection = function (this: CustomCommandList): void {
	const { commands } = Data;
	if ((commands as any).selection === undefined) {
		Object.defineProperty(commands, 'selection', {
			writable: true,
			value: ''
		});
	}
	const selection = this.read();
	if (selection) {
		(commands as any).selection = selection.id;
	}
};

CustomCommand.list.restoreSelection = function (this: CustomCommandList): void {
	const id = (Data.commands as any).selection;
	const item = CustomCommand.getItemById!(id) ?? this.data[0];
	this.select(item);
	this.update();
	this.scrollToSelection();
};
