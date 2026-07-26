import { $, getElementWriter } from '@/util/dom.ts';
import { ctrl } from '@/util/event-accessors.ts';
import { Command } from './command-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Editor } from '@/main/editor.ts';
import { Data } from '@/data/data-object.ts';
import { Enum } from '@/enum/enum-window.ts';
import { Window } from '@/tools/window-object.ts';
import { TreeList } from '@/components/tree-list.ts';
import { Local } from '@/tools/localization.ts';
import { Menu } from '@/components/menu-list.ts';
import { Inspector } from '@/inspector/inspector.ts';

interface EventEditorList {
	lastScrollTop: number;
	selectIndex: ((index: number) => void) | null;
	close: ((item?: any) => void) | null;
	closeMultiple: ((items: any[], callback?: () => void) => void) | null;
	closeBelow: ((item: any) => void) | null;
	closeOthers: ((item: any) => void) | null;
	closeAll: (() => void) | null;
	saveScroll: (() => void) | null;
	restoreScroll: (() => void) | null;
	defineProperties: ((item: any) => any) | null;
	createLocalEventItem:
		| ((inserting: any, filter: any, name: any, event: any, callback: any) => any)
		| null;
	createGlobalEventItem: ((guid: string) => any) | null;
	createIcon: ((item: any) => HTMLElement) | null;
	updateItemClass: ((item: any) => void) | null;
	createInitText: ((item: any) => void) | null;
	updateInitText: ((item: any) => void) | null;
	updateItemName: ((item: any) => void) | null;
	closeButtonClick: ((event: Event) => void) | null;
	removable: boolean;
	foldable: boolean;
	creators: any[];
	updaters: any[];
	bind(getter: () => any): void;
	on(type: string, listener: (event: any) => void, options?: any): void;
	off(type: string, listener: (event: any) => void, options?: any): void;
	resize(): void;
	update(): void;
	hide(): HTMLElement | void;
	show(): HTMLElement | void;
	hasClass(name: string): boolean;
	addClass(name: string): void;
	removeClass(name: string): void;
	getFocus(): void;
	read(): any;
	select(item: any): void;
	scrollToSelection(mode?: string): void;
	deleteNodeParameters(data: any): void;
	scrollToHome(): void;
	scrollToEnd(): void;
	style: CSSStyleDeclaration;
	textContent: string;
	parentNode: Node & { item?: any };
	contains(node: Node | null): boolean;
	item: any;
	class: string;
	filter: string;
	type: string;
	name: string;
	meta?: any;
	event?: any;
	callback?: any;
	inserting?: boolean;
	changed?: boolean;
	// 运行时挂载的列表项集合
	elements: any[] & { count: number };
	active: number | null;
	varList?: any[];
	commandList?: any;
}

type EventEditorMethod = ((...args: any[]) => any) | null;

interface EventEditorShape {
	list: EventEditorList;
	commandList: HTMLElement & { [k: string]: any; innerHeight?: number };
	outerGutter: HTMLElement;
	innerGutter: HTMLElement;
	closing: boolean;
	data: any[] | null;
	caches: any[];
	types: any;
	initialize: (() => void) | null;
	openLocalEvent: EventEditorMethod;
	openGlobalEvent: EventEditorMethod;
	openRelatedEvents: EventEditorMethod;
	findRelatedEvents: EventEditorMethod;
	getAllLocalEvents: EventEditorMethod;
	clearAllEventClasses: EventEditorMethod;
	clearRelatedEventClasses: EventEditorMethod;
	save: EventEditorMethod;
	isChanged: EventEditorMethod;
	getItemById: EventEditorMethod;
	getItemByEvent: EventEditorMethod;
	openCommandList: EventEditorMethod;
	closeCommandList: EventEditorMethod;
	unpackOpenEvents: EventEditorMethod;
	packOpenEvents: EventEditorMethod;
	resizeGutter: EventEditorMethod;
	updateGutter: EventEditorMethod;
	appendCommandsToCaches: EventEditorMethod;
	fetchCommandBuffer: EventEditorMethod;
	clearCommandBuffers: EventEditorMethod;
	getGlobalEventName: EventEditorMethod;
	windowLocalize: EventEditorMethod;
	windowClose: EventEditorMethod;
	windowClosed: EventEditorMethod;
	windowResize: EventEditorMethod;
	windowKeydown: EventEditorMethod;
	windowKeyup: EventEditorMethod;
	windowPointermove: EventEditorMethod;
	listPointerdown: EventEditorMethod;
	listSelect: EventEditorMethod;
	listPopup: EventEditorMethod;
	typeInput: EventEditorMethod;
	commandListChange: EventEditorMethod;
	commandListUpdate: EventEditorMethod;
	commandListScroll: EventEditorMethod;
	confirm: EventEditorMethod;
	apply: EventEditorMethod;
}

