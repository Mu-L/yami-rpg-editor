import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { Menu } from '@/components/menu-list.ts';
import { Data } from '@/data/data-object.ts';
import { Local } from '@/tools/localization.ts';

export const Reference = {
	keydownMap: new Map(),
	keyupMap: new Map(),
	pointerdownMap: new Map(),
	pointermoveMap: new Map(),
	initialize: null,
	findAllGuids: null,
	filterUselessComments: null,
	findRelated: null,
	openRelated: null,
	findInvalid: null,
	openInvalid: null,
	findUnused: null,
	openUnused: null,
	openList: null,
	update: null,
	windowClosed: null,
	listSelect: null,
	listPopup: null,
	getKeydownListener: null,
	getKeyupListener: null,
	getPointerdownListener: null,
	getPointermoveListener: null
};

Reference.initialize = function () {
	$('#reference').on('closed', this.windowClosed);
	$('#reference-list').on('popup', this.listPopup);
};

Reference.findAllGuids = function (targetGuid = '') {
	const usedMap = {};
	const innerMap = {};
	const outerMap = {};
	const guidInText = /<(?:ref|image|global|global:):([0-9a-f]{16})>/g;
	const guidInJSON = /"([0-9a-f]{16})\\?"|<(?:ref|image|global|global:):([0-9a-f]{16})>/g;
	const guidInScript = /"[0-9a-f]{16}"|'[0-9a-f]{16}'/g;
	const guidMap = Data.manifest.guidMap;
	const { scenePresets, uiPresets } = Data;
	const get = Local.createGetter('reference');
	let fileId = '';
	let order = 0;
	const resetFileId = () => {
		fileId = '';
	};
	const pushComment = (comment) => {
		comment = '******************** ' + comment + ' ********************';
		usedMap['@' + order] = {
			type: 'comment',
			text: comment,
			order: order
		};
		outerMap['@' + (order + 1)] = {
			type: 'comment',
			text: comment
		};
		order += 2;
	};
	let pushToUsedMap = (path, guid) => {
		if (guid) {
			const text = `${path} : #${guid}`;
			const usedList = (usedMap[guid] ??= []);
			let existing = false;
			for (const item of usedList) {
				if (item.text === text) {
					item.count++;
					existing = true;
					break;
				}
			}
			if (!existing) {
				usedList.append({
					type: 'path',
					id: fileId,
					text: text,
					order: order++,
					count: 1
				});
			}
			if (guid in scenePresets) {
				const id = scenePresets[guid].sceneId;
				if (usedMap[id] === undefined) {
					usedMap[id] = [];
				}
			}
			if (guid in uiPresets) {
				const id = uiPresets[guid].uiId;
				if (usedMap[id] === undefined) {
					usedMap[id] = [];
				}
			}
		}
	};
	const pushToUsedMap2 = (path, name, guid) => {
		if (guid) pushToUsedMap(`${path}/${name}`, guid);
	};
	let pushToInnerMap = (path, guid) => {
		if (guid) innerMap[guid] = true;
	};
	let pushToOuterMap = (path, guid, fileGuid?) => {
		if (guid)
			outerMap[guid] = {
				type: 'path',
				id: fileGuid ?? guid,
				text: path
			};
	};
	if (targetGuid) {
		const _pushToUsedMap = pushToUsedMap;
		pushToUsedMap = (path, guid) => {
			if (guid === targetGuid) {
				_pushToUsedMap(path, guid);
			}
		};
		pushToInnerMap = Function.empty;
		pushToOuterMap = Function.empty;
	}
	const getPathOfGuid = (guid) => {
		fileId = guid;
		return guidMap[guid]?.file.aliasPath ?? 'unknown-path';
	};
	const searchLocalEvents = (events, dir) => {
		for (const event of events) {
			const path = `${dir}/events/${event.type}`;
			const json = JSON.stringify(event);
			let match;
			while ((match = guidInJSON.exec(json))) {
				pushToUsedMap(path, match[1] ?? match[2]);
			}
		}
	};
	const searchLocalScripts = (scripts, dir) => {
		for (const script of scripts) {
			const path = `${dir}/scripts/${script.id}`;
			const json = JSON.stringify(script);
			let match;
			while ((match = guidInJSON.exec(json))) {
				pushToUsedMap(path, match[1] ?? match[2]);
			}
		}
	};
	const searchText = (text, dir, name) => {
		let match;
		while ((match = guidInText.exec(text))) {
			pushToUsedMap2(dir, name, match[1]);
		}
	};
	const searchList = (dataList, dir, name) => {
		if (dataList.length === 0) return;
		const json = JSON.stringify(dataList);
		let match;
		while ((match = guidInJSON.exec(json))) {
			pushToUsedMap2(dir, name, match[1] ?? match[2]);
		}
	};
	const searchData = (data, dir, name) => {
		const json = JSON.stringify(data);
		let match;
		while ((match = guidInJSON.exec(json))) {
			pushToUsedMap2(dir, name, match[1] ?? match[2]);
		}
	};
	const searchEvents = () => {
		pushComment(get('event'));
		for (const event of Object.values<any>(Data.events)) {
			const path = getPathOfGuid(event.guid);
			if (event.type === 'common') {
				pushToOuterMap(path, event.guid);
			} else {
				pushToInnerMap(path, event.guid);
			}
			const json = JSON.stringify(event);
			let match;
			while ((match = guidInJSON.exec(json))) {
				pushToUsedMap(path, match[1] ?? match[2]);
			}
		}
	};
	const searchUIs = () => {
		pushComment(get('ui'));
		const searchUIElements = (nodes, dir) => {
			for (const node of nodes) {
				const path = `${dir}/${node.name}`;
				pushToInnerMap(path, node.presetId);
				switch (node.class) {
					case 'text':
					case 'dialogbox':
						break;
					case 'image':
					case 'progressbar':
						pushToUsedMap2(path, 'image', node.image);
						break;
					case 'button':
						searchText(node.content, path, 'content');
						pushToUsedMap2(path, 'normalImage', node.normalImage);
						pushToUsedMap2(path, 'hoverImage', node.hoverImage);
						pushToUsedMap2(path, 'activeImage', node.activeImage);
						pushToUsedMap2(path, 'hoverSound', node.hoverSound);
						pushToUsedMap2(path, 'clickSound', node.clickSound);
						break;
					case 'animation':
						pushToUsedMap2(path, 'animation', node.animation);
						pushToUsedMap2(path, 'motion', node.motion);
						break;
					case 'video':
						pushToUsedMap2(path, 'video', node.video);
						break;
					case 'reference':
						pushToUsedMap2(path, 'prefabId', node.prefabId);
						break;
				}
				searchLocalEvents(node.events, path);
				searchLocalScripts(node.scripts, path);
				searchUIElements(node.children, path);
			}
		};
		for (const ui of Object.values<any>(Data.ui)) {
			const path = getPathOfGuid(ui.guid);
			pushToOuterMap(path, ui.guid);
			searchUIElements(ui.nodes, path);
		}
	};
	const searchScenes = () => {
		pushComment(get('scene'));
		const searchSceneObjects = (nodes, dir) => {
			for (const node of nodes) {
				const path = `${dir}/${node.name}`;
				switch (node.class) {
					case 'folder':
						searchSceneObjects(node.children, path);
						continue;
					case 'actor':
						pushToUsedMap2(path, 'actorId', node.actorId);
						pushToUsedMap2(path, 'teamId', node.teamId);
						break;
					case 'light':
						pushToUsedMap2(path, 'mask', node.mask);
						break;
					case 'animation':
						pushToUsedMap2(path, 'animationId', node.animationId);
						pushToUsedMap2(path, 'motion', node.motion);
						break;
					case 'particle':
						pushToUsedMap2(path, 'particleId', node.particleId);
						break;
					case 'parallax':
						pushToUsedMap2(path, 'image', node.image);
						break;
					case 'tilemap':
						searchData(node.tilesetMap, path, 'tilesetMap');
						break;
				}
				pushToInnerMap(path, node.presetId);
				searchList(node.conditions, path, 'conditions');
				searchLocalEvents(node.events, path);
				searchLocalScripts(node.scripts, path);
			}
		};
		for (const scene of Object.values<any>(Data.scenes)) {
			const path = getPathOfGuid(scene.guid);
			pushToOuterMap(path, scene.guid);
			searchLocalEvents(scene.events, path);
			searchLocalScripts(scene.scripts, path);
			searchSceneObjects(scene.objects, path);
		}
	};
	const searchActors = () => {
		pushComment(get('actor'));
		for (const actor of Object.values<any>(Data.actors)) {
			const path = getPathOfGuid(actor.guid);
			pushToOuterMap(path, actor.guid);
			pushToUsedMap2(path, 'portrait', actor.portrait);
			pushToUsedMap2(path, 'animationId', actor.animationId);
			pushToUsedMap2(path, 'idleMotion', actor.idleMotion);
			pushToUsedMap2(path, 'moveMotion', actor.moveMotion);
			pushToUsedMap2(path, 'inherit', actor.inherit);
			searchList(actor.sprites, path, 'sprites');
			searchList(actor.attributes, path, 'attributes');
			searchList(actor.skills, path, 'skills');
			searchList(actor.equipments, path, 'equipments');
			searchList(actor.inventory, path, 'inventory');
			searchLocalEvents(actor.events, path);
			searchLocalScripts(actor.scripts, path);
		}
	};
	const searchSkills = () => {
		pushComment(get('skill'));
		for (const skill of Object.values<any>(Data.skills)) {
			const path = getPathOfGuid(skill.guid);
			pushToOuterMap(path, skill.guid);
			pushToUsedMap2(path, 'inherit', skill.inherit);
			searchList(skill.attributes, path, 'attributes');
			searchLocalEvents(skill.events, path);
			searchLocalScripts(skill.scripts, path);
		}
	};
	const searchTriggers = () => {
		pushComment(get('trigger'));
		for (const trigger of Object.values<any>(Data.triggers)) {
			const path = getPathOfGuid(trigger.guid);
			pushToOuterMap(path, trigger.guid);
			pushToUsedMap2(path, 'inherit', trigger.inherit);
			pushToUsedMap2(path, 'animationId', trigger.animationId);
			pushToUsedMap2(path, 'motion', trigger.motion);
			searchLocalEvents(trigger.events, path);
			searchLocalScripts(trigger.scripts, path);
		}
	};
	const searchItems = () => {
		pushComment(get('item'));
		for (const item of Object.values<any>(Data.items)) {
			const path = getPathOfGuid(item.guid);
			pushToOuterMap(path, item.guid);
			pushToUsedMap2(path, 'inherit', item.inherit);
			searchList(item.attributes, path, 'attributes');
			searchLocalEvents(item.events, path);
			searchLocalScripts(item.scripts, path);
		}
	};
	const searchEquipments = () => {
		pushComment(get('equipment'));
		for (const equipment of Object.values<any>(Data.equipments)) {
			const path = getPathOfGuid(equipment.guid);
			pushToOuterMap(path, equipment.guid);
			pushToUsedMap2(path, 'inherit', equipment.inherit);
			searchList(equipment.attributes, path, 'attributes');
			searchLocalEvents(equipment.events, path);
			searchLocalScripts(equipment.scripts, path);
		}
	};
	const searchStates = () => {
		pushComment(get('state'));
		for (const state of Object.values<any>(Data.states)) {
			const path = getPathOfGuid(state.guid);
			pushToOuterMap(path, state.guid);
			pushToUsedMap2(path, 'inherit', state.inherit);
			searchList(state.attributes, path, 'attributes');
			searchLocalEvents(state.events, path);
			searchLocalScripts(state.scripts, path);
		}
	};
	const searchAnimations = () => {
		pushComment(get('animation'));
		const animations = Object.values<any>(Data.animations);
		for (const animation of animations) {
			const path = getPathOfGuid(animation.guid);
			pushToOuterMap(path, animation.guid);
		}
		pushComment(get('motion'));
		for (const animation of animations) {
			const { motions } = animation;
			const path = getPathOfGuid(animation.guid);
			for (let i = 0; i < motions.length; i++) {
				const path2 = `${path}/motions/${i}`;
				const motion = motions[i];
				const json = JSON.stringify(motion);
				let match;
				while ((match = guidInJSON.exec(json))) {
					pushToUsedMap(path2, match[1] ?? match[2]);
				}
			}
		}
		pushComment(get('sprite'));
		for (const animation of animations) {
			const { sprites } = animation;
			const path = getPathOfGuid(animation.guid);
			for (let i = 0; i < sprites.length; i++) {
				const sprite = sprites[i];
				const path2 = `${path}/sprites/${i}:${sprite.name}`;
				pushToOuterMap(path2, sprite.id, animation.guid);
				pushToUsedMap(path2, sprite.image);
			}
		}
	};
	const searchParticles = () => {
		pushComment(get('particle'));
		for (const particle of Object.values<any>(Data.particles)) {
			const path = getPathOfGuid(particle.guid);
			pushToOuterMap(path, particle.guid);
			const { layers } = particle;
			for (let i = 0; i < layers.length; i++) {
				const path2 = `${path}/layers/${i}`;
				const motion = layers[i];
				const json = JSON.stringify(motion);
				let match;
				while ((match = guidInJSON.exec(json))) {
					pushToUsedMap(path2, match[1] ?? match[2]);
				}
			}
		}
	};
	const searchTilesets = () => {
		pushComment(get('tileset'));
		const ignoreMap = {};
		for (const template of Data.autotiles) {
			ignoreMap[template.id] = true;
		}
		for (const tileset of Object.values<any>(Data.tilesets)) {
			const path = getPathOfGuid(tileset.guid);
			pushToOuterMap(path, tileset.guid);
			const json = JSON.stringify(tileset);
			let match;
			while ((match = guidInJSON.exec(json))) {
				const guid = match[1] ?? match[2];
				if (!ignoreMap[guid]) {
					pushToUsedMap(path, guid);
				}
			}
		}
	};
	const searchVariables = () => {
		resetFileId();
		pushComment(get('variable'));
		const dir = 'Data/variables.json';
		const searchItems = (items, dir) => {
			for (const item of items) {
				const path = `${dir}/${item.name}`;
				if (item.class === 'folder') {
					searchItems(item.children, path);
					continue;
				}
				pushToOuterMap(path, item.id);
				const text = item.name + ',' + item.value + ',' + item.note;
				let match;
				while ((match = guidInText.exec(text))) {
					pushToUsedMap(path, match[1]);
				}
			}
		};
		searchItems(Data.variables, dir);
	};
	const searchAttributes = () => {
		resetFileId();
		pushComment(get('attribute'));
		const dir = 'Data/attribute.json';
		const searchItems = (items, dir) => {
			for (const item of items) {
				const path = `${dir}/${item.name}`;
				if (item.class === 'folder') {
					pushToInnerMap(path, item.id);
					searchItems(item.children, path);
					continue;
				}
				pushToOuterMap(path, item.id);
				pushToUsedMap2(path, 'enum', item.enum);
				const text = item.name + ',' + item.key + ',' + item.note;
				let match;
				while ((match = guidInText.exec(text))) {
					pushToUsedMap(path, match[1]);
				}
			}
		};
		searchItems(Data.attribute.keys, dir);
	};
	const searchEnumerations = () => {
		resetFileId();
		pushComment(get('enumeration'));
		const dir = 'Data/enumeration.json';
		const searchItems = (items, dir) => {
			for (const item of items) {
				const path = `${dir}/${item.name}`;
				if (item.class === 'folder') {
					pushToInnerMap(path, item.id);
					searchItems(item.children, path);
					continue;
				}
				pushToOuterMap(path, item.id);
				const text = item.name + ',' + item.value + ',' + item.note;
				let match;
				while ((match = guidInText.exec(text))) {
					pushToUsedMap(path, match[1]);
				}
			}
		};
		searchItems(Data.enumeration.strings, dir);
	};
	const searchLocalization = () => {
		resetFileId();
		pushComment(get('localization'));
		const dir = 'Data/localization.json';
		const searchItems = (items, dir) => {
			for (const item of items) {
				const path = `${dir}/${item.name}`;
				if (item.class === 'folder') {
					searchItems(item.children, path);
					continue;
				}
				pushToOuterMap(path, item.id);
				const json = JSON.stringify(item.contents);
				let match;
				while ((match = guidInJSON.exec(json))) {
					pushToUsedMap(path, match[1] ?? match[2]);
				}
			}
		};
		searchItems(Data.localization.list, dir);
	};
	const searchPlugins = () => {
		resetFileId();
		pushComment(get('plugin'));
		const dir = 'Data/plugins.json';
		const plugins = Data.plugins;
		for (let i = 0; i < plugins.length; i++) {
			const plugin = plugins[i];
			const json = JSON.stringify(plugin);
			const path = `${dir}/${i}`;
			getPathOfGuid(plugin.id);
			let match;
			while ((match = guidInJSON.exec(json))) {
				pushToUsedMap(path, match[1] ?? match[2]);
			}
		}
	};
	const searchCommands = () => {
		resetFileId();
		pushComment(get('command'));
		const dir = 'Data/commands.json';
		const commands = Data.commands;
		for (let i = 0; i < commands.length; i++) {
			const command = commands[i];
			const path = `${dir}/${i}`;
			pushToUsedMap(path, command.id);
		}
	};
	const searchScripts = () => {
		pushComment(get('script'));
		for (const script of Object.values<any>(Data.scripts)) {
			const path = getPathOfGuid(script.guid);
			pushToOuterMap(path, script.guid);
			if (script.guid in usedMap) {
				const code = script.code;
				let match;
				while ((match = guidInScript.exec(code))) {
					pushToUsedMap(path, match[0].slice(1, -1));
				}
			}
		}
	};
	const searchConfig = () => {
		resetFileId();
		pushComment(get('config'));
		const path = 'Data/config.json';
		const copy = Object.clone(Data.config);
		pushToUsedMap2(path, 'startPosition.sceneId', copy.startPosition.sceneId);
		delete copy.gameId;
		delete copy.save;
		delete copy.startPosition;
		const json = JSON.stringify(copy);
		let match;
		while ((match = guidInJSON.exec(json))) {
			pushToUsedMap(path, match[1] ?? match[2]);
		}
	};
	const searchEasings = () => {
		resetFileId();
		const dir = 'Data/easings.json';
		const easings = Data.easings;
		for (let i = 0; i < easings.length; i++) {
			const easing = easings[i];
			const path = `${dir}/${i}`;
			pushToInnerMap(path, easing.id);
		}
	};
	const searchTeams = () => {
		resetFileId();
		const dir = 'Data/teams.json';
		const teams = Data.teams.list;
		for (let i = 0; i < teams.length; i++) {
			const team = teams[i];
			const path = `${dir}/${i}`;
			pushToInnerMap(path, team.id);
		}
	};
	const searchOtherFiles = () => {
		resetFileId();
		const { images, audio, videos, fonts, others } = Data.manifest;
		pushComment(get('image'));
		for (const meta of images) {
			pushToOuterMap(meta.file.aliasPath, meta.guid);
		}
		pushComment(get('audio'));
		for (const meta of audio) {
			pushToOuterMap(meta.file.aliasPath, meta.guid);
		}
		pushComment(get('video'));
		for (const meta of videos) {
			pushToOuterMap(meta.file.aliasPath, meta.guid);
		}
		pushComment(get('font'));
		for (const meta of fonts) {
			pushToOuterMap(meta.file.aliasPath, meta.guid);
		}
		pushComment(get('other'));
		for (const meta of others) {
			pushToOuterMap(meta.file.aliasPath, meta.guid);
		}
	};
	searchEvents();
	searchUIs();
	searchScenes();
	searchActors();
	searchSkills();
	searchTriggers();
	searchItems();
	searchEquipments();
	searchStates();
	searchAnimations();
	searchParticles();
	searchTilesets();
	searchVariables();
	searchAttributes();
	searchEnumerations();
	searchLocalization();
	searchPlugins();
	searchCommands();
	searchScripts();
	searchConfig();
	searchEasings();
	searchTeams();
	searchOtherFiles();
	return { usedMap, innerMap, outerMap };
};

