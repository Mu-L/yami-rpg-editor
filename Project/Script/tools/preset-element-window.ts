import { $ } from '../util/dom.ts';
import { Data } from '../data/data-object.ts';
import { Window } from './window-object.ts';
import { UI } from '../ui/ui-window.ts';

export const PresetElement = {
	ui: $('#presetElement-uiId'),
	list: $('#presetElement-list'),
	searcher: $('#presetElement-searcher'),
	target: null,
	nodes: null,
	initialize: null,
	open: null,
	buildNodes: null,
	getDefaultPresetId: null,
	windowClosed: null,
	uiIdWrite: null,
	listOpen: null,
	searcherKeydown: null,
	searcherInput: null,
	confirm: null
};

PresetElement.list.createIcon = null;

PresetElement.initialize = function () {
	this.list.bind(() => this.nodes);

	// 列表 - 重写创建图标方法
	this.list.createIcon = UI.list.createIcon;

	this.ui.on('write', this.uiIdWrite);
	this.list.on('open', this.listOpen);
	this.searcher.on('keydown', this.searcherKeydown);
	this.searcher.on('input', this.searcherInput);
	this.searcher.on('compositionend', this.searcherInput);
	$('#presetElement').on('closed', this.windowClosed);
	$('#presetElement-confirm').on('click', this.confirm);
};

PresetElement.open = function (target) {
	this.target = target;
	Window.open('presetElement');

	const { ui, list } = this;
	const presetId = target.read() || (UI.target?.presetId ?? '');
	const uiId = Data.uiPresets[presetId]?.uiId ?? UI.meta?.guid ?? '';
	ui.write(uiId);
	ui.getFocus();
	const item = list.getItemByProperties({ presetId });
	if (item) {
		list.select(item);
		list.expandToSelection();
		list.scrollToSelection('middle');
	}
};

// 构造简化的元素节点(避免影响元素数据)
PresetElement.buildNodes = (function IIFE() {
	const build = (nodes) => {
		const length = nodes.length;
		const list = new Array(length);
		for (let i = 0; i < length; i++) {
			const node = nodes[i];
			list[i] = {
				class: node.class,
				name: node.name,
				expanded: node.expanded,
				presetId: node.presetId,
				children: build(node.children)
			};
		}
		return list;
	};
	return function (nodes) {
		return build(nodes);
	};
})();

PresetElement.getDefaultPresetId = function () {
	return UI.target?.presetId ?? '';
};

PresetElement.windowClosed = function (event) {
	PresetElement.target = null;
	PresetElement.nodes = null;
	PresetElement.list.clear();
};

PresetElement.uiIdWrite = function (event) {
	const ui = Data.ui[event.value];
	const nodes = ui ? PresetElement.buildNodes(ui.nodes) : Array.empty;
	PresetElement.nodes = nodes;
	PresetElement.list.update();
	if (nodes.length !== 0) {
		PresetElement.list.select(nodes[0]);
		PresetElement.list.scrollTop = 0;
	} else {
		PresetElement.list.unselect();
	}
};

PresetElement.listOpen = function (event) {
	PresetElement.confirm();
};

PresetElement.searcherKeydown = function (event) {
	switch (event.code) {
		case 'ArrowUp':
		case 'ArrowDown':
			event.preventDefault();
			PresetElement.list.selectRelative(event.code.slice(5).toLowerCase());
			break;
		case 'PageUp':
			PresetElement.list.pageUp(true);
			break;
		case 'PageDown':
			PresetElement.list.pageDown(true);
			break;
	}
};

PresetElement.searcherInput = function (event) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = this.input.value;
	const list = PresetElement.list;
	list.searchNodes(text);
	const elements = list.elements;
	for (let i = 0; i < elements.count; i++) {
		const { item } = elements[i];
		if (item.class !== 'folder') {
			list.select(item);
			break;
		}
	}
};

PresetElement.confirm = function (event) {
	const uiId = this.ui.read();
	if (!uiId) {
		return this.ui.getFocus();
	}
	const node = this.list.read();
	const presetId = node?.presetId;
	if (!presetId) {
		return this.list.getFocus();
	}
	this.target.input(presetId);
	Window.close('presetElement');
}.bind(PresetElement);