export const EventEditor: EventEditorShape = {
	list: $('#event-open-list'),
	commandList: $('#event-commands'),
	outerGutter: $('#event-commands-gutter-outer'),
	innerGutter: $('#event-commands-gutter-inner'),
	closing: false,
	data: null,
	caches: [],
	types: null,
	initialize: null,
	openLocalEvent: null,
	openGlobalEvent: null,
	openRelatedEvents: null,
	findRelatedEvents: null,
	getAllLocalEvents: null,
	clearAllEventClasses: null,
	clearRelatedEventClasses: null,
	save: null,
	isChanged: null,
	getItemById: null,
	getItemByEvent: null,
	openCommandList: null,
	closeCommandList: null,
	unpackOpenEvents: null,
	packOpenEvents: null,
	resizeGutter: null,
	updateGutter: null,
	appendCommandsToCaches: null,
	fetchCommandBuffer: null,
	clearCommandBuffers: null,
	getGlobalEventName: null,
	windowLocalize: null,
	windowClose: null,
	windowClosed: null,
	windowResize: null,
	windowKeydown: null,
	windowKeyup: null,
	windowPointermove: null,
	listPointerdown: null,
	listSelect: null,
	listPopup: null,
	typeInput: null,
	commandListChange: null,
	commandListUpdate: null,
	commandListScroll: null,
	confirm: null,
	apply: null
};

EventEditor.list.lastScrollTop = 0;
EventEditor.list.selectIndex = null;
EventEditor.list.close = null;
EventEditor.list.closeMultiple = null;
EventEditor.list.closeBelow = null;
EventEditor.list.closeOthers = null;
EventEditor.list.closeAll = null;
EventEditor.list.saveScroll = null;
EventEditor.list.restoreScroll = null;
EventEditor.list.defineProperties = null;
EventEditor.list.createLocalEventItem = null;
EventEditor.list.createGlobalEventItem = null;
EventEditor.list.createIcon = null;
EventEditor.list.updateItemClass = null;
EventEditor.list.createIcon = null;
EventEditor.list.createInitText = null;
EventEditor.list.updateInitText = null;
EventEditor.list.updateItemName = null;
EventEditor.list.closeButtonClick = null;