Reference.filterUselessComments = function (items) {
	const list = [];
	const length = items.length;
	for (let i = 0; i < length; i++) {
		if (items[i].type !== 'comment' || items[i + 1]?.type === 'path') {
			list.push(items[i]);
		}
	}
	return list;
};

Reference.findRelated = function (guid) {
	const items = [];
	const { usedMap } = this.findAllGuids(guid);
	for (const key of Object.keys(usedMap)) {
		const content = usedMap[key];
		if (Array.isArray(content)) {
			items.push(...content);
		} else {
			items.push(content);
		}
	}
	items.sort((a, b) => a.order - b.order);
	const filtered = Reference.filterUselessComments(items);
	filtered.isEmpty = filtered.length === 0;
	if (filtered.isEmpty) {
		filtered.push({
			type: 'comment',
			text: Local.get('reference.no-related-found')
		});
	}
	return filtered;
};

Reference.openRelated = function (guid) {
	Window.open('reference');
	this.openList(this.findRelated(guid));
};

Reference.findInvalid = function () {
	const items = [];
	const { usedMap, innerMap, outerMap } = this.findAllGuids();
	const validMap = Object.setPrototypeOf(outerMap, innerMap);
	for (const key of Object.keys(usedMap)) {
		if (validMap[key] === undefined) {
			const content = usedMap[key];
			if (Array.isArray(content)) {
				items.push(...content);
			} else {
				items.push(content);
			}
		}
	}
	items.sort((a, b) => a.order - b.order);
	const filtered = Reference.filterUselessComments(items);
	filtered.isEmpty = filtered.length === 0;
	if (filtered.isEmpty) {
		filtered.push({
			type: 'comment',
			text: Local.get('reference.no-invalid-found')
		});
	}
	return filtered;
};

