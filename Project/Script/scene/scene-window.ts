import { $ } from '@/util/dom.ts';
import { Timer } from '@/util/timer.ts';
import { File } from '@/file/file-system-core.ts';
import { Window } from '@/tools/window-object.ts';
import { Reference } from '@/log/related-references.ts';
import { Editor } from '@/main/editor.ts';
import { GUID } from '@/file/guid.ts';
import '../components/element-methods.ts';
import { Codec } from '@/codec/codec.ts';
import { Data } from '@/data/data-object.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Layout } from '@/layout/layout.ts';
import { Palette } from '@/palette/palette.ts';
import { Particle } from '@/particle/particle-window.ts';
import { ObjectFolder } from './default-object-folder.ts';
import { SceneShift } from './move-scene.ts';
import { TilemapShortcuts } from './tilemap-shortcut-list.ts';
import { History } from '@/tools/history.ts';
import { UndoManager } from '@/tools/undo-manager.ts';
import { Matrix } from '@/webgl/matrix2.ts';
import { GL } from '@/webgl/webgl-init.ts';

type SceneState = 'closed' | 'open';

// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
type SceneMethod = ((...args: any[]) => any) | null;

// 列表运行时挂载的扩展方法（Scene.list / UI.list 共享，ui-window.ts:218-238 调用）
interface SceneListExtensions {
	// 列表基础方法（Scene.list.* 运行时挂载）
	create: ((...args: any[]) => any) | null;
	copy: ((...args: any[]) => any) | null;
	paste: ((...args: any[]) => any) | null;
	delete: ((...args: any[]) => any) | null;
	toggle: ((...args: any[]) => any) | null;
	cancelSearch: ((...args: any[]) => any) | null;
	createIcon: ((...args: any[]) => any) | null;
	updateIcon: ((...args: any[]) => any) | null;
	updateHead: ((...args: any[]) => any) | null;
	createConditionIcon: ((...args: any[]) => any) | null;
	updateConditionIcon: ((...args: any[]) => any) | null;
	createEventIcon: ((...args: any[]) => any) | null;
	updateEventIcon: ((...args: any[]) => any) | null;
	createScriptIcon: ((...args: any[]) => any) | null;
	updateScriptIcon: ((...args: any[]) => any) | null;
	createVisibilityIcon: ((...args: any[]) => any) | null;
	updateVisibilityIcon: ((...args: any[]) => any) | null;
	createLockIcon: ((...args: any[]) => any) | null;
	updateLockIcon: ((...args: any[]) => any) | null;
	restoreRecursiveStates: ((...args: any[]) => any) | null;
	setRecursiveStates: ((...args: any[]) => any) | null;
	updateItemClass: ((...args: any[]) => any) | null;
	onCreate: ((...args: any[]) => any) | null;
	onRemove: ((...args: any[]) => any) | null;
	onDelete: ((...args: any[]) => any) | null;
	onResume: ((...args: any[]) => any) | null;
	// creators/updaters 数组（运行时挂载，供 push 挂载方法）
	creators: any[];
	updaters: any[];
}

interface SceneShape {
	state: SceneState;
	page: HTMLElement;
	head: HTMLElement & { width?: number };
	body: HTMLElement & { hide(): HTMLElement; show(): HTMLElement };
	info: HTMLElement;
	screen: HTMLElement;
	// marquee 运行时挂载 .resize()/.terrain/.previewTiles/.pointerevent/.save/.switch/.select/.getTiles 等大量扩展 用 [ k: string ]: any 索引签名兜底所有运行时挂载字段，避免穷举
	marquee: HTMLElement & { resize(): void; [k: string]: any };
	// searcher 运行时挂载 .deleteInputContent/.input 等扩展（scene-list.ts:97 调用）
	searcher: HTMLElement & { [k: string]: any };
	list: HTMLElement & SceneListExtensions & { [k: string]: any };
	// editor properties（运行时挂载具体值，统一 any | null）
	[k: string]: any;
}