EventEditor.initialize = function () {
	const { list } = this;
	list.removable = true;
	list.foldable = false;
	list.bind(() => this.data);
	list.updaters.push(list.updateItemClass);
	list.creators.push(list.createInitText);
	list.creators.push(list.updateInitText);

	const types = {
		common: { name: 'Common', value: 'common', tip: '' },
		create: { name: 'Create', value: 'create', tip: '' },
		autorun: { name: 'Autorun', value: 'autorun', tip: '' },
		collision: { name: 'Collision', value: 'collision', tip: '' },
		hittrigger: { name: 'Hit Trigger', value: 'hittrigger', tip: '' },
		hitactor: { name: 'Hit Actor', value: 'hitactor', tip: '' },
		destroy: { name: 'Destroy', value: 'destroy', tip: '' },
		playerenter: { name: 'Player Enter', value: 'playerenter', tip: '' },
		playerleave: { name: 'Player Leave', value: 'playerleave', tip: '' },
		actorenter: { name: 'Actor Enter', value: 'actorenter', tip: '' },
		actorleave: { name: 'Actor Leave', value: 'actorleave', tip: '' },
		skillcast: { name: 'Cast Skill', value: 'skillcast', tip: '' },
		skilladd: { name: 'Add Skill', value: 'skilladd', tip: '' },
		skillremove: { name: 'Remove Skill', value: 'skillremove', tip: '' },
		stateadd: { name: 'Add State', value: 'stateadd', tip: '' },
		stateremove: { name: 'Remove State', value: 'stateremove', tip: '' },
		equipmentadd: { name: 'Add Equipment', value: 'equipmentadd', tip: '' },
		equipmentremove: {
			name: 'Remove Equipment',
			value: 'equipmentremove',
			tip: ''
		},
		equipmentgain: {
			name: 'Gain Equipment',
			value: 'equipmentgain',
			tip: ''
		},
		itemuse: { name: 'Use Item', value: 'itemuse', tip: '' },
		itemgain: { name: 'Gain Item', value: 'itemgain', tip: '' },
		moneygain: { name: 'Gain Money', value: 'moneygain', tip: '' },
		startup: { name: 'Startup', value: 'startup', tip: '' },
		createscene: { name: 'Create Scene', value: 'createscene', tip: '' },
		loadscene: { name: 'Load Scene', value: 'loadscene', tip: '' },
		loadsave: { name: 'Load Save', value: 'loadsave', tip: '' },
		showtext: { name: 'Show Text', value: 'showtext', tip: '' },
		showchoices: { name: 'Show Choices', value: 'showchoices', tip: '' },
		keydown: { name: 'Key Down', value: 'keydown', tip: '' },
		keyup: { name: 'Key Up', value: 'keyup', tip: '' },
		mousedown: { name: 'Mouse Down', value: 'mousedown', tip: '' },
		mousedownLB: { name: 'Mouse Down LB', value: 'mousedownLB', tip: '' },
		mousedownRB: { name: 'Mouse Down RB', value: 'mousedownRB', tip: '' },
		mouseup: { name: 'Mouse Up', value: 'mouseup', tip: '' },
		mouseupLB: { name: 'Mouse Up LB', value: 'mouseupLB', tip: '' },
		mouseupRB: { name: 'Mouse Up RB', value: 'mouseupRB', tip: '' },
		mousemove: { name: 'Mouse Move', value: 'mousemove', tip: '' },
		mouseenter: { name: 'Mouse Enter', value: 'mouseenter', tip: '' },
		mouseleave: { name: 'Mouse Leave', value: 'mouseleave', tip: '' },
		click: { name: 'Click', value: 'click', tip: '' },
		doubleclick: { name: 'Double Click', value: 'doubleclick', tip: '' },
		wheel: { name: 'Wheel', value: 'wheel', tip: '' },
		touchstart: { name: 'Touch Start', value: 'touchstart', tip: '' },
		touchmove: { name: 'Touch Move', value: 'touchmove', tip: '' },
		touchend: { name: 'Touch End', value: 'touchend', tip: '' },
		select: { name: 'Select Button', value: 'select', tip: '' },
		deselect: { name: 'Deselect Button', value: 'deselect', tip: '' },
		input: { name: 'Input', value: 'input', tip: '' },
		focus: { name: 'Focus', value: 'focus', tip: '' },
		blur: { name: 'Blur', value: 'blur', tip: '' },
		end: { name: 'Play Ended', value: 'ended', tip: '' },
		gamepadbuttonpress: {
			name: 'Gamepad Press',
			value: 'gamepadbuttonpress',
			tip: ''
		},
		gamepadbuttonrelease: {
			name: 'Gamepad Release',
			value: 'gamepadbuttonrelease',
			tip: ''
		},
		gamepadleftstickchange: {
			name: 'Left Stick Change',
			value: 'gamepadleftstickchange',
			tip: ''
		},
		gamepadrightstickchange: {
			name: 'Right Stick Change',
			value: 'gamepadrightstickchange',
			tip: ''
		},
		preload: { name: 'Preload', value: 'preload', tip: '' }
	};
	this.types = {
		all: Object.values<any>(types),
		global: [
			types.common,
			types.autorun,
			types.keydown,
			types.keyup,
			types.mousedown,
			types.mouseup,
			types.mousemove,
			types.doubleclick,
			types.wheel,
			types.touchstart,
			types.touchmove,
			types.touchend,
			types.gamepadbuttonpress,
			types.gamepadbuttonrelease,
			types.gamepadleftstickchange,
			types.gamepadrightstickchange,
			types.equipmentgain,
			types.itemgain,
			types.moneygain,
			types.startup,
			types.createscene,
			types.loadscene,
			types.loadsave,
			types.showtext,
			types.showchoices,
			types.preload
		],
		scene: [types.create, types.autorun, types.destroy],
		actor: [
			types.create,
			types.autorun,
			types.collision,
			types.hittrigger,
			types.destroy,
			types.mousedownLB,
			types.mousedownRB,
			types.mousedown,
			types.mouseupLB,
			types.mouseupRB,
			types.mouseup,
			types.mousemove,
			types.mouseenter,
			types.mouseleave,
			types.click,
			types.doubleclick
		],
		skill: [types.skillcast, types.skilladd, types.skillremove],
		state: [types.stateadd, types.stateremove, types.autorun],
		equipment: [types.create, types.equipmentadd, types.equipmentremove],
		trigger: [types.autorun, types.hitactor, types.destroy],
		item: [types.itemuse],
		region: [
			types.autorun,
			types.playerenter,
			types.playerleave,
			types.actorenter,
			types.actorleave,
			types.destroy
		],
		light: [types.autorun, types.destroy],
		animation: [types.autorun, types.destroy],
		particle: [types.autorun, types.destroy],
		parallax: [types.autorun, types.destroy],
		tilemap: [types.autorun, types.destroy],
		element: [
			types.create,
			types.autorun,
			types.mousedownLB,
			types.mousedownRB,
			types.mousedown,
			types.mouseupLB,
			types.mouseupRB,
			types.mouseup,
			types.mousemove,
			types.mouseenter,
			types.mouseleave,
			types.click,
			types.doubleclick,
			types.wheel,
			types.touchstart,
			types.touchmove,
			types.touchend,
			types.keydown,
			types.keyup,
			types.select,
			types.deselect,
			types.focus,
			types.blur,
			types.input,
			types.end,
			types.destroy,
			types.gamepadbuttonpress,
			types.gamepadbuttonrelease,
			types.gamepadleftstickchange,
			types.gamepadrightstickchange
		],
		register_global: [
			types.autorun,
			types.keydown,
			types.keyup,
			types.mousedown,
			types.mouseup,
			types.mousemove,
			types.doubleclick,
			types.wheel,
			types.touchstart,
			types.touchmove,
			types.touchend,
			types.gamepadbuttonpress,
			types.gamepadbuttonrelease,
			types.gamepadleftstickchange,
			types.gamepadrightstickchange,
			types.equipmentgain,
			types.itemgain,
			types.moneygain,
			types.createscene,
			types.loadscene,
			types.loadsave,
			types.showtext,
			types.showchoices
		],
		register_actor: [
			types.autorun,
			types.collision,
			types.hittrigger,
			types.mousedownLB,
			types.mousedownRB,
			types.mousedown,
			types.mouseupLB,
			types.mouseupRB,
			types.mouseup,
			types.mousemove,
			types.mouseenter,
			types.mouseleave,
			types.click,
			types.doubleclick
		],
		register_element: [
			types.autorun,
			types.mousedownLB,
			types.mousedownRB,
			types.mousedown,
			types.mouseupLB,
			types.mouseupRB,
			types.mouseup,
			types.mousemove,
			types.mouseenter,
			types.mouseleave,
			types.click,
			types.doubleclick,
			types.wheel,
			types.touchstart,
			types.touchmove,
			types.touchend,
			types.keydown,
			types.keyup,
			types.select,
			types.deselect,
			types.focus,
			types.blur,
			types.end,
			types.destroy,
			types.gamepadbuttonpress,
			types.gamepadbuttonrelease,
			types.gamepadleftstickchange,
			types.gamepadrightstickchange
		],
		relatedElements: []
	};

	const INNER_HEIGHT = 600;
	Object.defineProperty(this.commandList, 'innerHeight', {
		configurable: true,
		value: INNER_HEIGHT
	});

	const PADDING_BOTTOM = INNER_HEIGHT - 20;
	this.commandList.style.paddingBottom = `${PADDING_BOTTOM + 10}px`;
	this.innerGutter.style.paddingBottom = `${PADDING_BOTTOM}px`;

	window.on('localize', this.windowLocalize);
	$('#event').on('close', this.windowClose);
	$('#event').on('closed', this.windowClosed);
	$('#event').on('resize', this.windowResize);
	this.list.on('pointerdown', this.listPointerdown, { capture: true });
	this.list.on('select', this.listSelect);
	this.list.on('popup', this.listPopup);
	$('#event-type').on('input', this.typeInput);
	$('#event-commands').on('change', this.commandListChange);
	this.commandList.on('update', this.commandListUpdate);
	this.commandList.on('scroll', this.commandListScroll);
	$('#event-confirm').on('click', this.confirm);
	$('#event-apply').on('click', this.apply);
};