Reference.openInvalid = function (guid) {
	Window.open('reference');
	this.openList(this.findInvalid(guid));
};

Reference.findUnused = function () {
	const items = [];
	const { usedMap, outerMap } = this.findAllGuids();
	for (const key of Object.keys(outerMap)) {
		if (usedMap[key] === undefined) {
			items.push(outerMap[key]);
		}
	}
	const filtered = Reference.filterUselessComments(items);
	filtered.isEmpty = filtered.length === 0;
	if (filtered.isEmpty) {
		filtered.push({
			type: 'comment',
			text: Local.get('reference.no-unused-found')
		});
	}
	return filtered;
};

Reference.openUnused = function (guid) {
	Window.open('reference');
	this.openList(this.findUnused(guid));
};

Reference.openList = function (items) {
	Window.open('reference');
	Reference.update(items);
};

Reference.update = function (items) {
	const list = $('#reference-list').reload();
	for (const item of items) {
		const li = document.createElement('common-item');
		li.dataValue = item;
		li.textContent = item.text;
		if (item.type === 'comment') {
			li.addClass('reference-comment');
		}
		if ('count' in item && item.count > 1) {
			const counter = document.createElement('text');
			counter.addClass('reference-count');
			counter.textContent = item.count.toString();
			li.appendChild(counter);
		}
		list.appendElement(li);
	}
	list.update();
};