export const Scene: SceneShape = {
	state: 'closed',
	page: $('#scene'),
	head: $('#scene-head'),
	body: $('#scene-body').hide(),
	info: $('#scene-info'),
	screen: $('#scene-screen'),
	marquee: $('#scene-marquee'),
	searcher: $('#scene-searcher'),
	list: $('#scene-list'),
	dragging: null,
	tilemap: null,
	target: null,
	layer: null,
	brush: null,
	symbol: null,
	history: null,
	textures: null,
	shiftKey: false,
	translationKey: 0b0000,
	translationTimer: null,
	showGrid: false,
	showLight: false,
	showAnimation: false,
	animationFrame: null,
	animationElapsed: null,
	background: null,
	matrix: null,
	zoom: null,
	zoomTimer: null,
	scale: null,
	scaleX: null,
	scaleY: null,
	scaledTileWidth: null,
	scaledTileHeight: null,
	aspectRatio: null,
	outerWidth: null,
	outerHeight: null,
	scrollLeft: null,
	scrollTop: null,
	scrollRight: null,
	scrollBottom: null,
	scrollCenterX: null,
	scrollCenterY: null,
	centerOffsetX: null,
	centerOffsetY: null,
	lightLeft: null,
	lightTop: null,
	lightRight: null,
	lightBottom: null,
	padding: null,
	paddingLeft: null,
	paddingTop: null,
	patternOriginX: null,
	patternOriginY: null,
	inspectorTypeMap: null,
	tilemapLightSamplingModes: null,
	defaultLightSamplingModes: null,
	startPositionTexture: null,
	blendModeMap: null,
	activeTilemapId: null,
	sharedPoint: null,
	previewObject: null,
	context: null,
	meta: null,
	width: null,
	height: null,
	tileWidth: null,
	tileHeight: null,
	animationInterval: null,
	ambient: null,
	terrains: null,
	events: null,
	scripts: null,
	objects: null,
	tilemaps: null,
	actors: null,
	regions: null,
	lights: null,
	animations: null,
	particles: null,
	parallaxes: null,
	backgrounds: null,
	foregrounds: null,
	doodads: null,
	initialize: null,
	open: null,
	load: null,
	save: null,
	close: null,
	destroy: null,
	shiftTilemap: null,
	shiftTerrains: null,
	shiftObjects: null,
	computeObjectShifting: null,
	getDefaultObjectFolder: null,
	copy: null,
	paste: null,
	duplicate: null,
	create: null,
	delete: null,
	toggle: null,
	undo: null,
	redo: null,
	setZoom: null,
	setSize: null,
	setTileSize: null,
	setTilemapSize: null,
	setTarget: null,
	openTilemap: null,
	closeTilemap: null,
	computeActiveTilemapId: null,
	revealTarget: null,
	shiftTarget: null,
	redirectTarget: null,
	updateTarget: null,
	updateTargetInfo: null,
	updateTargetItem: null,
	updateTargetEditor: null,
	updateAnimationInterval: null,
	updateLightAreaExpansion: null,
	updateActorTeams: null,
	updateHead: null,
	resize: null,
	getTileCoords: null,
	getConvertedCoords: null,
	getParallaxAnchor: null,
	getGridContext: null,
	rasterizeScrollPosition: null,
	updateLightTexParameters: null,
	updateCamera: null,
	updateTransform: null,
	registerPreset: null,
	unregisterPreset: null,
	sortLayers: null,
	loadObjects: null,
	loadTextures: null,
	loadAllContexts: null,
	loadActorContext: null,
	loadLightContext: null,
	loadAnimationContext: null,
	loadParallaxContext: null,
	loadParticleContext: null,
	loadObjectContext: null,
	reloadObjectContext: null,
	destroyObjectContext: null,
	createPreviewObject: null,
	deletePreviewObject: null,
	updateParallaxes: null,
	drawScene: null,
	drawBackgrounds: null,
	drawForegrounds: null,
	updateAnimations: null,
	updateParticles: null,
	drawTileLayer: null,
	drawGridLayer: null,
	drawRegionLayer: null,
	drawRegionBorders: null,
	drawObjectLayer: null,
	drawDirectLightLayer: null,
	drawNameLayer: null,
	drawTerrainLayer: null,
	drawLightTextures: null,
	drawTilemap: null,
	drawTilePreview: null,
	drawTileMarquee: null,
	drawTerrainMarquee: null,
	drawTilemapWireframe: null,
	drawAnimationWireframe: null,
	drawAnimationAnchor: null,
	drawLightWireframe: null,
	drawRegionWireframe: null,
	drawParticleEmitterWireframe: null,
	drawParallaxWireframe: null,
	drawOvalWireframe: null,
	drawTargetAnchor: null,
	drawRectWireframe: null,
	drawRectWireframeOnTilemap: null,
	setRectWireframeVertices: null,
	createStartPositionTexture: null,
	drawStartPosition: null,
	selectObject: null,
	selectRegion: null,
	selectLight: null,
	selectParticleEmitter: null,
	selectSortedLayer: null,
	edit: null,
	editInPencilMode: null,
	editInRectMode: null,
	editInOvalMode: null,
	editInFillMode: null,
	setTile: null,
	setTileFrame: null,
	setTerrain: null,
	createTiles: null,
	cloneTiles: null,
	createTerrains: null,
	getNewTilesetIndex: null,
	requestAnimation: null,
	updateAnimation: null,
	stopAnimation: null,
	requestRendering: null,
	renderingFunction: null,
	stopRendering: null,
	switchLayer: null,
	switchBrush: null,
	switchGrid: null,
	switchLight: null,
	switchAnimation: null,
	switchSettings: null,
	switchTerrain: null,
	resetAnimations: null,
	updateFont: null,
	planToSave: null,
	planToSaveTerrains: null,
	beginMapRecord: null,
	closeMapRecord: null,
	saveMapRecord: null,
	recordMapData: null,
	restoreMapData: null,
	undoMapData: null,
	redoMapData: null,
	createHistory: null,
	createDefaultAnimation: null,
	getObjectFile: null,
	openFileLocation: null,
	saveToConfig: null,
	loadFromConfig: null,
	saveToProject: null,
	loadFromProject: null,
	webglRestored: null,
	windowResize: null,
	themechange: null,
	dprchange: null,
	datachange: null,
	keydown: null,
	headPointerdown: null,
	switchPointerdown: null,
	layerPointerdown: null,
	brushPointerdown: null,
	zoomFocus: null,
	zoomInput: null,
	screenKeydown: null,
	shiftKeyup: null,
	translationKeyup: null,
	screenWheel: null,
	screenUserscroll: null,
	screenBlur: null,
	screenDragenter: null,
	screenDragleave: null,
	screenDragover: null,
	screenDrop: null,
	marqueePointerdown: null,
	marqueePointermove: null,
	marqueePointerleave: null,
	marqueeDoubleclick: null,
	pointerup: null,
	pointermove: null,
	menuPopup: null,
	searcherInput: null,
	listKeydown: null,
	listPointerdown: null,
	listSelect: null,
	listRecord: null,
	listPopup: null,
	listOpen: null,
	listRename: null,
	listChange: null,
	listPageResize: null,
	Textures: null,
	Point: null
};

