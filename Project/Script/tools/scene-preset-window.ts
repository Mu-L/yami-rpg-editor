import { $ } from '../util/dom.ts';
import { Data } from '../data/data-object.ts';
import { Scene } from '../scene/scene-window.ts';
import { Window } from './window-object.ts';

export const PresetObject = {
	scene: $('#presetObject-sceneId'),
	list: $('#presetObject-list'),
	searcher: $('#presetObject-searcher'),
	target: null,
	nodes: null,
	initialize: null,
	open: null,
	buildNodes: null,
	getDefaultPresetId: null,
	windowClosed: null,
	sceneIdWrite: null,
	listOpen: null,
	searcherKeydown: null,
	searcherInput: null,
	confirm: null
};

PresetObject.list.createIcon = null;

PresetObject.initialize = function () {
	this.list.bind(() => this.nodes);

	// 列表 - 重写创建图标方法
	this.list.createIcon = Scene.list.createIcon;

	this.searcher.addCloseButton();

	this.scene.on('write', this.sceneIdWrite);
	this.list.on('open', this.listOpen);
	this.searcher.on('keydown', this.searcherKeydown);
	this.searcher.on('input', this.searcherInput);
	this.searcher.on('compositionend', this.searcherInput);
	$('#presetObject').on('closed', this.windowClosed);
	$('#presetObject-confirm').on('click', this.confirm);
};

PresetObject.open = function (target) {
	this.target = target;
	Window.open('presetObject');

	const { scene, list } = this;
	const presetId = target.read() || (Scene.target?.presetId ?? '');
	const sceneId = Data.scenePresets[presetId]?.sceneId ?? Scene.meta?.guid ?? '';
	scene.write(sceneId);
	scene.getFocus();
	const item = list.getItemByProperties({ presetId });
	if (item) {
		list.select(item);
		list.expandToSelection();
		list.scrollToSelection('middle');
	}
};

// 构造简化的对象节点(避免影响对象数据)
PresetObject.buildNodes = (function IIFE() {
	const build = (nodes, className) => {
		const list = [];
		for (const node of nodes) {
			if (node.class === 'folder') {
				list.push({
					class: node.class,
					name: node.name,
					expanded: node.expanded,
					children: build(node.children, className)
				});
				continue;
			}
			if (className === 'any' || node.class === className) {
				list.push({
					class: node.class,
					name: node.name,
					presetId: node.presetId,
					teamId: node.teamId ?? '',
					color: node.color ?? '',
					red: node.red ?? 0,
					green: node.green ?? 0,
					blue: node.blue ?? 0,
					image: node.image ?? ''
				});
			}
		}
		return list;
	};
	return function (nodes, className) {
		return build(nodes, className);
	};
})();

PresetObject.getDefaultPresetId = function (className = 'any') {
	if (Scene.target && (className === 'any' || Scene.target.class === className)) {
		return Scene.target.presetId;
	}
	return '';
};

PresetObject.windowClosed = function (event) {
	PresetObject.target = null;
	PresetObject.nodes = null;
	PresetObject.searcher.write('');
	PresetObject.list.clear();
};

PresetObject.sceneIdWrite = function (event) {
	const scene = Data.scenes[event.value];
	const filter = PresetObject.target.filter;
	const nodes = scene ? PresetObject.buildNodes(scene.objects, filter) : Array.empty;
	PresetObject.nodes = nodes;
	PresetObject.list.update();
	if (nodes.length !== 0) {
		PresetObject.list.select(nodes[0]);
		PresetObject.list.scrollTop = 0;
	} else {
		PresetObject.list.unselect();
	}
};

PresetObject.listOpen = function (event) {
	PresetObject.confirm();
};

PresetObject.searcherKeydown = function (event) {
	switch (event.code) {
		case 'ArrowUp':
		case 'ArrowDown':
			event.preventDefault();
			PresetObject.list.selectRelative(event.code.slice(5).toLowerCase());
			break;
		case 'PageUp':
			PresetObject.list.pageUp(true);
			break;
		case 'PageDown':
			PresetObject.list.pageDown(true);
			break;
	}
};

PresetObject.searcherInput = function (event) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = this.input.value;
	const list = PresetObject.list;
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

PresetObject.confirm = function (event) {
	const node = this.list.read();
	const presetId = node?.presetId;
	if (!presetId) {
		return this.list.getFocus();
	}
	this.target.input(presetId);
	Window.close('presetObject');
}.bind(PresetObject);