EventEditor.openLocalEvent = function (inserting, filter, name, event, callback) {
	this.unpackOpenEvents();
	Window.open('event');
	window.on('keydown', this.windowKeydown);

	const list = this.list;
	const item = list.createLocalEventItem(inserting, filter, name, event, callback);
	list.addNodeTo(item, null);
	list.update();
	list.select(item);
	list.restoreScroll();
	list.scrollToSelection('middle');

	list.getFocus();
	return item;
};

EventEditor.openGlobalEvent = function (guid) {
	if (!Window.isWindowOpen('event')) {
		this.unpackOpenEvents();
		Window.open('event');
		window.on('keydown', this.windowKeydown);
	} else if (this.list.read()?.id === guid) {
		return;
	}

	const list = this.list;
	const item = this.getItemById(guid);
	if (item) {
		list.initialize();
		list.select(item);
		list.expandToSelection(false);
		list.update();
		list.restoreScroll();
	} else {
		const item = list.createGlobalEventItem(guid);
		list.addNodeTo(item, null);
		list.update();
		list.select(item);
		list.restoreScroll();
	}
	list.scrollToSelection('middle');

	list.getFocus();
};

EventEditor.openRelatedEvents = function (contexts) {
	const list = this.list;
	const items = [];
	this.clearRelatedEventClasses(...this.data);
	for (const context of contexts) {
		let item;
		if (context.filter === 'global') {
			const { id } = context;
			item = this.getItemById(id);
			if (!item) {
				item = list.createGlobalEventItem(id);
				TreeList.createParents([item], null);
				this.data.push(item);
			}
		} else {
			const { filter, name, event } = context;
			item = this.getItemByEvent(event);
			if (!item) {
				item = list.createLocalEventItem(false, filter, name, event, null);
				TreeList.createParents([item], null);
				this.data.push(item);
			}
		}
		items.push(item);
	}
	if (items.length !== 0) {
		list.update();
		let index = Infinity;
		for (const item of items) {
			item.element.addClass('related-event');
			index = Math.min(index, this.data.indexOf(item));
		}
		list.unselect();
		list.selectIndex(index);
		list.scrollToSelection('middle');
	}
};