Scene.marquee.key = null;
Scene.marquee.offsetX = null;
Scene.marquee.offsetY = null;
Scene.marquee.tilesetMap = null;
Scene.marquee.tiles = null;
Scene.marquee.terrain = null;
Scene.marquee.previewTiles = false;
Scene.marquee.pointerevent = null;
Scene.marquee.save = null;
Scene.marquee.switch = null;
Scene.marquee.resize = null;
Scene.marquee.clear = null;
Scene.marquee.select = null;
Scene.marquee.selectInPencilMode = null;
Scene.marquee.selectInRectMode = null;
Scene.marquee.selectInCopyMode = null;
Scene.marquee.selectInObjectMode = null;
Scene.marquee.getTiles = null;

Scene.list.page = $('#scene-object');
Scene.list.head = $('#scene-list-head');
Scene.list.copy = null;
Scene.list.paste = null;
Scene.list.duplicate = null;
Scene.list.delete = null;
Scene.list.toggle = null;
Scene.list.cancelSearch = null;
Scene.list.createFolder = null;
Scene.list.createTilemapShortcutItems = null;
Scene.list.restoreRecursiveStates = null;
Scene.list.setRecursiveStates = null;
Scene.list.updateItemClass = null;
Scene.list.updateFolderState = null;
Scene.list.canSwitchState = null;
Scene.list.createIcon = null;
Scene.list.updateIcon = null;
Scene.list.updateHead = null;
Scene.list.updateTilemapClass = null;
Scene.list.createConditionIcon = null;
Scene.list.updateConditionIcon = null;
Scene.list.createEventIcon = null;
Scene.list.updateEventIcon = null;
Scene.list.createScriptIcon = null;
Scene.list.updateScriptIcon = null;
Scene.list.createVisibilityIcon = null;
Scene.list.updateVisibilityIcon = null;
Scene.list.createLockIcon = null;
Scene.list.updateLockIcon = null;
Scene.list.onCreate = null;
Scene.list.onRemove = null;
Scene.list.onDelete = null;
Scene.list.onResume = null;