Reference.windowClosed = function (event) {
	$('#reference-list').clear();
};

Reference.listPopup = function (event) {
	const item = event.value;
	if (item?.id) {
		Menu.popup(
			{
				x: event.clientX,
				y: event.clientY
			},
			[
				{
					label: `ID: ${item.id}`,
					style: 'id',
					click: () => {
						navigator.clipboard.writeText(item.id);
					}
				}
			]
		);
	}
};

Reference.getKeydownListener = function (list, winId = '') {
	let listener = this.keydownMap.get(list);
	if (listener === undefined) {
		listener = (event) => {
			if (event.altKey) {
				switch (event.code) {
					case 'AltLeft':
						if (winId ? Window.getTopWindow()?.id === winId : !Window.getTopWindow()) {
							list.addClass('alt');
							window.on('keyup', this.getKeyupListener(list));
							window.on('pointermove', this.getPointermoveListener(list));
						}
						break;
				}
			}
		};
	}
	return listener;
};

Reference.getKeyupListener = function (list) {
	let listener = this.keyupMap.get(list);
	if (listener === undefined) {
		listener = (event) => {
			if (!event.altKey) {
				switch (event.code) {
					case 'AltLeft':
						list.removeClass('alt');
						window.off('keyup', listener);
						window.off('pointermove', this.getPointermoveListener(list));
						break;
				}
			}
		};
	}
	return listener;
};

Reference.getPointerdownListener = function (list) {
	let listener = this.pointerdownMap.get(list);
	if (listener === undefined) {
		listener = (event) => {
			if (event.altKey && event.button === 0) {
				const element = event.target;
				if (element.tagName === 'NODE-ITEM') {
					const item = element.item;
					const guid = item.id ?? item.presetId;
					if (guid) {
						// 阻止focus后快捷键不被禁用的情况
						event.preventDefault();
						event.stopImmediatePropagation();
						Reference.openRelated(guid);
					}
				}
			}
		};
	}
	return listener;
};

Reference.getPointermoveListener = function (list) {
	let listener = this.pointermoveMap.get(list);
	if (listener === undefined) {
		listener = (event) => {
			if (!event.altKey) {
				list.removeClass('alt');
				window.off('keyup', this.getKeyupListener(list));
				window.off('pointermove', listener);
			}
		};
	}
	return listener;
};