EventEditor.findRelatedEvents = function (eventId) {
	const guidMap = Data.manifest.guidMap;
	const references = [];
	const find = (event) => {
		for (const command of event.commands) {
			switch (command.id) {
				case 'callEvent':
				case '!callEvent':
					if (command.params.type === 'global' && command.params.eventId === eventId) {
						return true;
					}
					break;
			}
		}
		return false;
	};
	for (const [id, event] of Object.entries<any>(Data.events)) {
		if (find(event)) {
			references.push({
				filter: 'global',
				id: id
			});
		}
	}
	for (const [id, actor] of Object.entries<any>(Data.actors)) {
		for (const event of actor.events) {
			if (find(event)) {
				references.push({
					filter: 'actor',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	for (const [id, skill] of Object.entries<any>(Data.skills)) {
		for (const event of skill.events) {
			if (find(event)) {
				references.push({
					filter: 'skill',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	for (const [id, trigger] of Object.entries<any>(Data.triggers)) {
		for (const event of trigger.events) {
			if (find(event)) {
				references.push({
					filter: 'trigger',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	for (const [id, item] of Object.entries<any>(Data.items)) {
		for (const event of item.events) {
			if (find(event)) {
				references.push({
					filter: 'item',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	for (const [id, equipment] of Object.entries<any>(Data.equipments)) {
		for (const event of equipment.events) {
			if (find(event)) {
				references.push({
					filter: 'equipment',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	for (const [id, state] of Object.entries<any>(Data.states)) {
		for (const event of state.events) {
			if (find(event)) {
				references.push({
					filter: 'state',
					name: guidMap[id]?.file.basename,
					event: event
				});
			}
		}
	}
	for (const preset of Object.values<any>(Data.scenePresets)) {
		for (const event of preset.data.events) {
			if (find(event)) {
				const rootName = guidMap[preset.sceneId]?.file.basename;
				references.push({
					filter: preset.data.class,
					name: `${rootName}.${preset.data.name}`,
					event: event
				});
			}
		}
	}
	for (const preset of Object.values<any>(Data.uiPresets)) {
		for (const event of preset.data.events) {
			if (find(event)) {
				const rootName = guidMap[preset.uiId]?.file.basename;
				references.push({
					filter: 'element',
					name: `${rootName}.${preset.data.name}`,
					event: event
				});
			}
		}
	}
	this.openRelatedEvents(references);
};

EventEditor.getAllLocalEvents = function () {
	const listMap = {};
	for (const [id, actor] of Object.entries<any>(Data.actors)) {
		if (actor.events.length !== 0) {
			listMap[id] = actor.events;
		}
	}
	for (const [id, skill] of Object.entries<any>(Data.skills)) {
		if (skill.events.length !== 0) {
			listMap[id] = skill.events;
		}
	}
	for (const [id, trigger] of Object.entries<any>(Data.triggers)) {
		if (trigger.events.length !== 0) {
			listMap[id] = trigger.events;
		}
	}
	for (const [id, item] of Object.entries<any>(Data.items)) {
		if (item.events.length !== 0) {
			listMap[id] = item.events;
		}
	}
	for (const [id, equipment] of Object.entries<any>(Data.equipments)) {
		if (equipment.events.length !== 0) {
			listMap[id] = equipment.events;
		}
	}
	for (const [id, state] of Object.entries<any>(Data.states)) {
		if (state.events.length !== 0) {
			listMap[id] = state.events;
		}
	}
	for (const [id, scene] of Object.entries<any>(Data.scenes)) {
		if (scene.events.length !== 0) {
			listMap[id] = scene.events.slice();
		}
	}
	for (const { sceneId, data } of Object.values<any>(Data.scenePresets)) {
		if (data.events.length !== 0) {
			(listMap[sceneId] ??= []).push(...data.events);
		}
	}
	for (const { uiId, data } of Object.values<any>(Data.uiPresets)) {
		if (data.events.length !== 0) {
			(listMap[uiId] ??= []).push(...data.events);
		}
	}
	return listMap;
};

EventEditor.clearAllEventClasses = function (...items) {
	for (const item of items) {
		item.element.removeClass('local-event');
		item.element.removeClass('global-event');
		item.element.removeClass('related-event');
	}
};

EventEditor.clearRelatedEventClasses = function (...items) {
	for (const item of items) {
		item.element.removeClass('related-event');
	}
};

EventEditor.save = function (item) {
	const commands = item.commands;
	commands.history.saveState();
	this.appendCommandsToCaches(commands);
	const commandsClone = Object.clone(commands);
	Object.defineProperty(commandsClone, 'symbol', {
		configurable: true,
		value: commands.symbol
	});
	return {
		type: item.type,
		enabled: item.event.enabled,
		commands: commandsClone
	};
};

EventEditor.isChanged = function () {
	for (const item of this.data) {
		if (item.changed) {
			return true;
		}
	}
	return false;
};

EventEditor.getItemById = function (id) {
	const items = this.data;
	const length = items.length;
	for (let i = 0; i < length; i++) {
		const item = items[i];
		if (item.id === id) {
			return item;
		}
	}
	return undefined;
};

EventEditor.getItemByEvent = function (event) {
	const items = this.data;
	const length = items.length;
	for (let i = 0; i < length; i++) {
		const item = items[i];
		if (item.event === event) {
			return item;
		}
	}
	return undefined;
};

EventEditor.openCommandList = function (item) {
	this.fetchCommandBuffer(item);
	$('#event-commands-fieldset').show();
	$('#event-type').show();

	const { commands, filter } = item;

	$('#event-type').loadItems(Enum.getMergedItems(this.types[filter], filter + '-event'));

	$('#event-type').createTooltip();

	const write = getElementWriter('event');
	write('commands', commands);
	write('type', item.type);
};

EventEditor.closeCommandList = function () {
	this.commandList.clear();
	$('#event-commands-fieldset').hide();
	$('#event-type').hide();
};

EventEditor.unpackOpenEvents = function () {
	const copies = [];
	const events = Editor.project.openEvents;
	let i = events.length;
	while (--i >= 0) {
		if (Data.events[events[i].id] === undefined) {
			events.splice(i, 1);
		}
	}
	for (const item of events) {
		if ('name' in item) {
			item.name = EventEditor.getGlobalEventName(item.id);
			EventEditor.list.updateItemName(item);
			copies.push(item);
		} else {
			copies.push(EventEditor.list.createGlobalEventItem(item.id));
		}
	}
	this.data = copies;
};

EventEditor.packOpenEvents = function () {
	const copies = [];
	for (const item of this.data) {
		if (item.class === 'global') {
			copies.push(item);
		}
	}
	Editor.project.openEvents = copies;
};

EventEditor.resizeGutter = function () {
	const { outerGutter, innerGutter } = this;
	const height = outerGutter.clientHeight;
	if (height !== 0) {
		const length = Math.ceil(height / 20) + 1;
		const nodes = innerGutter.childNodes;
		let i = nodes.length;
		if (i !== length) {
			if (i < length) {
				while (i < length) {
					const node = document.createElement('box') as any;
					node.addClass('event-commands-line-number');
					node.number = -1;
					innerGutter.appendChild(node);
					i++;
				}
			} else {
				while (--i >= length) {
					nodes[i].remove();
				}
			}
		}
	}
};

EventEditor.updateGutter = function (force) {
	const { commandList } = this;
	const { scrollTop } = commandList;
	const { outerGutter, innerGutter } = EventEditor;
	const start = Math.floor(scrollTop / 20) + 1;
	const end = commandList.elements.count + 1;
	if (innerGutter.start !== start || force) {
		innerGutter.start = start;
		const nodes = innerGutter.childNodes;
		const length = nodes.length;
		for (let i = 0; i < length; i++) {
			const node = nodes[i] as any;
			const number = start + i;
			if (number < end) {
				if (node.number !== number) {
					node.number = number;
					node.textContent = number.toString();
				}
			} else {
				if (node.number !== -1) {
					node.number = -1;
					node.textContent = '';
				} else {
					break;
				}
			}
		}
	}
	const tolerance = 0.0001;
	outerGutter.scrollTop = (scrollTop + tolerance) % 20;
};

EventEditor.appendCommandsToCaches = function (commands) {
	const { caches } = this;
	if (caches.append(commands) && caches.length > 50) {
		caches.shift();
	}
};

EventEditor.fetchCommandBuffer = function (item) {
	if (item.commands) return;
	const { event, id } = item;
	const commands = event.commands;
	if (!commands.symbol) {
		Object.defineProperty(commands, 'symbol', {
			configurable: true,
			value: Symbol()
		});
	}

	const symbol = commands.symbol;
	let commandsClone = this.caches.find((target) => {
		return target.symbol === symbol;
	});

	if (!commandsClone) {
		commandsClone = Object.clone(commands);
		Object.defineProperties(commandsClone, {
			symbol: {
				configurable: true,
				value: symbol
			},
			eventId: {
				configurable: true,
				value: id
			}
		});
	}

	item.commands = commandsClone;
};

EventEditor.clearCommandBuffers = function () {
	const { commandList } = this;
	for (const commands of this.caches) {
		commandList.deleteCommandBuffers(commands);
		const { stack } = commands.history;
		const { length } = stack;
		for (let i = 0; i < length; i++) {
			const { commands } = stack[i];
			commandList.deleteCommandBuffers(commands);
		}
	}
};

EventEditor.getGlobalEventName = function (id) {
	return Data.manifest.guidMap[id]?.file.basename ?? '';
};

EventEditor.windowLocalize = function () {
	const types = EventEditor.types;
	const getType = Local.createGetter('eventTypes');
	const getTip = Local.createGetter('eventTips');
	for (const item of types.all) {
		const key = item.value;
		const name = getType(key);
		const tip = getTip(key);
		if (name !== '') {
			item.name = name;
		}
		if (tip !== '') {
			item.tip = Local.parseTip(tip, name);
		}
	}
	for (const selectBox of types.relatedElements) {
		selectBox.createTooltip();
		if (selectBox.read()) {
			selectBox.update();
		}
	}
};

EventEditor.windowClose = function (event) {
	this.closing = true;
	if (this.isChanged()) {
		event.preventDefault();
		const get = Local.createGetter('confirmation');
		return Window.confirm(
			{
				message: get('closeUnsavedEvent')
			},
			[
				{
					label: get('yes'),
					click: () => {
						for (const item of this.data) {
							if (item.changed) {
								item.changed = false;
								const commands = item.commands;
								if (commands.history.restoreState()) {
									this.appendCommandsToCaches(commands);
								} else {
									this.caches.remove(commands);
									item.commands = null;
								}
							}
						}
						Window.close('event');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
	this.list.saveScroll();
	this.closing = false;
}.bind(EventEditor);

EventEditor.windowClosed = function () {
	this.clearAllEventClasses(...this.data);
	this.packOpenEvents();
	this.data = null;
	this.list.clear();
	this.commandList.clear();
	this.clearCommandBuffers();
	window.off('keydown', this.windowKeydown);
}.bind(EventEditor);

EventEditor.windowResize = function () {
	const { list, commandList } = EventEditor;
	const parent = commandList.parentNode as HTMLElement;
	const outerHeight = parent.clientHeight;
	const innerHeight = Math.max(outerHeight - 20, 0);
	Object.defineProperty(commandList, 'innerHeight', {
		configurable: true,
		value: innerHeight
	});

	const { innerGutter } = EventEditor;
	const paddingBottom = innerHeight - 20;
	commandList.style.paddingBottom = `${paddingBottom + 10}px`;
	innerGutter.style.paddingBottom = `${paddingBottom}px`;

	list.resize();
	commandList.resize();

	// 会触发BUG: 插入指令resize刷新时增加scrollTop 重置scrollTop可以避免这个现象 由于scroll是异步事件因此不会重复触发
	const st = commandList.scrollTop;
	commandList.scrollTop = 0;
	commandList.scrollTop = st;

	EventEditor.resizeGutter();
	EventEditor.updateGutter(true);
};

EventEditor.windowKeydown = function (event) {
	if (event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'KeyW':
				if (Window.getTopWindow()?.id === 'event') {
					EventEditor.list.close();
				}
				break;
		}
	}
	if (event.altKey) {
		switch (event.code) {
			case 'AltLeft':
				if (Window.getTopWindow()?.id === 'event') {
					EventEditor.list.addClass('alt');
					EventEditor.commandList.addClass('alt');
					window.on('keyup', EventEditor.windowKeyup);
					window.on('pointermove', EventEditor.windowPointermove);
				}
				break;
		}
	}
};

EventEditor.windowKeyup = function (event) {
	if (!event.altKey) {
		switch (event.code) {
			case 'AltLeft':
				EventEditor.list.removeClass('alt');
				EventEditor.commandList.removeClass('alt');
				window.off('keyup', EventEditor.windowKeyup);
				window.off('pointermove', EventEditor.windowPointermove);
				break;
		}
	}
};

EventEditor.windowPointermove = function (event) {
	if (!event.altKey) {
		EventEditor.list.removeClass('alt');
		EventEditor.commandList.removeClass('alt');
		window.off('keyup', EventEditor.windowKeyup);
		window.off('pointermove', EventEditor.windowPointermove);
	}
};

EventEditor.listPointerdown = function (event) {
	if (event.altKey && event.button === 0) {
		const element = event.target;
		if (element.tagName === 'NODE-ITEM') {
			const item = element.item;
			if (item.id) {
				// 阻止focus后快捷键不被禁用的情况
				event.preventDefault();
				event.stopImmediatePropagation();
				EventEditor.findRelatedEvents(item.id);
			}
		}
	}
};

EventEditor.listSelect = function (event) {
	const item = event.value;
	EventEditor.openCommandList(item);
	if (item.element instanceof HTMLElement) {
		item.element.removeClass('related-event');
	}
};

EventEditor.listPopup = function (event) {
	const item = event.value;
	const selected = !!item;
	const get = Local.createGetter('menuEventList');
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			{
				label: get('close'),
				accelerator: ctrl('W'),
				enabled: selected,
				click: () => {
					EventEditor.list.close(item);
				}
			},
			{
				label: get('close-below'),
				enabled: selected,
				click: () => {
					EventEditor.list.closeBelow(item);
				}
			},
			{
				label: get('close-others'),
				enabled: selected,
				click: () => {
					EventEditor.list.closeOthers(item);
				}
			},
			{
				label: get('close-all'),
				enabled: selected,
				click: () => {
					EventEditor.list.closeAll();
				}
			},
			{
				label: get('find-related-events'),
				accelerator: 'Alt+LB',
				enabled: selected && item.id !== '',
				click: () => {
					EventEditor.findRelatedEvents(item.id);
				}
			}
		]
	);
};

EventEditor.typeInput = function (event) {
	const item = EventEditor.list.read();
	if (!item.changed) {
		item.changed = true;
		item.name += '*';
	}
	item.type = event.value;
	EventEditor.list.updateItemName(item);
};

EventEditor.commandListChange = function () {
	if (EventEditor.closing) return;
	const item = EventEditor.list.read();
	if (!item.changed) {
		item.changed = true;
		item.name += '*';
		EventEditor.list.updateItemName(item);
	}
};

EventEditor.commandListUpdate = function () {
	EventEditor.resizeGutter();
	EventEditor.updateGutter(true);
};

EventEditor.commandListScroll = function () {
	EventEditor.updateGutter(false);
};

EventEditor.confirm = function () {
	this.apply();
	Window.close('event');
}.bind(EventEditor);

EventEditor.apply = function () {
	for (const item of this.data) {
		switch (item.class) {
			case 'global':
				if (item.changed) {
					item.changed = false;
					File.planToSave(item.meta);
					const event = item.event;
					const save = EventEditor.save(item);
					if (event.type !== save.type) {
						event.type = save.type;
						if (Inspector.fileEvent.target === event) {
							Inspector.fileEvent.write({ type: event.type });
						}
					}
					event.commands = save.commands;
				}
				break;
			case 'local':
				if (item.changed || item.inserting) {
					item.changed = false;
					item.inserting = false;
					if (item.callback) {
						item.callback();
					} else {
						const save = EventEditor.save(item);
						item.event.type = save.type;
						item.event.commands = save.commands;
					}
				}
				break;
		}
	}
}.bind(EventEditor);

EventEditor.list.selectIndex = function (index) {
	const elements = this.elements;
	const last = elements.count - 1;
	const element = elements[Math.min(index, last)];
	if (element instanceof HTMLElement) {
		this.select(element.item);
	}
};

EventEditor.list.close = function (item) {
	if (item === undefined) {
		item = this.read();
	}
	if (item) {
		const close = () => {
			const index = this.data.indexOf(item);
			EventEditor.clearAllEventClasses(item);
			this.deleteNode(item);
			EventEditor.closeCommandList();
			this.selectIndex(index);
		};
		if (item.changed) {
			const get = Local.createGetter('confirmation');
			return Window.confirm(
				{
					message: get('closeUnsavedEvent')
				},
				[
					{
						label: get('yes'),
						click: close
					},
					{
						label: get('no')
					}
				]
			);
		}
		close();
	}
};

EventEditor.list.closeMultiple = function (items, callback) {
	if (items.length === 0) return;
	const closeMultiple = () => {
		for (const item of items) {
			EventEditor.clearAllEventClasses(item);
			this.deleteNode(item);
		}
		callback?.();
	};
	for (const item of items) {
		if (item.changed) {
			const get = Local.createGetter('confirmation');
			return Window.confirm(
				{
					message: get('closeUnsavedEvent')
				},
				[
					{
						label: get('yes'),
						click: closeMultiple
					},
					{
						label: get('no')
					}
				]
			);
		}
	}
	closeMultiple();
};

EventEditor.list.closeBelow = function (item) {
	const index = this.data.indexOf(item);
	this.closeMultiple(this.data.slice(index + 1));
};

EventEditor.list.closeOthers = function (item) {
	const items = this.data.slice();
	items.remove(item);
	this.closeMultiple(items);
};

EventEditor.list.closeAll = function () {
	const callback = () => EventEditor.closeCommandList();
	this.closeMultiple(this.data.slice(), callback);
};

EventEditor.list.saveScroll = function () {
	this.lastScrollTop = this.scrollTop;
};

EventEditor.list.restoreScroll = function () {
	this.scrollTop = this.lastScrollTop;
};

EventEditor.list.defineProperties = function (item) {
	return Object.defineProperties(item, {
		name: {
			writable: true,
			value: ''
		},
		class: {
			writable: true,
			value: ''
		},
		type: {
			writable: true,
			value: ''
		},
		commands: {
			writable: true,
			value: null
		},
		filter: {
			writable: true,
			value: ''
		},
		meta: {
			writable: true,
			value: null
		},
		event: {
			writable: true,
			value: null
		},
		callback: {
			writable: true,
			value: null
		},
		changed: {
			writable: true,
			value: false
		},
		inserting: {
			writable: true,
			value: false
		}
	});
};

EventEditor.list.createLocalEventItem = function (inserting, filter, name, event, callback) {
	const item = EventEditor.list.defineProperties({ id: '' });
	item.name = name;
	item.class = 'local';
	item.filter = filter;
	item.type = event.type;
	item.event = event;
	item.callback = callback;
	item.inserting = inserting;
	item.changed = false;
	return item;
};

EventEditor.list.createGlobalEventItem = function (guid) {
	const item = EventEditor.list.defineProperties({ id: guid });
	const event = Data.events[guid];
	item.name = EventEditor.getGlobalEventName(guid);
	item.class = 'global';
	item.filter = 'global';
	item.type = event.type;
	item.meta = Data.manifest.guidMap[guid];
	item.event = Data.events[guid];
	item.callback = null;
	item.changed = false;
	return item;
};

EventEditor.list.updateItemClass = function (item) {
	const { element } = item;
	element.addClass('event-open-item');
	if (item.filter === 'global') {
		element.addClass('global-event');
	} else {
		element.addClass('local-event');
	}
};

EventEditor.list.createIcon = function () {
	const closeButton = document.createElement('text');
	closeButton.textContent = '×';
	closeButton.addClass('event-close-button');
	closeButton.on('click', EventEditor.list.closeButtonClick);
	return closeButton;
};

EventEditor.list.createInitText = function (item) {
	const { element } = item;
	const initText = document.createElement('text');
	initText.addClass('event-init-text');
	element.appendChild(initText);
	element.initText = initText;
	element.attrValue = '';
};

EventEditor.list.updateInitText = function (item) {
	const { element } = item;
	if (element.initText !== undefined) {
		let typeName = '';
		if (item.type !== 'common') {
			typeName =
				' : ' +
				Command.removeTextTags(Command.parseEventType(item.filter + '-event', item.type));
		}
		if (element.attrValue !== typeName) {
			element.attrValue = typeName;
			element.initText.textContent = typeName;
		}
	}
};

EventEditor.list.updateItemName = function (item) {
	TreeList.prototype.updateItemName.call(this, item);
	this.updateInitText(item);
};

EventEditor.list.closeButtonClick = function (event) {
	EventEditor.list.close((event.target as any).parentNode.item);
};