Scene.initialize = function () {
	this.screen.addScrollbars();

	this.translationTimer = new Timer({
		duration: Infinity,
		update: (timer) => {
			if (this.state === 'open' && this.dragging === null) {
				const key = this.translationKey;
				const meta = this.meta;
				const step = (Timer.deltaTime * 0.04) / this.scale;
				let x = 0;
				let y = 0;
				if (key & 0b0001) {
					x -= step;
				}
				if (key & 0b0010) {
					y -= step;
				}
				if (key & 0b0100) {
					x += step;
				}
				if (key & 0b1000) {
					y += step;
				}
				const screen = this.screen;
				const sl = screen.scrollLeft;
				const st = screen.scrollTop;
				const cx = Math.roundTo(meta.x + x, 4);
				const cy = Math.roundTo(meta.y + y, 4);
				this.updateCamera(cx, cy);
				this.updateTransform();
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					this.requestRendering();
					this.marquee.resize();
					this.screen.updateScrollbars();
				}
			} else {
				return false;
			}
		}
	});

	this.zoomTimer = new Timer({
		duration: 80,
		update: (timer) => {
			if (this.state === 'open') {
				const { elapsed, duration, start, end } = timer;
				const time = elapsed / duration;
				this.scale = start * (1 - time) + end * time;
				this.resize();
				this.requestRendering();
			} else {
				this.scale = timer.end;
				return false;
			}
		}
	});

	this.marquee.key = 'tile';
	this.marquee.x = 0;
	this.marquee.y = 0;
	this.marquee.width = 1;
	this.marquee.height = 1;
	this.marquee.offsetX = 0;
	this.marquee.offsetY = 0;
	this.marquee.tilesetMap = Palette.tilesetMap;
	this.marquee.tiles = this.createTiles(1, 1);
	this.marquee.terrain = 0b10;
	this.marquee.save('eraser');
	this.marquee.save('tile');
	this.marquee.save('object');
	this.marquee.save('terrain');
	this.marquee.backgroundColorNormal = [0, 192 / 255, 1, 0.2];
	this.marquee.borderColorNormal = [1, 1, 1, 1];
	this.marquee.backgroundColorCopy = [0, 1, 0, 0.2];
	this.marquee.borderColorCopy = [0, 1, 0, 1];
	this.marquee.backgroundColorRect = [0, 192 / 255, 1, 0.2];
	this.marquee.borderColorRect = [1, 1, 1, 1];
	this.marquee.backgroundColorInvalid = [192 / 255, 0, 0, 0.2];

	this.padding = 800;

	this.matrix = new Matrix();

	this.inspectorTypeMap = {
		actor: 'sceneActor',
		region: 'sceneRegion',
		light: 'sceneLight',
		animation: 'sceneAnimation',
		parallax: 'sceneParallax',
		particle: 'sceneParticle',
		tilemap: 'sceneTilemap'
	};

	this.tilemapLightSamplingModes = {
		raw: 0,
		global: 1,
		ambient: 2
	};

	this.defaultLightSamplingModes = {
		raw: 0,
		global: 0,
		anchor: 0
	};

	this.blendModeMap = {
		0: 'normal',
		1: 'additive',
		2: 'subtract',
		normal: 0,
		additive: 1,
		subtract: 2
	};

	this.sharedPoint = new Scene.Point();

	this.searcher.addCloseButton();
	this.searcher.addKeydownFilter();

	const { list } = this;
	list.removable = true;
	list.renamable = true;
	list.bind(() => this.objects);
	list.updaters.push(list.updateItemClass);
	list.creators.push(list.updateTilemapClass);
	list.creators.push(list.createConditionIcon);
	list.creators.push(list.updateConditionIcon);
	list.creators.push(list.createEventIcon);
	list.creators.push(list.updateEventIcon);
	list.creators.push(list.createScriptIcon);
	list.creators.push(list.updateScriptIcon);
	list.creators.push(list.createVisibilityIcon);
	list.updaters.push(list.updateVisibilityIcon);
	list.creators.push(list.createLockIcon);
	list.updaters.push(list.updateLockIcon);

	History.processors['scene-folder-rename'] = (operation, data) => {
		const { response } = data;
		list.restore(operation, response);
	};
	History.processors['scene-object-create'] = (operation, data) => {
		const { response, parent } = data;
		list.restore(operation, response);
		list.updateFolderState(parent, 'hidden');
		list.updateFolderState(parent, 'locked');
	};
	History.processors['scene-object-delete'] = (operation, data) => {
		const { response } = data;
		const parent = response.item.parent;
		list.restore(operation, response);
		list.updateFolderState(parent, 'hidden');
		list.updateFolderState(parent, 'locked');
	};
	History.processors['scene-object-remove'] = (operation, data) => {
		const { response } = data;
		const sParent = response.source.parent;
		const dParent = response.destination.parent;
		list.restore(operation, response);
		list.updateFolderState(sParent, 'hidden');
		list.updateFolderState(sParent, 'locked');
		if (sParent !== dParent) {
			list.updateFolderState(dParent, 'hidden');
			list.updateFolderState(dParent, 'locked');
		}
	};
	History.processors['scene-object-toggle'] = (operation, data) => {
		const { item, oldValue, newValue } = data;
		if (operation === 'undo') {
			item.enabled = oldValue;
		} else {
			item.enabled = newValue;
		}
		list.updateConditionIcon(item);
		Scene.requestRendering();
		Scene.planToSave();
	};
	History.processors['scene-object-hidden'] = (operation, data) => {
		const { item, oldValues, newValue } = data;
		if (operation === 'undo') {
			list.restoreRecursiveStates(item, 'hidden', oldValues);
		} else {
			list.setRecursiveStates(item, 'hidden', newValue);
		}
		list.updateFolderState(item.parent, 'hidden');
		list.update();
		Scene.requestRendering();
		Scene.planToSave();
	};
	History.processors['scene-object-locked'] = (operation, data) => {
		const { item, oldValues, newValue } = data;
		if (operation === 'undo') {
			list.restoreRecursiveStates(item, 'locked', oldValues);
		} else {
			list.setRecursiveStates(item, 'locked', newValue);
		}
		list.updateFolderState(item.parent, 'locked');
		list.update();
		Scene.planToSave();
	};
	History.processors['scene-resize'] = (operation, data) => {
		const { editor, width, height, terrains } = data;
		const { scene } = Scene.context;
		data.width = Scene.width;
		data.height = Scene.height;
		data.terrains = Scene.terrains;
		Scene.width = width;
		Scene.height = height;
		Scene.terrains = terrains;
		if (editor.target === scene) {
			editor.write({ width, height });
		} else {
			Inspector.open('fileScene', scene);
		}
		Scene.planToSaveTerrains();
		Scene.resize();
		Scene.requestRendering();
		Scene.planToSave();
	};
	History.processors['scene-tilemap-resize'] = (operation, data) => {
		const { editor, tilemap, width, height, tiles, tilesetMap } = data;
		data.width = tilemap.width;
		data.height = tilemap.height;
		data.tiles = tilemap.tiles;
		tilemap.width = width;
		tilemap.height = height;
		tilemap.tiles = tiles;
		tilemap.tilesetMap = tilesetMap;
		tilemap.changed = true;
		if (editor.target === tilemap) {
			editor.write({ width, height });
		}
		Scene.setTarget(tilemap);
		Scene.marquee.resize();
		Scene.requestRendering();
		Scene.planToSave();
	};
	History.processors['scene-tilemap-shortcut'] = (operation, data) => {
		const { tilemap, shortcut } = data;
		data.shortcut = tilemap.shortcut;
		tilemap.shortcut = shortcut;
		Scene.setTarget(tilemap);
		Scene.tilemaps.shortcuts.update();
		Scene.planToSave();
	};
	History.processors['scene-tilemap-shift'] = (operation, data) => {
		const { tilemap, shiftX, shiftY } = data;
		if (operation === 'undo') {
			Scene.shiftTilemap(tilemap, -shiftX, -shiftY);
		} else {
			Scene.shiftTilemap(tilemap, shiftX, shiftY);
		}
		tilemap.changed = true;
		Scene.setTarget(tilemap);
		Scene.planToSave();
	};
	History.processors['scene-shift'] = (operation, data) => {
		const { shiftX, shiftY, changes } = data;
		if (operation === 'undo') {
			Scene.shiftTerrains(-shiftX, -shiftY);
		} else {
			Scene.shiftTerrains(shiftX, shiftY);
		}
		Scene.shiftObjects(changes);
		Scene.planToSaveTerrains();
		Scene.planToSave();
	};
	History.processors['scene-tilemap-change'] = (operation, data) => {
		const { tilemap, changes, tilesetMap } = data;
		switch (operation) {
			case 'undo':
				Scene.undoMapData(tilemap.tiles, changes);
				break;
			case 'redo':
				Scene.redoMapData(tilemap.tiles, changes);
				break;
		}
		tilemap.tilesetMap = tilesetMap;
		tilemap.changed = true;
		Scene.requestRendering();
		Scene.planToSave();
	};
	History.processors['scene-terrain-change'] = (operation, data) => {
		const { terrains, changes } = data;
		switch (operation) {
			case 'undo':
				Scene.undoMapData(terrains, changes);
				break;
			case 'redo':
				Scene.redoMapData(terrains, changes);
				break;
		}
		Scene.planToSaveTerrains();
		Scene.requestRendering();
		Scene.planToSave();
	};
	History.processors['scene-target-shift'] = (operation, data) => {
		const { editor, target, x, y } = data;
		data.x = target.x;
		data.y = target.y;
		target.x = x;
		target.y = y;
		if (editor.target === target) {
			editor.write({ x, y });
		}
		Scene.setTarget(target);
		Scene.updateTargetInfo();
		Scene.requestRendering();
		Scene.planToSave();
	};
	History.processors['scene-target-redirect'] = (operation, data) => {
		const { editor, target, angle } = data;
		data.angle = target.angle;
		target.angle = angle;
		target.player.setAngle(Math.radians(angle));
		if (editor.target === target) {
			editor.write({ angle });
		}
		Scene.setTarget(target);
		Scene.requestRendering();
		Scene.planToSave();
	};

	window.on('themechange', this.themechange);
	window.on('dprchange', this.dprchange);
	window.on('datachange', this.datachange);
	window.on('keydown', this.keydown);
	window.on('keydown', Reference.getKeydownListener(list));
	this.page.on('resize', this.windowResize);
	this.head.on('pointerdown', this.headPointerdown);
	GL.canvas.on('webglcontextrestored', this.webglRestored);
	$('#scene-head-start').on('pointerdown', this.switchPointerdown);
	$('#scene-layer').on('pointerdown', this.layerPointerdown);
	$('#scene-brush').on('pointerdown', this.brushPointerdown);
	$('#scene-zoom').on('focus', this.zoomFocus);
	$('#scene-zoom').on('input', this.zoomInput);
	this.screen.on('keydown', this.screenKeydown);
	this.screen.on('wheel', this.screenWheel);
	this.screen.on('userscroll', this.screenUserscroll);
	this.screen.on('blur', this.screenBlur);
	this.screen.on('dragenter', this.screenDragenter);
	this.screen.on('dragleave', this.screenDragleave);
	this.screen.on('dragover', this.screenDragover);
	this.screen.on('drop', this.screenDrop);
	this.marquee.on('pointerdown', this.marqueePointerdown);
	this.marquee.on('pointermove', this.marqueePointermove);
	this.marquee.on('pointerleave', this.marqueePointerleave);
	this.marquee.on('doubleclick', this.marqueeDoubleclick);
	this.searcher.on('input', this.searcherInput);
	this.searcher.on('compositionend', this.searcherInput);
	list.on('keydown', this.listKeydown);
	list.on('pointerdown', this.listPointerdown);
	list.on('pointerdown', Reference.getPointerdownListener(list), {
		capture: true
	});
	list.on('select', this.listSelect);
	list.on('record', this.listRecord);
	list.on('popup', this.listPopup);
	list.on('open', this.listOpen);
	list.on('change', this.listChange);
	list.page.on('resize', this.listPageResize);

	ObjectFolder.initialize();
	SceneShift.initialize();
	TilemapShortcuts.initialize();
};

Scene.open = function (context) {
	if (this.context === context) {
		return;
	}
	this.save();
	this.close();
	const { meta } = context;
	this.context = context;
	this.meta = meta;

	Particle.Element.stage = this;

	if (context.scene) {
		this.state = 'open';
		this.load(context);
		this.body.show();
		// 因此在这里调用resize
		this.resize();
		this.requestAnimation();
		this.requestRendering();
		return;
	}

	const scene = Data.scenes[meta.guid];
	if (scene) {
		context.scene = Codec.decodeScene(scene);
		this.state = 'loading';
		this.load(context);
	} else {
		Layout.manager.switch('directory');
		Window.confirm(
			{
				message: `Failed to read file: ${meta.path}`
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
	}
};

Scene.load = function (context) {
	const firstLoad = !context.editor;
	if (firstLoad) {
		const tilemaps = [] as any;
		tilemaps.shortcuts = new TilemapShortcuts(tilemaps);

		const regions = [] as any;
		regions.visibleList = [];
		regions.visibleList.count = 0;

		context.changed = false;
		context.editor = {
			target: null,
			tilemap: null,
			history: this.createHistory(),
			textures: new Scene.Textures(),
			tilemaps: tilemaps,
			actors: [],
			regions: regions,
			lights: [],
			animations: [],
			particles: [],
			parallaxes: [],
			backgrounds: [],
			foregrounds: [],
			doodads: [],
			animationFrame: 0,
			animationElapsed: 0,
			animationInterval: -1
			// listScrollTop: 0,
		};
	}
	const { scene, editor } = context;

	this.width = scene.width;
	this.height = scene.height;
	this.tileWidth = scene.tileWidth;
	this.tileHeight = scene.tileHeight;
	this.ambient = scene.ambient;
	this.terrains = scene.terrainArray;
	this.events = scene.events;
	this.scripts = scene.scripts;
	this.objects = scene.objects;

	this.history = editor.history;
	this.textures = editor.textures;
	this.tilemaps = editor.tilemaps;
	this.actors = editor.actors;
	this.regions = editor.regions;
	this.lights = editor.lights;
	this.animations = editor.animations;
	this.particles = editor.particles;
	this.parallaxes = editor.parallaxes;
	this.backgrounds = editor.backgrounds;
	this.foregrounds = editor.foregrounds;
	this.doodads = editor.doodads;
	this.animationFrame = editor.animationFrame;
	this.animationElapsed = editor.animationElapsed;
	this.animationInterval = editor.animationInterval;
	this.updateAnimationInterval();

	this.updateFont();

	if (firstLoad) {
		this.loadObjects();

		this.loadTextures();
	}

	this.loadAllContexts();

	this.list.update();
	// this.list.scrollTop = editor.listScrollTop

	this.tilemaps.shortcuts.update();

	this.setTarget(editor.target);

	if (editor.tilemap) {
		this.openTilemap(editor.tilemap);
	}

	GL.setAmbientLight(this.ambient);
	UndoManager.setActive(Scene);
};

Scene.save = function () {
	if (this.state === 'open') {
		const { scene, editor } = this.context;

		scene.width = this.width;
		scene.height = this.height;
		scene.tileWidth = this.tileWidth;
		scene.tileHeight = this.tileHeight;
		scene.ambient = this.ambient;
		scene.terrainArray = this.terrains;
		scene.events = this.events;
		scene.scripts = this.scripts;
		scene.objects = this.objects;

		editor.target = this.target;
		editor.tilemap = this.tilemap;
		editor.history = this.history;
		editor.textures = this.textures;
		editor.tilemaps = this.tilemaps;
		editor.actors = this.actors;
		editor.regions = this.regions;
		editor.lights = this.lights;
		editor.animations = this.animations;
		editor.particles = this.particles;
		editor.parallaxes = this.parallaxes;
		editor.backgrounds = this.backgrounds;
		editor.foregrounds = this.foregrounds;
		editor.doodads = this.doodads;
		editor.animationFrame = this.animationFrame;
		editor.animationElapsed = this.animationElapsed;
		editor.animationInterval = this.animationInterval;
		// editor.listScrollTop = this.list.scrollTop

		if (this.context.changed) {
			this.context.changed = false;
			Data.scenes[this.meta.guid] = Codec.encodeScene(scene);
		}
	}
};

Scene.close = function () {
	if (this.state !== 'closed') {
		this.screen.blur();
		this.closeTilemap();
		this.setTarget(null);
		this.deletePreviewObject();
		if (Inspector.type === 'fileScene') {
			Inspector.close();
		}
		this.state = 'closed';
		this.symbol = null;
		this.context = null;
		this.meta = null;
		this.width = null;
		this.height = null;
		this.tileWidth = null;
		this.tileHeight = null;
		this.ambient = null;
		this.terrains = null;
		this.events = null;
		this.scripts = null;
		this.objects = null;
		this.tilemaps = null;
		this.actors = null;
		this.regions = null;
		this.lights = null;
		this.animations = null;
		this.particles = null;
		this.parallaxes = null;
		this.backgrounds = null;
		this.foregrounds = null;
		this.doodads = null;
		this.history = null;
		this.textures = null;
		this.closeMapRecord();
		this.searcher.write('');
		this.marquee.clear();
		this.list.clear();
		this.body.hide();
		this.stopAnimation();
		this.stopRendering();
		UndoManager.setActive(null);
	}
};

Scene.destroy = function (context) {
	const { editor } = context;
	if (!editor) return;
	if (this.context === context) {
		this.save();
		this.close();
	}
	editor.textures.destroy();
	delete editor.textures;
	for (const actor of editor.actors) {
		actor.player.destroy();
		delete actor.player;
		delete actor.data;
	}
	for (const light of editor.lights) {
		delete light.instance;
	}
	for (const animation of editor.animations) {
		animation.player.destroy();
		delete animation.player;
		delete animation.data;
	}
	for (const particle of editor.particles) {
		particle.emitter?.destroy();
		delete particle.emitter;
	}
	for (const parallax of editor.parallaxes) {
		parallax.player.destroy();
		delete parallax.player;
	}
};

Scene.shiftTilemap = function (tilemap, offsetX, offsetY) {
	const width = tilemap.width;
	const height = tilemap.height;
	if (width === 0 || height === 0) {
		return;
	}
	const ox = ((offsetX % width) + width) % width;
	const oy = ((offsetY % height) + height) % height;
	const sTiles = GL.arrays[0].uint32;
	const dTiles = tilemap.tiles;
	const tro = dTiles.rowOffset;
	sTiles.set(dTiles);
	for (let y = 0; y < height; y++) {
		const siy = y * tro;
		const diy = ((y + oy) % height) * tro;
		for (let x = 0; x < width; x++) {
			const si = x + siy;
			const di = ((x + ox) % width) + diy;
			dTiles[di] = sTiles[si];
		}
	}
	this.requestRendering();
};

Scene.shiftTerrains = function (offsetX, offsetY) {
	const width = this.width;
	const height = this.height;
	if (width === 0 || height === 0) {
		return;
	}
	const ox = ((offsetX % width) + width) % width;
	const oy = ((offsetY % height) + height) % height;
	const sTerrains = GL.arrays[0].uint8;
	const dTerrains = this.terrains;
	const pro = dTerrains.rowOffset;
	sTerrains.set(dTerrains);
	for (let y = 0; y < height; y++) {
		const siy = y * pro;
		const diy = ((y + oy) % height) * pro;
		for (let x = 0; x < width; x++) {
			const si = x + siy;
			const di = ((x + ox) % width) + diy;
			dTerrains[di] = sTerrains[si];
		}
	}
	this.requestRendering();
};

Scene.shiftObjects = function (changes) {
	const { targets, posX, posY } = changes;
	const length = targets.length;
	for (let i = 0; i < length; i++) {
		const target = targets[i];
		const x = posX[i];
		const y = posY[i];
		posX[i] = target.x;
		posY[i] = target.y;
		target.x = x;
		target.y = y;
	}
	this.requestRendering();
};

Scene.computeObjectShifting = function (ox, oy) {
	const MIN = -128;
	const MAX = 640;
	const keys = [
		'actors',
		'regions',
		'lights',
		'animations',
		'particles',
		'parallaxes',
		'tilemaps'
	];
	let index = 0;
	let length = 0;
	for (const key of keys) {
		length += this[key].length;
	}
	const clamp = Math.clamp;
	const targets = new Array(length);
	const posX = new Float64Array(length);
	const posY = new Float64Array(length);
	for (const key of keys) {
		const list = this[key];
		const length = list.length;
		for (let i = 0; i < length; i++) {
			const target = list[i];
			targets[index] = target;
			posX[index] = clamp(target.x + ox, MIN, MAX);
			posY[index] = clamp(target.y + oy, MIN, MAX);
			index++;
		}
	}
	return { targets, posX, posY };
};

Scene.getDefaultObjectFolder = function (kind) {
	const name = Editor.project.scene.defaultFolders[kind];
	return !name
		? null
		: this.list.getItemByProperties({
				class: 'folder',
				name: name
			});
};

Scene.copy = function () {
	if (this.state === 'open' && this.target !== null) {
		this.list.copy(this.target);
	}
};

Scene.paste = function (x, y) {
	if (this.state === 'open' && this.dragging === null) {
		if (x === undefined) {
			x = this.meta.x;
			y = this.meta.y;
		}
		this.list.paste('auto', (data) => {
			switch (data.class) {
				case 'tilemap':
				case 'actor':
				case 'region':
				case 'light':
				case 'animation':
				case 'particle':
				case 'parallax':
					data.x = Math.clamp(Math.floor(x), 0, this.width - 1) + 0.5;
					data.y = Math.clamp(Math.floor(y), 0, this.height - 1) + 0.5;
					break;
			}
		});
	}
};

Scene.duplicate = function () {
	if (this.target) {
		this.list.duplicate(this.target);
	}
};

Scene.create = function (kind, x, y) {
	const dItem = this.getDefaultObjectFolder(kind);
	const map = this.inspectorTypeMap;
	const key = map[kind];
	const editor = Inspector[key];
	const object = editor.create();
	object.x = x;
	object.y = y;
	this.list.addNodeTo(object, dItem);
};

Scene.delete = function () {
	if (this.state === 'open' && this.target !== null && this.dragging === null) {
		this.list.delete(this.target);
	}
};

Scene.toggle = function () {
	this.list.toggle(this.target);
};

Scene.undo = function () {
	if (this.state === 'open' && !this.dragging && this.history.canUndo()) {
		this.history.restore('undo');
	}
};

Scene.redo = function () {
	if (this.state === 'open' && !this.dragging && this.history.canRedo()) {
		this.history.restore('redo');
	}
};

Scene.updateAnimationInterval = function () {
	const { animationInterval } = Data.config.scene;
	if (this.animationInterval !== animationInterval) {
		if (animationInterval === 0 && this.animationFrame !== 0) {
			this.animationFrame = 0;
			this.requestRendering();
		}
		this.animationElapsed = 0;
		this.animationInterval = animationInterval;
	}
};

Scene.updateLightAreaExpansion = function (last) {
	if (this.showLight) {
		const light = Data.config.lightArea;
		if (
			last.expansionLeft !== light.expansionLeft ||
			last.expansionTop !== light.expansionTop ||
			last.expansionRight !== light.expansionRight ||
			last.expansionBottom !== light.expansionBottom
		) {
			GL.reflectedLightMap.innerWidth = 0;
			GL.reflectedLightMap.paddingLeft = undefined;
			GL.resizeLightMap();
			this.updateLightTexParameters();
			this.updateTransform();
			this.requestRendering();
		}
	}
};

Scene.updateActorTeams = function () {
	const list = this.list;
	for (const actor of this.actors) {
		list.updateIcon(actor);
	}
};

Scene.updateHead = function () {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const { nav } = Layout.getGroupOfElement(head);
		const nRect = nav.rect();
		const iRect = nav.lastChild.rect();
		const left = iRect.right - nRect.left;
		if (head.left !== left) {
			head.left = left;
			head.style.left = `${left}px`;
		}
		const width = nRect.right - iRect.right;
		if (head.width !== width) {
			head.width = width;
			const [start, center, end] = head.children;
			end.style.marginLeft = '';
			const sRect = start.rect();
			const cRect = center.rect();
			const eRect = end.rect();
			const spacing = eRect.left - sRect.right - cRect.width;
			const difference = sRect.right - nRect.left - eRect.width;
			const margin = Math.min(spacing, difference);
			end.style.marginLeft = `${margin}px`;
		}
	}
};

Scene.registerPreset = (function IIFE() {
	const generatePresetId = () => {
		const { scenePresets } = Data;
		let id;
		do {
			id = GUID.generate64bit();
		} while (id in scenePresets);
		return id;
	};
	const registerPreset = (node) => {
		const { scenePresets } = Data;
		// 新对象或对象ID冲突，生成新ID
		if (node.presetId === '' || node.presetId in scenePresets) {
			node.presetId = generatePresetId();
		}
		scenePresets[node.presetId] = {
			sceneId: Scene.meta.guid,
			data: node
		};
		if (node.children instanceof Array) {
			for (const child of node.children) {
				registerPreset(child);
			}
		}
	};
	return function (node) {
		registerPreset(node);
	};
})();

Scene.unregisterPreset = function (node) {
	delete Data.scenePresets[node.presetId];
	if (node.children instanceof Array) {
		for (const child of node.children) {
			Scene.unregisterPreset(child);
		}
	}
};

Scene.sortLayers = (function IIFE() {
	const sorter = (a, b) => a.order - b.order;
	return function () {
		this.backgrounds.sort(sorter);
		this.foregrounds.sort(sorter);
		this.doodads.sort(sorter);
	};
})();

Scene.planToSave = function () {
	File.planToSave(this.meta);
	this.context.changed = true;
};

Scene.planToSaveTerrains = function () {
	this.context.scene.terrainChanged = true;
};
