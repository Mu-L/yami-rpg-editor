'use strict'

// ******************************** 场景窗口 ********************************

export const Scene = {
	// properties
	state: 'closed',
	page: $('#scene'),
	head: $('#scene-head'),
	body: $('#scene-body').hide(),
	info: $('#scene-info'),
	screen: $('#scene-screen'),
	marquee: $('#scene-marquee'),
	searcher: $('#scene-searcher'),
	list: $('#scene-list'),
	// editor properties
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
	// scene properties
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
	// methods
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
	// events
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
	// classes
	Textures: null,
	Point: null
}

// marquee properties
Scene.marquee.key = null
Scene.marquee.offsetX = null
Scene.marquee.offsetY = null
Scene.marquee.tilesetMap = null
Scene.marquee.tiles = null
Scene.marquee.terrain = null
Scene.marquee.previewTiles = false
Scene.marquee.pointerevent = null
// marquee methods
Scene.marquee.save = null
Scene.marquee.switch = null
Scene.marquee.resize = null
Scene.marquee.clear = null
Scene.marquee.select = null
Scene.marquee.selectInPencilMode = null
Scene.marquee.selectInRectMode = null
Scene.marquee.selectInCopyMode = null
Scene.marquee.selectInObjectMode = null
Scene.marquee.getTiles = null

// list properties
Scene.list.page = $('#scene-object')
Scene.list.head = $('#scene-list-head')
// list methods
Scene.list.copy = null
Scene.list.paste = null
Scene.list.duplicate = null
Scene.list.delete = null
Scene.list.toggle = null
Scene.list.cancelSearch = null
Scene.list.createFolder = null
Scene.list.createTilemapShortcutItems = null
Scene.list.restoreRecursiveStates = null
Scene.list.setRecursiveStates = null
Scene.list.updateItemClass = null
Scene.list.updateFolderState = null
Scene.list.canSwitchState = null
Scene.list.createIcon = null
Scene.list.updateIcon = null
Scene.list.updateHead = null
Scene.list.updateTilemapClass = null
Scene.list.createConditionIcon = null
Scene.list.updateConditionIcon = null
Scene.list.createEventIcon = null
Scene.list.updateEventIcon = null
Scene.list.createScriptIcon = null
Scene.list.updateScriptIcon = null
Scene.list.createVisibilityIcon = null
Scene.list.updateVisibilityIcon = null
Scene.list.createLockIcon = null
Scene.list.updateLockIcon = null
Scene.list.onCreate = null
Scene.list.onRemove = null
Scene.list.onDelete = null
Scene.list.onResume = null

// 初始化
Scene.initialize = function () {
	// 绑定滚动条
	this.screen.addScrollbars()

	// 创建位移计时器
	this.translationTimer = new Timer({
		duration: Infinity,
		update: (timer) => {
			if (this.state === 'open' && this.dragging === null) {
				const key = this.translationKey
				const meta = this.meta
				const step = (Timer.deltaTime * 0.04) / this.scale
				let x = 0
				let y = 0
				if (key & 0b0001) {
					x -= step
				}
				if (key & 0b0010) {
					y -= step
				}
				if (key & 0b0100) {
					x += step
				}
				if (key & 0b1000) {
					y += step
				}
				const screen = this.screen
				const sl = screen.scrollLeft
				const st = screen.scrollTop
				const cx = Math.roundTo(meta.x + x, 4)
				const cy = Math.roundTo(meta.y + y, 4)
				this.updateCamera(cx, cy)
				this.updateTransform()
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					this.requestRendering()
					this.marquee.resize()
					this.screen.updateScrollbars()
				}
			} else {
				return false
			}
		}
	})

	// 创建缩放计时器
	this.zoomTimer = new Timer({
		duration: 80,
		update: (timer) => {
			if (this.state === 'open') {
				const { elapsed, duration, start, end } = timer
				const time = elapsed / duration
				this.scale = start * (1 - time) + end * time
				this.resize()
				this.requestRendering()
			} else {
				this.scale = timer.end
				return false
			}
		}
	})

	// 设置选框
	this.marquee.key = 'tile'
	this.marquee.x = 0
	this.marquee.y = 0
	this.marquee.width = 1
	this.marquee.height = 1
	this.marquee.offsetX = 0
	this.marquee.offsetY = 0
	this.marquee.tilesetMap = Palette.tilesetMap
	this.marquee.tiles = this.createTiles(1, 1)
	this.marquee.terrain = 0b10
	this.marquee.save('eraser')
	this.marquee.save('tile')
	this.marquee.save('object')
	this.marquee.save('terrain')
	this.marquee.backgroundColorNormal = [0, 192 / 255, 1, 0.2]
	this.marquee.borderColorNormal = [1, 1, 1, 1]
	this.marquee.backgroundColorCopy = [0, 1, 0, 0.2]
	this.marquee.borderColorCopy = [0, 1, 0, 1]
	this.marquee.backgroundColorRect = [0, 192 / 255, 1, 0.2]
	this.marquee.borderColorRect = [1, 1, 1, 1]
	this.marquee.backgroundColorInvalid = [192 / 255, 0, 0, 0.2]

	// 设置舞台边距
	this.padding = 800

	// 创建变换矩阵
	this.matrix = new Matrix()

	// 设置检查器类型映射表
	this.inspectorTypeMap = {
		actor: 'sceneActor',
		region: 'sceneRegion',
		light: 'sceneLight',
		animation: 'sceneAnimation',
		parallax: 'sceneParallax',
		particle: 'sceneParticle',
		tilemap: 'sceneTilemap'
	}

	// 瓦片地图光线采样模式映射表
	this.tilemapLightSamplingModes = {
		raw: 0,
		global: 1,
		ambient: 2
	}

	// 缺省光线采样模式映射表
	this.defaultLightSamplingModes = {
		raw: 0,
		global: 0,
		anchor: 0
	}

	// 混合模式映射表
	this.blendModeMap = {
		0: 'normal',
		1: 'additive',
		2: 'subtract',
		normal: 0,
		additive: 1,
		subtract: 2
	}

	// 设置共享坐标点
	this.sharedPoint = new Scene.Point()

	// 设置列表搜索框按钮和过滤器
	this.searcher.addCloseButton()
	this.searcher.addKeydownFilter()

	// 绑定对象目录列表
	const { list } = this
	list.removable = true
	list.renamable = true
	list.bind(() => this.objects)
	list.updaters.push(list.updateItemClass)
	list.creators.push(list.updateTilemapClass)
	list.creators.push(list.createConditionIcon)
	list.creators.push(list.updateConditionIcon)
	list.creators.push(list.createEventIcon)
	list.creators.push(list.updateEventIcon)
	list.creators.push(list.createScriptIcon)
	list.creators.push(list.updateScriptIcon)
	list.creators.push(list.createVisibilityIcon)
	list.updaters.push(list.updateVisibilityIcon)
	list.creators.push(list.createLockIcon)
	list.updaters.push(list.updateLockIcon)

	// 设置历史操作处理器
	History.processors['scene-folder-rename'] = (operation, data) => {
		const { response } = data
		list.restore(operation, response)
	}
	History.processors['scene-object-create'] = (operation, data) => {
		const { response, parent } = data
		list.restore(operation, response)
		list.updateFolderState(parent, 'hidden')
		list.updateFolderState(parent, 'locked')
	}
	History.processors['scene-object-delete'] = (operation, data) => {
		const { response } = data
		const parent = response.item.parent
		list.restore(operation, response)
		list.updateFolderState(parent, 'hidden')
		list.updateFolderState(parent, 'locked')
	}
	History.processors['scene-object-remove'] = (operation, data) => {
		const { response } = data
		const sParent = response.source.parent
		const dParent = response.destination.parent
		list.restore(operation, response)
		list.updateFolderState(sParent, 'hidden')
		list.updateFolderState(sParent, 'locked')
		if (sParent !== dParent) {
			list.updateFolderState(dParent, 'hidden')
			list.updateFolderState(dParent, 'locked')
		}
	}
	History.processors['scene-object-toggle'] = (operation, data) => {
		const { item, oldValue, newValue } = data
		if (operation === 'undo') {
			item.enabled = oldValue
		} else {
			item.enabled = newValue
		}
		list.updateConditionIcon(item)
		Scene.requestRendering()
		Scene.planToSave()
	}
	History.processors['scene-object-hidden'] = (operation, data) => {
		const { item, oldValues, newValue } = data
		if (operation === 'undo') {
			list.restoreRecursiveStates(item, 'hidden', oldValues)
		} else {
			list.setRecursiveStates(item, 'hidden', newValue)
		}
		list.updateFolderState(item.parent, 'hidden')
		list.update()
		Scene.requestRendering()
		Scene.planToSave()
	}
	History.processors['scene-object-locked'] = (operation, data) => {
		const { item, oldValues, newValue } = data
		if (operation === 'undo') {
			list.restoreRecursiveStates(item, 'locked', oldValues)
		} else {
			list.setRecursiveStates(item, 'locked', newValue)
		}
		list.updateFolderState(item.parent, 'locked')
		list.update()
		Scene.planToSave()
	}
	History.processors['scene-resize'] = (operation, data) => {
		const { editor, width, height, terrains } = data
		const { scene } = Scene.context
		data.width = Scene.width
		data.height = Scene.height
		data.terrains = Scene.terrains
		Scene.width = width
		Scene.height = height
		Scene.terrains = terrains
		if (editor.target === scene) {
			editor.write({ width, height })
		} else {
			Inspector.open('fileScene', scene)
		}
		Scene.planToSaveTerrains()
		Scene.resize()
		Scene.requestRendering()
		Scene.planToSave()
	}
	History.processors['scene-tilemap-resize'] = (operation, data) => {
		const { editor, tilemap, width, height, tiles, tilesetMap } = data
		data.width = tilemap.width
		data.height = tilemap.height
		data.tiles = tilemap.tiles
		tilemap.width = width
		tilemap.height = height
		tilemap.tiles = tiles
		tilemap.tilesetMap = tilesetMap
		tilemap.changed = true
		if (editor.target === tilemap) {
			editor.write({ width, height })
		}
		Scene.setTarget(tilemap)
		Scene.marquee.resize()
		Scene.requestRendering()
		Scene.planToSave()
	}
	History.processors['scene-tilemap-shortcut'] = (operation, data) => {
		const { tilemap, shortcut } = data
		data.shortcut = tilemap.shortcut
		tilemap.shortcut = shortcut
		Scene.setTarget(tilemap)
		Scene.tilemaps.shortcuts.update()
		Scene.planToSave()
	}
	History.processors['scene-tilemap-shift'] = (operation, data) => {
		const { tilemap, shiftX, shiftY } = data
		if (operation === 'undo') {
			Scene.shiftTilemap(tilemap, -shiftX, -shiftY)
		} else {
			Scene.shiftTilemap(tilemap, shiftX, shiftY)
		}
		tilemap.changed = true
		Scene.setTarget(tilemap)
		Scene.planToSave()
	}
	History.processors['scene-shift'] = (operation, data) => {
		const { shiftX, shiftY, changes } = data
		if (operation === 'undo') {
			Scene.shiftTerrains(-shiftX, -shiftY)
		} else {
			Scene.shiftTerrains(shiftX, shiftY)
		}
		Scene.shiftObjects(changes)
		Scene.planToSaveTerrains()
		Scene.planToSave()
	}
	History.processors['scene-tilemap-change'] = (operation, data) => {
		const { tilemap, changes, tilesetMap } = data
		switch (operation) {
			case 'undo':
				Scene.undoMapData(tilemap.tiles, changes)
				break
			case 'redo':
				Scene.redoMapData(tilemap.tiles, changes)
				break
		}
		tilemap.tilesetMap = tilesetMap
		tilemap.changed = true
		Scene.requestRendering()
		Scene.planToSave()
	}
	History.processors['scene-terrain-change'] = (operation, data) => {
		const { terrains, changes } = data
		switch (operation) {
			case 'undo':
				Scene.undoMapData(terrains, changes)
				break
			case 'redo':
				Scene.redoMapData(terrains, changes)
				break
		}
		Scene.planToSaveTerrains()
		Scene.requestRendering()
		Scene.planToSave()
	}
	History.processors['scene-target-shift'] = (operation, data) => {
		const { editor, target, x, y } = data
		data.x = target.x
		data.y = target.y
		target.x = x
		target.y = y
		if (editor.target === target) {
			editor.write({ x, y })
		}
		Scene.setTarget(target)
		Scene.updateTargetInfo()
		Scene.requestRendering()
		Scene.planToSave()
	}
	History.processors['scene-target-redirect'] = (operation, data) => {
		const { editor, target, angle } = data
		data.angle = target.angle
		target.angle = angle
		target.player.setAngle(Math.radians(angle))
		if (editor.target === target) {
			editor.write({ angle })
		}
		Scene.setTarget(target)
		Scene.requestRendering()
		Scene.planToSave()
	}

	// 侦听事件
	window.on('themechange', this.themechange)
	window.on('dprchange', this.dprchange)
	window.on('datachange', this.datachange)
	window.on('keydown', this.keydown)
	window.on('keydown', Reference.getKeydownListener(list))
	this.page.on('resize', this.windowResize)
	this.head.on('pointerdown', this.headPointerdown)
	GL.canvas.on('webglcontextrestored', this.webglRestored)
	$('#scene-head-start').on('pointerdown', this.switchPointerdown)
	$('#scene-layer').on('pointerdown', this.layerPointerdown)
	$('#scene-brush').on('pointerdown', this.brushPointerdown)
	$('#scene-zoom').on('focus', this.zoomFocus)
	$('#scene-zoom').on('input', this.zoomInput)
	this.screen.on('keydown', this.screenKeydown)
	this.screen.on('wheel', this.screenWheel)
	this.screen.on('userscroll', this.screenUserscroll)
	this.screen.on('blur', this.screenBlur)
	this.screen.on('dragenter', this.screenDragenter)
	this.screen.on('dragleave', this.screenDragleave)
	this.screen.on('dragover', this.screenDragover)
	this.screen.on('drop', this.screenDrop)
	this.marquee.on('pointerdown', this.marqueePointerdown)
	this.marquee.on('pointermove', this.marqueePointermove)
	this.marquee.on('pointerleave', this.marqueePointerleave)
	this.marquee.on('doubleclick', this.marqueeDoubleclick)
	this.searcher.on('input', this.searcherInput)
	this.searcher.on('compositionend', this.searcherInput)
	list.on('keydown', this.listKeydown)
	list.on('pointerdown', this.listPointerdown)
	list.on('pointerdown', Reference.getPointerdownListener(list), {
		capture: true
	})
	list.on('select', this.listSelect)
	list.on('record', this.listRecord)
	list.on('popup', this.listPopup)
	list.on('open', this.listOpen)
	list.on('change', this.listChange)
	list.page.on('resize', this.listPageResize)

	// 初始化子对象
	ObjectFolder.initialize()
	SceneShift.initialize()
	TilemapShortcuts.initialize()
}

// 打开场景
Scene.open = function (context) {
	if (this.context === context) {
		return
	}
	this.save()
	this.close()
	const { meta } = context
	this.context = context
	this.meta = meta

	// 设置粒子元素舞台
	Particle.Element.stage = this

	// 恢复场景状态
	if (context.scene) {
		this.state = 'open'
		this.load(context)
		this.body.show()
		// 切换页面时因为关闭状态而阻挡resize
		// 因此在这里调用resize
		this.resize()
		this.requestAnimation()
		this.requestRendering()
		return
	}

	// 首次加载场景
	const scene = Data.scenes[meta.guid]
	if (scene) {
		// 解码场景
		context.scene = Codec.decodeScene(scene)
		this.state = 'loading'
		this.load(context)
	} else {
		Layout.manager.switch('directory')
		Window.confirm(
			{
				message: `Failed to read file: ${meta.path}`
			},
			[
				{
					label: 'Confirm'
				}
			]
		)
	}
}

// 加载场景
Scene.load = function (context) {
	const firstLoad = !context.editor
	if (firstLoad) {
		// 创建瓦片地图和快捷方式列表
		const tilemaps = []
		tilemaps.shortcuts = new TilemapShortcuts(tilemaps)

		// 创建区域和可见对象列表
		const regions = []
		regions.visibleList = []
		regions.visibleList.count = 0

		// 设置上下文
		context.changed = false
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
		}
	}
	const { scene, editor } = context

	// 加载场景属性
	this.width = scene.width
	this.height = scene.height
	this.tileWidth = scene.tileWidth
	this.tileHeight = scene.tileHeight
	this.ambient = scene.ambient
	this.terrains = scene.terrainArray
	this.events = scene.events
	this.scripts = scene.scripts
	this.objects = scene.objects

	// 加载编辑器属性
	this.history = editor.history
	this.textures = editor.textures
	this.tilemaps = editor.tilemaps
	this.actors = editor.actors
	this.regions = editor.regions
	this.lights = editor.lights
	this.animations = editor.animations
	this.particles = editor.particles
	this.parallaxes = editor.parallaxes
	this.backgrounds = editor.backgrounds
	this.foregrounds = editor.foregrounds
	this.doodads = editor.doodads
	this.animationFrame = editor.animationFrame
	this.animationElapsed = editor.animationElapsed
	this.animationInterval = editor.animationInterval
	this.updateAnimationInterval()

	// 更新字体
	this.updateFont()

	// 初始化
	if (firstLoad) {
		// 加载对象
		this.loadObjects()

		// 加载图块纹理
		this.loadTextures()
	}

	// 加载所有上下文
	this.loadAllContexts()

	// 更新列表
	this.list.update()
	// this.list.scrollTop = editor.listScrollTop

	// 更新瓦片地图快捷栏
	this.tilemaps.shortcuts.update()

	// 设置目标对象
	this.setTarget(editor.target)

	// 打开瓦片地图对象
	if (editor.tilemap) {
		this.openTilemap(editor.tilemap)
	}

	// 设置环境光
	GL.setAmbientLight(this.ambient)
	UndoManager.setActive(Scene)
}

// 保存场景
Scene.save = function () {
	if (this.state === 'open') {
		const { scene, editor } = this.context

		// 保存场景属性
		scene.width = this.width
		scene.height = this.height
		scene.tileWidth = this.tileWidth
		scene.tileHeight = this.tileHeight
		scene.ambient = this.ambient
		scene.terrainArray = this.terrains
		scene.events = this.events
		scene.scripts = this.scripts
		scene.objects = this.objects

		// 保存编辑器属性
		editor.target = this.target
		editor.tilemap = this.tilemap
		editor.history = this.history
		editor.textures = this.textures
		editor.tilemaps = this.tilemaps
		editor.actors = this.actors
		editor.regions = this.regions
		editor.lights = this.lights
		editor.animations = this.animations
		editor.particles = this.particles
		editor.parallaxes = this.parallaxes
		editor.backgrounds = this.backgrounds
		editor.foregrounds = this.foregrounds
		editor.doodads = this.doodads
		editor.animationFrame = this.animationFrame
		editor.animationElapsed = this.animationElapsed
		editor.animationInterval = this.animationInterval
		// editor.listScrollTop = this.list.scrollTop

		// 重新编码场景数据
		if (this.context.changed) {
			this.context.changed = false
			Data.scenes[this.meta.guid] = Codec.encodeScene(scene)
		}
	}
}

// 关闭场景
Scene.close = function () {
	if (this.state !== 'closed') {
		this.screen.blur()
		this.closeTilemap()
		this.setTarget(null)
		this.deletePreviewObject()
		// 关闭检查器
		if (Inspector.type === 'fileScene') {
			Inspector.close()
		}
		this.state = 'closed'
		this.symbol = null
		this.context = null
		this.meta = null
		this.width = null
		this.height = null
		this.tileWidth = null
		this.tileHeight = null
		this.ambient = null
		this.terrains = null
		this.events = null
		this.scripts = null
		this.objects = null
		this.tilemaps = null
		this.actors = null
		this.regions = null
		this.lights = null
		this.animations = null
		this.particles = null
		this.parallaxes = null
		this.backgrounds = null
		this.foregrounds = null
		this.doodads = null
		this.history = null
		this.textures = null
		this.closeMapRecord()
		this.searcher.write('')
		this.marquee.clear()
		this.list.clear()
		this.body.hide()
		this.stopAnimation()
		this.stopRendering()
		UndoManager.setActive(null)
	}
}

// 销毁场景
Scene.destroy = function (context) {
	const { editor } = context
	if (!editor) return
	if (this.context === context) {
		this.save()
		this.close()
	}
	editor.textures.destroy()
	delete editor.textures
	for (const actor of editor.actors) {
		actor.player.destroy()
		delete actor.player
		delete actor.data
	}
	for (const light of editor.lights) {
		delete light.instance
	}
	for (const animation of editor.animations) {
		animation.player.destroy()
		delete animation.player
		delete animation.data
	}
	for (const particle of editor.particles) {
		particle.emitter?.destroy()
		delete particle.emitter
	}
	for (const parallax of editor.parallaxes) {
		parallax.player.destroy()
		delete parallax.player
	}
}

// 移动瓦片地图
Scene.shiftTilemap = function (tilemap, offsetX, offsetY) {
	const width = tilemap.width
	const height = tilemap.height
	if (width === 0 || height === 0) {
		return
	}
	const ox = ((offsetX % width) + width) % width
	const oy = ((offsetY % height) + height) % height
	const sTiles = GL.arrays[0].uint32
	const dTiles = tilemap.tiles
	const tro = dTiles.rowOffset
	sTiles.set(dTiles)
	for (let y = 0; y < height; y++) {
		const siy = y * tro
		const diy = ((y + oy) % height) * tro
		for (let x = 0; x < width; x++) {
			const si = x + siy
			const di = ((x + ox) % width) + diy
			dTiles[di] = sTiles[si]
		}
	}
	this.requestRendering()
}

// 移动地形
Scene.shiftTerrains = function (offsetX, offsetY) {
	const width = this.width
	const height = this.height
	if (width === 0 || height === 0) {
		return
	}
	const ox = ((offsetX % width) + width) % width
	const oy = ((offsetY % height) + height) % height
	const sTerrains = GL.arrays[0].uint8
	const dTerrains = this.terrains
	const pro = dTerrains.rowOffset
	sTerrains.set(dTerrains)
	for (let y = 0; y < height; y++) {
		const siy = y * pro
		const diy = ((y + oy) % height) * pro
		for (let x = 0; x < width; x++) {
			const si = x + siy
			const di = ((x + ox) % width) + diy
			dTerrains[di] = sTerrains[si]
		}
	}
	this.requestRendering()
}

// 移动对象
Scene.shiftObjects = function (changes) {
	const { targets, posX, posY } = changes
	const length = targets.length
	for (let i = 0; i < length; i++) {
		const target = targets[i]
		const x = posX[i]
		const y = posY[i]
		posX[i] = target.x
		posY[i] = target.y
		target.x = x
		target.y = y
	}
	this.requestRendering()
}

// 计算对象移动
Scene.computeObjectShifting = function (ox, oy) {
	const MIN = -128
	const MAX = 640
	const keys = [
		'actors',
		'regions',
		'lights',
		'animations',
		'particles',
		'parallaxes',
		'tilemaps'
	]
	let index = 0
	let length = 0
	for (const key of keys) {
		length += this[key].length
	}
	const clamp = Math.clamp
	const targets = new Array(length)
	const posX = new Float64Array(length)
	const posY = new Float64Array(length)
	for (const key of keys) {
		const list = this[key]
		const length = list.length
		for (let i = 0; i < length; i++) {
			const target = list[i]
			targets[index] = target
			posX[index] = clamp(target.x + ox, MIN, MAX)
			posY[index] = clamp(target.y + oy, MIN, MAX)
			index++
		}
	}
	return { targets, posX, posY }
}

// 获取默认对象文件夹
Scene.getDefaultObjectFolder = function (kind) {
	const name = Editor.project.scene.defaultFolders[kind]
	return !name
		? null
		: this.list.getItemByProperties({
				class: 'folder',
				name: name
			})
}

// 复制对象
Scene.copy = function () {
	if (this.state === 'open' && this.target !== null) {
		this.list.copy(this.target)
	}
}

// 粘贴对象
Scene.paste = function (x, y) {
	if (this.state === 'open' && this.dragging === null) {
		if (x === undefined) {
			x = this.meta.x
			y = this.meta.y
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
					data.x = Math.clamp(Math.floor(x), 0, this.width - 1) + 0.5
					data.y = Math.clamp(Math.floor(y), 0, this.height - 1) + 0.5
					break
			}
		})
	}
}

// 副本
Scene.duplicate = function () {
	if (this.target) {
		this.list.duplicate(this.target)
	}
}

// 创建对象
Scene.create = function (kind, x, y) {
	const dItem = this.getDefaultObjectFolder(kind)
	const map = this.inspectorTypeMap
	const key = map[kind]
	const editor = Inspector[key]
	const object = editor.create()
	object.x = x
	object.y = y
	this.list.addNodeTo(object, dItem)
}

// 删除对象
Scene.delete = function () {
	if (
		this.state === 'open' &&
		this.target !== null &&
		this.dragging === null
	) {
		this.list.delete(this.target)
	}
}

// 开关对象
Scene.toggle = function () {
	this.list.toggle(this.target)
}

// 撤销操作
Scene.undo = function () {
	if (this.state === 'open' && !this.dragging && this.history.canUndo()) {
		this.history.restore('undo')
	}
}

// 重做操作
Scene.redo = function () {
	if (this.state === 'open' && !this.dragging && this.history.canRedo()) {
		this.history.restore('redo')
	}
}

// 设置缩放
Scene.setZoom = (function IIFE() {
	const slider = $('#scene-zoom')
	return function (zoom) {
		if (this.zoom !== zoom) {
			let scale
			switch (zoom) {
				case 0:
					scale = 0.25
					break
				case 1:
					scale = 0.5
					break
				case 2:
					scale = 1
					break
				case 3:
					scale = 2
					break
				case 4:
					scale = 4
					break
				default:
					return
			}
			this.zoom = zoom
			slider.write(zoom)
			if (this.state === 'open') {
				const timer = this.zoomTimer
				timer.start = this.scale
				timer.end = scale
				timer.elapsed = 0
				timer.add()
			} else {
				this.scale = scale
			}
		}
	}
})()

// 设置场景大小
Scene.setSize = function (width, height) {
	if (this.width === width && this.height === height) {
		return
	}
	this.closeMapRecord()
	this.planToSaveTerrains()
	this.history.save({
		type: 'scene-resize',
		editor: Inspector.fileScene,
		width: this.width,
		height: this.height,
		terrains: this.terrains
	})
	// 调整地形
	const dTerrains = this.createTerrains(width, height)
	const dro = dTerrains.rowOffset
	const sTerrains = this.terrains
	const sro = sTerrains.rowOffset
	const ex = Math.min(width, this.width)
	const ey = Math.min(height, this.height)
	for (let y = 0; y < ey; y++) {
		for (let x = 0; x < ex; x++) {
			const si = x + y * sro
			const di = x + y * dro
			dTerrains[di] = sTerrains[si]
		}
	}
	this.terrains = dTerrains
	this.width = width
	this.height = height
	this.resize()
	this.requestRendering()
}

// 设置图块大小
Scene.setTileSize = function (tileWidth, tileHeight) {
	this.tileWidth = tileWidth
	this.tileHeight = tileHeight
	this.resize()
	this.requestRendering()
}

// 设置瓦片地图大小
Scene.setTilemapSize = function (tilemap, width, height) {
	if (tilemap.width === width && tilemap.height === height) {
		return
	}
	this.history.save({
		type: 'scene-tilemap-resize',
		editor: Inspector.sceneTilemap,
		tilemap: tilemap,
		width: tilemap.width,
		height: tilemap.height,
		tiles: tilemap.tiles,
		tilesetMap: tilemap.tilesetMap
	})
	// 调整图块
	const dTiles = this.createTiles(width, height)
	const dro = dTiles.rowOffset
	const sTiles = tilemap.tiles
	const sro = sTiles.rowOffset
	const ex = Math.min(width, tilemap.width)
	const ey = Math.min(height, tilemap.height)
	for (let y = 0; y < ey; y++) {
		for (let x = 0; x < ex; x++) {
			const si = x + y * sro
			const di = x + y * dro
			dTiles[di] = sTiles[si]
		}
	}
	tilemap.tiles = dTiles
	tilemap.width = width
	tilemap.height = height
	tilemap.changed = true
	this.marquee.resize()
}

// 设置目标对象
Scene.setTarget = function (target) {
	if (this.target !== target) {
		if (
			target !== null &&
			this.tilemap !== null &&
			this.tilemap !== target
		) {
			this.closeTilemap()
		}
		this.target = target
		this.updateTargetInfo()
		this.updateTargetItem()
		this.requestRendering()
		if (target) {
			const map = this.inspectorTypeMap
			const key = map[target.class]
			Inspector.open(key, target)
		} else {
			Inspector.close()
		}
	}
}

// 打开瓦片地图
Scene.openTilemap = function (tilemap) {
	if (tilemap instanceof Object && this.tilemap !== tilemap) {
		this.closeTilemap(false)
		this.tilemap = tilemap
		this.tilemap.element?.addClass('highlight')
		if (this.tilemap.shortcut !== 0) {
			TilemapShortcuts.elements[this.tilemap.shortcut].addClass(
				'selected'
			)
		}
		this.switchLayer('tilemap')
		this.computeActiveTilemapId()
		this.requestRendering()
		this.marquee.resize()
	}
}

// 关闭瓦片地图
Scene.closeTilemap = function (back = true) {
	if (this.tilemap !== null) {
		this.tilemap.element?.removeClass('highlight')
		if (this.tilemap.shortcut !== 0) {
			TilemapShortcuts.elements[this.tilemap.shortcut].removeClass(
				'selected'
			)
		}
		this.tilemap = null
		if (back) {
			this.switchLayer('object')
			this.computeActiveTilemapId()
		}
	}
}

// 计算激活的瓦片地图ID
Scene.computeActiveTilemapId = function () {
	const { tilemap } = this
	switch (tilemap?.layer) {
		case 'background':
			this.activeTilemapId = this.backgrounds.indexOf(tilemap)
			break
		case 'foreground':
			this.activeTilemapId = this.foregrounds.indexOf(tilemap) | 0x20000
			break
		case 'object':
			this.activeTilemapId = this.doodads.indexOf(tilemap) | 0x10000
			break
		default:
			this.activeTilemapId = -1
			break
	}
}

// 显示目标对象
Scene.revealTarget = (function IIFE() {
	const timer = new Timer({
		duration: 200,
		update: (timer) => {
			const { target } = timer
			if (target === Scene.target) {
				const easing = Easing.EasingMap.easeInOut
				const time = easing.map(timer.elapsed / timer.duration)
				const x = timer.startX * (1 - time) + timer.endX * time
				const y = timer.startY * (1 - time) + timer.endY * time
				const screen = Scene.screen
				const sl = screen.scrollLeft
				const st = screen.scrollTop
				Scene.updateCamera(x, y)
				Scene.updateTransform()
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					Scene.requestRendering()
					Scene.marquee.resize()
					Scene.screen.updateScrollbars()
				}
			} else {
				timer.target = null
				return false
			}
		},
		callback: (timer) => {
			timer.target = null
		}
	})
	return function () {
		const { target, meta } = this
		const toleranceX = 1 / this.scaledTileWidth / this.scaleX
		const toleranceY = 1 / this.scaledTileHeight / this.scaleY
		// 目标和摄像机的位置不一定相等
		if (
			target &&
			!timer.target &&
			(Math.abs(target.x - meta.x) > toleranceX ||
				Math.abs(target.y - meta.y) > toleranceY)
		) {
			timer.target = target
			timer.startX = meta.x
			timer.startY = meta.y
			timer.endX = target.x
			timer.endY = target.y
			timer.elapsed = 0
			timer.add()
		}
	}
})()

// 转移目标对象
Scene.shiftTarget = function (x, y) {
	const target = this.target
	const map = this.inspectorTypeMap
	const key = map[target?.class]
	const editor = Inspector[key]
	if (editor !== undefined && (target.x !== x || target.y !== y)) {
		this.planToSave()
		const history = this.history
		const index = history.index
		const length = history.length
		const record = history[index]
		const type = 'scene-target-shift'
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				target: target,
				x: target.x,
				y: target.y
			})
		}
		target.x = x
		target.y = y
		this.updateTargetInfo()
		this.updateTargetEditor()
		this.requestRendering()
	}
}

// 重定向目标对象
Scene.redirectTarget = function (angle) {
	const target = this.target
	const map = this.inspectorTypeMap
	const key = map[target?.class]
	const editor = Inspector[key]
	if (editor !== undefined && target.angle !== angle) {
		this.planToSave()
		const history = this.history
		const index = history.index
		const length = history.length
		const record = history[index]
		const type = 'scene-target-redirect'
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				target: target,
				angle: target.angle
			})
		}
		this.requestRendering()
		target.angle = angle
		target.player.setAngle(Math.radians(angle))
		if (editor.target === target) {
			editor.write({ angle })
		}
	}
}

// 更新目标对象
Scene.updateTarget = function () {
	let item = this.list.read()
	if (item?.class === 'folder') {
		item = null
	}
	if (item !== this.target) {
		this.setTarget(item)
	}
}

// 更新目标对象信息
Scene.updateTargetInfo = function () {
	if (this.layer === 'object') {
		switch (this.target?.class) {
			case 'tilemap':
			case 'actor':
			case 'region':
			case 'light':
			case 'animation':
			case 'particle':
			case 'parallax': {
				const target = this.target
				const name = target.name
				const x = Math.floor(target.x)
				const y = Math.floor(target.y)
				this.info.textContent = `${name} ${x},${y}`
				break
			}
			default: {
				const marquee = this.marquee
				const event = marquee.pointerevent
				if (event instanceof PointerEvent) {
					const { x, y } = this.getTileCoords(event, true)
					const sw = this.width
					const sh = this.height
					if (x >= 0 && x < sw && y >= 0 && y < sh) {
						if (
							x !== marquee.x ||
							y !== marquee.y ||
							!marquee.visible
						) {
							marquee.selectInObjectMode(x, y)
						}
					} else {
						marquee.clear()
					}
				} else {
					marquee.clear()
				}
				break
			}
		}
	}
}

// 更新目标对象列表项
Scene.updateTargetItem = function () {
	const { target } = this
	if (target !== null) {
		const { list } = this
		if (list.read() !== target) {
			list.selectWithNoEvent(target)
			if (target) {
				list.expandToSelection()
				list.scrollToSelection()
			}
		}
	}
}

// 更新目标对象编辑器
Scene.updateTargetEditor = function () {
	const target = this.target
	const map = this.inspectorTypeMap
	const key = map[target?.class]
	const editor = Inspector[key]
	if (editor !== undefined && editor.target === target) {
		editor.write({
			x: target.x,
			y: target.y
		})
	}
}

// 更新动画播放间隔
Scene.updateAnimationInterval = function () {
	const { animationInterval } = Data.config.scene
	if (this.animationInterval !== animationInterval) {
		if (animationInterval === 0 && this.animationFrame !== 0) {
			this.animationFrame = 0
			this.requestRendering()
		}
		this.animationElapsed = 0
		this.animationInterval = animationInterval
	}
}

// 更新光照区域扩充
Scene.updateLightAreaExpansion = function (last) {
	if (this.showLight) {
		const light = Data.config.lightArea
		if (
			last.expansionLeft !== light.expansionLeft ||
			last.expansionTop !== light.expansionTop ||
			last.expansionRight !== light.expansionRight ||
			last.expansionBottom !== light.expansionBottom
		) {
			GL.reflectedLightMap.innerWidth = 0
			GL.reflectedLightMap.paddingLeft = undefined
			GL.resizeLightMap()
			this.updateLightTexParameters()
			this.updateTransform()
			this.requestRendering()
		}
	}
}

// 更新角色队伍
Scene.updateActorTeams = function () {
	const list = this.list
	for (const actor of this.actors) {
		list.updateIcon(actor)
	}
}

// 更新头部位置
Scene.updateHead = function () {
	const { page, head } = this
	if (page.clientWidth !== 0) {
		// 调整左边位置
		const { nav } = Layout.getGroupOfElement(head)
		const nRect = nav.rect()
		const iRect = nav.lastChild.rect()
		const left = iRect.right - nRect.left
		if (head.left !== left) {
			head.left = left
			head.style.left = `${left}px`
		}
		// 调整居中组件的位置
		const width = nRect.right - iRect.right
		if (head.width !== width) {
			head.width = width
			const [start, center, end] = head.children
			end.style.marginLeft = ''
			const sRect = start.rect()
			const cRect = center.rect()
			const eRect = end.rect()
			const spacing = eRect.left - sRect.right - cRect.width
			const difference = sRect.right - nRect.left - eRect.width
			const margin = Math.min(spacing, difference)
			end.style.marginLeft = `${margin}px`
		}
	}
}

// 调整大小
Scene.resize = function () {
	if (this.state === 'open' && this.screen.clientWidth !== 0) {
		const scale = this.scale
		const scaledPadding = Math.round(this.padding * scale)
		const scaledTileWidth = Math.round(this.tileWidth * scale)
		const scaledTileHeight = Math.round(this.tileHeight * scale)
		const innerWidth = this.width * scaledTileWidth
		const innerHeight = this.height * scaledTileHeight
		const screenBox = CSS.getDevicePixelContentBoxSize(this.screen)
		const screenWidth = screenBox.width
		const screenHeight = screenBox.height
		const paddingLeft = Math.max(
			(screenWidth - innerWidth) >> 1,
			scaledPadding
		)
		const paddingTop = Math.max(
			(screenHeight - innerHeight) >> 1,
			scaledPadding
		)
		const paddingRight = Math.max(
			screenWidth - innerWidth - paddingLeft,
			scaledPadding
		)
		const paddingBottom = Math.max(
			screenHeight - innerHeight - paddingTop,
			scaledPadding
		)
		const outerWidth = innerWidth + paddingLeft + paddingRight
		const outerHeight = innerHeight + paddingTop + paddingBottom
		const dpr = window.devicePixelRatio
		this.scaleX = scaledTileWidth / this.tileWidth
		this.scaleY = scaledTileHeight / this.tileHeight
		this.scaledTileWidth = scaledTileWidth
		this.scaledTileHeight = scaledTileHeight
		this.aspectRatio = scaledTileWidth / scaledTileHeight
		this.outerWidth = outerWidth
		this.outerHeight = outerHeight
		this.centerOffsetX =
			outerWidth > screenWidth
				? screenWidth / 2
				: paddingLeft + innerWidth / 2
		this.centerOffsetY =
			outerHeight > screenHeight
				? screenHeight / 2
				: paddingTop + innerHeight / 2
		this.paddingLeft = paddingLeft
		this.paddingTop = paddingTop
		this.marquee.style.width = `${outerWidth / dpr}px`
		this.marquee.style.height = `${outerHeight / dpr}px`
		GL.resize(screenWidth, screenHeight)
		GL.resizeLightMap()
		this.updateLightTexParameters()
		this.updateCamera()
		this.updateTransform()
		this.marquee.resize()
		this.screen.updateScrollbars()
	}
}

// 获取图块坐标
Scene.getTileCoords = (function IIFE() {
	const point = { x: 0, y: 0 }
	return function (event, integer = false) {
		const coords = event.getRelativeCoords(this.marquee)
		const stw = this.scaledTileWidth
		const sth = this.scaledTileHeight
		const dpr = window.devicePixelRatio
		let sx = coords.x * dpr - this.paddingLeft
		let sy = coords.y * dpr - this.paddingTop
		if (this.layer === 'tilemap') {
			const context = this.getGridContext()
			sx -= context.offsetX * this.scaleX
			sy -= context.offsetY * this.scaleY
		}
		let x = sx / stw
		let y = sy / sth
		if (integer) {
			x = Math.floor(x)
			y = Math.floor(y)
		}
		point.x = x
		point.y = y
		return point
	}
})()

// 获取转换的坐标
Scene.getConvertedCoords = (function IIFE() {
	const point = { x: 0, y: 0 }
	// 返回可独立调用的箭头函数
	return (tile) => {
		point.x = tile.x * Scene.tileWidth
		point.y = tile.y * Scene.tileHeight
		return point
	}
})()

// 获取视差图锚点
Scene.getParallaxAnchor = (function IIFE() {
	const point = { x: 0, y: 0 }
	return function (parallax, tiled = false) {
		const tw = this.tileWidth
		const th = this.tileHeight
		const cx = this.scrollCenterX
		const cy = this.scrollCenterY
		const px = parallax.x * tw
		const py = parallax.y * th
		const fx = parallax.parallaxFactorX
		const fy = parallax.parallaxFactorY
		const ax = cx + fx * (px - cx)
		const ay = cy + fy * (py - cy)
		if (tiled) {
			point.x = ax / tw
			point.y = ay / th
		} else {
			point.x = ax
			point.y = ay
		}
		return point
	}
})()

// 获取网格上下文对象
Scene.getGridContext = (function IIFE() {
	const context = { width: 0, height: 0, offsetX: 0, offsetY: 0 }
	return function () {
		if (this.layer === 'tilemap') {
			const tilemap = this.tilemap
			const anchor = this.getParallaxAnchor(tilemap)
			const tw = this.tileWidth
			const th = this.tileHeight
			const mw = tilemap.width
			const mh = tilemap.height
			const ox = tilemap.offsetX
			const oy = tilemap.offsetY
			const ax = tilemap.anchorX * mw * tw
			const ay = tilemap.anchorY * mh * th
			context.width = mw
			context.height = mh
			context.offsetX = anchor.x - ax + ox
			context.offsetY = anchor.y - ay + oy
		} else {
			context.width = this.width
			context.height = this.height
			context.offsetX = 0
			context.offsetY = 0
		}
		return context
	}
})()

// 光栅化滚动位置 - 对齐到像素
// 避免瓦片地图视差模式下图块|网格|选框位置不同步的现象
Scene.rasterizeScrollPosition = (function IIFE() {
	const scroll = { left: 0, top: 0, right: 0, bottom: 0 }
	return function (ox, oy) {
		const sx = this.scaleX
		const sy = this.scaleY
		const sl = this.scrollLeft
		const st = this.scrollTop
		const sr = this.scrollRight
		const sb = this.scrollBottom
		scroll.left = Math.round((sl + ox) * sx) / sx
		scroll.top = Math.round((st + oy) * sy) / sy
		scroll.right = scroll.left + sr - sl
		scroll.bottom = scroll.top + sb - st
		return scroll
	}
})()

// 更新光影纹理参数
Scene.updateLightTexParameters = function () {
	const light = Data.config.lightArea
	const texture = GL.reflectedLightMap
	const scaleX = this.scaleX
	const scaleY = this.scaleY
	if (texture.scaleX !== scaleX || texture.scaleY !== scaleY) {
		texture.scaleX = scaleX
		texture.scaleY = scaleY
		const { ceil, min } = Math
		const pl = texture.paddingLeft
		const pt = texture.paddingTop
		const pr = texture.paddingRight
		const pb = texture.paddingBottom
		const el = ceil(min(light.expansionLeft * scaleX, pl))
		const et = ceil(min(light.expansionTop * scaleY, pt))
		const er = ceil(min(light.expansionRight * scaleX, pr))
		const eb = ceil(min(light.expansionBottom * scaleY, pb))
		texture.expansionLeft = el / scaleX
		texture.expansionTop = et / scaleY
		texture.expansionRight = er / scaleX
		texture.expansionBottom = eb / scaleY
		texture.maxExpansionLeft = pl / scaleX
		texture.maxExpansionTop = pt / scaleY
		texture.maxExpansionRight = pr / scaleX
		texture.maxExpansionBottom = pb / scaleY
		texture.clipX = pl - el
		texture.clipY = pt - et
		texture.clipWidth = GL.width + el + er
		texture.clipHeight = GL.height + et + eb
	}
}

// 更新摄像机位置
Scene.updateCamera = function (x = this.meta.x, y = this.meta.y) {
	const dpr = window.devicePixelRatio
	const screen = this.screen
	const scrollX = x * this.scaledTileWidth + this.paddingLeft
	const scrollY = y * this.scaledTileHeight + this.paddingTop
	const toleranceX = this.scaledTileWidth * 0.0001
	const toleranceY = this.scaledTileHeight * 0.0001
	screen.rawScrollLeft =
		Math.clamp(
			scrollX - this.centerOffsetX,
			0,
			this.outerWidth - GL.width
		) / dpr
	screen.rawScrollTop =
		Math.clamp(
			scrollY - this.centerOffsetY,
			0,
			this.outerHeight - GL.height
		) / dpr
	screen.scrollLeft = (scrollX - (GL.width >> 1) + toleranceX) / dpr
	screen.scrollTop = (scrollY - (GL.height >> 1) + toleranceY) / dpr
}

// 更新变换参数
Scene.updateTransform = function () {
	const dpr = window.devicePixelRatio
	const screen = this.screen
	const left = Math.roundTo(screen.scrollLeft * dpr - this.paddingLeft, 4)
	const top = Math.roundTo(screen.scrollTop * dpr - this.paddingTop, 4)
	const right = left + GL.width
	const bottom = top + GL.height
	const scaleX = this.scaleX
	const scaleY = this.scaleY
	const lightmap = GL.reflectedLightMap
	this.scrollLeft = left / scaleX
	this.scrollTop = top / scaleY
	this.scrollRight = right / scaleX
	this.scrollBottom = bottom / scaleY
	this.scrollCenterX = (this.scrollLeft + this.scrollRight) / 2
	this.scrollCenterY = (this.scrollTop + this.scrollBottom) / 2
	this.lightLeft = this.scrollLeft - lightmap.expansionLeft
	this.lightTop = this.scrollTop - lightmap.expansionTop
	this.lightRight = this.scrollRight + lightmap.expansionRight
	this.lightBottom = this.scrollBottom + lightmap.expansionBottom
	this.matrix
		.reset()
		.scale(scaleX, scaleY)
		.translate(-this.scrollLeft, -this.scrollTop)
	const scrollX = screen.rawScrollLeft * dpr + this.centerOffsetX
	const scrollY = screen.rawScrollTop * dpr + this.centerOffsetY
	this.meta.x = Math.roundTo(
		(scrollX - this.paddingLeft) / this.scaledTileWidth,
		4
	)
	this.meta.y = Math.roundTo(
		(scrollY - this.paddingTop) / this.scaledTileHeight,
		4
	)
	Data.manifest.changed = true
}

// 注册预设对象
Scene.registerPreset = (function IIFE() {
	const generatePresetId = () => {
		const { scenePresets } = Data
		let id
		do {
			id = GUID.generate64bit()
		} while (id in scenePresets)
		return id
	}
	const registerPreset = (node) => {
		const { scenePresets } = Data
		// 新对象或对象ID冲突，生成新ID
		if (node.presetId === '' || node.presetId in scenePresets) {
			node.presetId = generatePresetId()
		}
		scenePresets[node.presetId] = {
			sceneId: Scene.meta.guid,
			data: node
		}
		if (node.children instanceof Array) {
			for (const child of node.children) {
				registerPreset(child)
			}
		}
	}
	return function (node) {
		registerPreset(node)
	}
})()

// 取消注册预设对象
Scene.unregisterPreset = function (node) {
	delete Data.scenePresets[node.presetId]
	if (node.children instanceof Array) {
		for (const child of node.children) {
			Scene.unregisterPreset(child)
		}
	}
}

// 排序图层
Scene.sortLayers = (function IIFE() {
	const sorter = (a, b) => a.order - b.order
	return function () {
		this.backgrounds.sort(sorter)
		this.foregrounds.sort(sorter)
		this.doodads.sort(sorter)
	}
})()

// 加载对象
Scene.loadObjects = function () {
	const actors = this.actors
	const regions = this.regions
	const lights = this.lights
	const animations = this.animations
	const particles = this.particles
	const parallaxes = this.parallaxes
	const tilemaps = this.tilemaps
	const backgrounds = this.backgrounds
	const foregrounds = this.foregrounds
	const doodads = this.doodads
	let tilemapIndex = 0
	let actorIndex = 0
	let regionIndex = 0
	let lightIndex = 0
	let animationIndex = 0
	let parallaxIndex = 0
	let particleIndex = 0
	let backgroundIndex = 0
	let foregroundIndex = 0
	let doodadIndex = 0
	const layerLoaders = {
		background: (node) => {
			backgrounds[backgroundIndex++] = node
		},
		foreground: (node) => {
			foregrounds[foregroundIndex++] = node
		},
		object: (node) => {
			doodads[doodadIndex++] = node
		}
	}
	const loaders = {
		folder: (node) => load(node.children),
		actor: (node) => (actors[actorIndex++] = node),
		region: (node) => (regions[regionIndex++] = node),
		light: (node) => (lights[lightIndex++] = node),
		animation: (node) => (animations[animationIndex++] = node),
		particle: (node) => (particles[particleIndex++] = node),
		parallax: (node) => {
			parallaxes[parallaxIndex++] = node
			layerLoaders[node.layer](node)
		},
		tilemap: (node) => {
			tilemaps[tilemapIndex++] = node
			layerLoaders[node.layer](node)
		}
	}
	const load = (nodes) => {
		const length = nodes.length
		for (let i = 0; i < length; i++) {
			const node = nodes[i]
			loaders[node.class](node)
		}
	}
	load(this.objects)
	if (tilemaps.length !== tilemapIndex) {
		tilemaps.length = tilemapIndex
	}
	if (actors.length !== actorIndex) {
		actors.length = actorIndex
	}
	if (regions.length !== regionIndex) {
		regions.length = regionIndex
	}
	if (lights.length !== lightIndex) {
		lights.length = lightIndex
	}
	if (animations.length !== animationIndex) {
		animations.length = animationIndex
	}
	if (particles.length !== particleIndex) {
		particles.length = particleIndex
	}
	if (parallaxes.length !== parallaxIndex) {
		parallaxes.length = parallaxIndex
	}
	if (backgrounds.length !== backgroundIndex) {
		backgrounds.length = backgroundIndex
	}
	if (foregrounds.length !== foregroundIndex) {
		foregrounds.length = foregroundIndex
	}
	if (doodads.length !== doodadIndex) {
		doodads.length = doodadIndex
	}
	this.sortLayers()
	this.computeActiveTilemapId()
}

// 加载图块纹理
Scene.loadTextures = async function () {
	if (this.state === 'closed') return
	const promises = []
	const textures = this.textures
	const tilesets = Data.tilesets
	const templates = Data.autotiles.map
	for (const tilemap of this.tilemaps) {
		const { tiles, tilesetMap } = tilemap
		const length = tiles.length
		for (let i = 0; i < length; i++) {
			const tile = tiles[i]
			if (tile !== 0) {
				const guid = tilesetMap[tile >> 24]
				const tileset = tilesets[guid]
				if (tileset !== undefined) {
					switch (tileset.type) {
						case 'normal': {
							const guid = tileset.image
							if (textures[guid] === undefined) {
								promises.push(textures.load(guid))
							}
							break
						}
						case 'auto': {
							const tx = (tile >> 8) & 0xff
							const ty = (tile >> 16) & 0xff
							const id = tx + ty * tileset.width
							const autoTile = tileset.tiles[id]
							// autoTile的值可能是0|undefined
							if (
								autoTile &&
								textures[autoTile.image] === undefined &&
								templates[autoTile.template] !== undefined
							) {
								promises.push(textures.load(autoTile.image))
							}
							break
						}
					}
				}
			}
		}
	}
	const symbol = (this.symbol = Symbol())
	if (promises.length > 0) {
		await Promise.all(promises)
	}
	if (this.symbol === symbol) {
		this.symbol = null
		this.state = 'open'
		this.body.show()
		this.resize()
		this.requestAnimation()
		this.requestRendering()
		if (
			Window.frames.length === 0 &&
			document.activeElement === document.body
		) {
			this.screen.focus()
		}
	}
}

// 加载所有上下文
Scene.loadAllContexts = function () {
	for (const actor of this.actors) {
		this.loadActorContext(actor)
	}
	for (const light of this.lights) {
		this.loadLightContext(light)
	}
	for (const animation of this.animations) {
		this.loadAnimationContext(animation)
	}
	for (const particle of this.particles) {
		this.loadParticleContext(particle)
	}
	for (const parallax of this.parallaxes) {
		this.loadParallaxContext(parallax)
	}
}

// 加载角色上下文
Scene.loadActorContext = function (actor) {
	if (actor.player) {
		actor.player.destroy()
		delete actor.player
	}
	const actorId = actor.actorId
	const data = Data.actors[actorId]
	if (data !== undefined) {
		Object.defineProperty(actor, 'data', {
			configurable: true,
			value: data
		})
		const { animationId } = data
		const animation = Data.animations[animationId]
		if (animation !== undefined) {
			const player = new Animation.Player(animation)
			// 加载精灵哈希表
			const images = {}
			const sprites = data.sprites
			const length = sprites.length
			for (let i = 0; i < length; i++) {
				const sprite = sprites[i]
				images[sprite.id] = sprite.image
			}
			player.scale = actor.scale * data.scale
			player.rotatable = data.rotatable
			player.setSpriteImages(images)
			player.setMotion(data.idleMotion)
			player.setAngle(Math.radians(actor.angle))
			Object.defineProperty(actor, 'player', {
				configurable: true,
				value: player
			})
			return
		}
	}

	// 设置默认参数
	Object.defineProperty(actor, 'player', {
		configurable: true,
		value: this.createDefaultAnimation(actor)
	})
}

// 加载光源上下文
Scene.loadLightContext = function (light) {
	Object.defineProperty(light, 'instance', {
		configurable: true,
		value: new Light(light)
	})
}

// 加载动画上下文
Scene.loadAnimationContext = function (animation) {
	if (animation.player) {
		animation.player.destroy()
		delete animation.player
	}
	const animationId = animation.animationId
	const data = Data.animations[animationId]
	if (data !== undefined) {
		Object.defineProperty(animation, 'data', {
			configurable: true,
			value: data
		})
		const player = new Animation.Player(data)
		player.scale = animation.scale
		player.speed = animation.speed
		player.opacity = animation.opacity
		player.rotatable = animation.rotatable
		player.setMotion(animation.motion)
		player.setAngle(Math.radians(animation.angle))
		Object.defineProperty(animation, 'player', {
			configurable: true,
			value: player
		})
		return
	}

	// 设置默认参数
	Object.defineProperty(animation, 'player', {
		configurable: true,
		value: this.createDefaultAnimation(animation)
	})
}

// 加载视差图上下文
Scene.loadParallaxContext = function (parallax) {
	if (parallax.player) {
		parallax.player.destroy()
		delete parallax.player
	}
	Object.defineProperty(parallax, 'player', {
		configurable: true,
		value: new Parallax(parallax)
	})
}

// 加载粒子上下文
Scene.loadParticleContext = function (particle) {
	if (particle.emitter) {
		particle.emitter.destroy()
		delete particle.emitter
	}
	const data = Data.particles[particle.particleId]
	if (data !== undefined) {
		const emitter = new Particle.Emitter(data)
		emitter.bounding = emitter.calculateOuterRect()
		emitter.angle = Math.radians(particle.angle)
		emitter.scale = particle.scale
		emitter.speed = particle.speed
		emitter.opacity = particle.opacity
		Object.defineProperty(particle, 'emitter', {
			configurable: true,
			value: emitter
		})
	}
}

// 加载对象上下文
Scene.loadObjectContext = function (object) {
	switch (object.class) {
		case 'actor':
			this.loadActorContext(object)
			break
		case 'light':
			this.loadLightContext(object)
			break
		case 'animation':
			this.loadAnimationContext(object)
			break
		case 'particle':
			this.loadParticleContext(object)
			break
		case 'parallax':
			this.loadParallaxContext(object)
			break
		case 'tilemap':
			if (object.shortcut !== 0) {
				this.tilemaps.shortcuts.update()
			}
			break
	}
}

// 重载对象上下文
Scene.reloadObjectContext = function (object) {
	switch (object.class) {
		case 'folder':
			for (const child of object.children) {
				this.reloadObjectContext(child)
			}
			break
		case 'actor':
			this.loadActorContext(object)
			break
		case 'animation':
			this.loadAnimationContext(object)
			break
		case 'particle':
			this.loadParticleContext(object)
			break
		case 'parallax':
			this.loadParallaxContext(object)
			break
		case 'tilemap':
			if (object.shortcut !== 0) {
				this.tilemaps.shortcuts.update()
			}
			break
	}
}

// 销毁对象上下文
Scene.destroyObjectContext = function (object) {
	switch (object.class) {
		case 'folder':
			for (const child of object.children) {
				this.destroyObjectContext(child)
			}
			break
		case 'actor':
			object.player.destroy()
			delete object.player
			break
		case 'animation':
			object.player.destroy()
			delete object.player
			break
		case 'particle':
			object.emitter?.destroy()
			delete object.emitter
			break
		case 'parallax':
			object.player.destroy()
			delete object.player
			break
		case 'tilemap':
			if (this.tilemap === object) {
				this.closeTilemap()
			}
			if (object.shortcut !== 0) {
				this.tilemaps.shortcuts.update()
			}
			break
	}
}

// 创建预览对象
Scene.createPreviewObject = function (file) {
	if (!this.previewObject) {
		const name = file.basename
		const guid = file.meta.guid
		switch (file.type) {
			case 'actor': {
				const actor = Inspector.sceneActor.create()
				actor.name = name
				actor.actorId = guid
				this.loadActorContext(actor)
				this.actors.push(actor)
				this.previewObject = actor
				break
			}
			case 'animation': {
				const animation = Inspector.sceneAnimation.create()
				const motionId = Data.animations[guid]?.motions[0]?.id ?? ''
				animation.name = name
				animation.animationId = guid
				animation.motion = motionId
				this.loadAnimationContext(animation)
				this.animations.push(animation)
				this.previewObject = animation
				break
			}
			case 'particle': {
				const particle = Inspector.sceneParticle.create()
				particle.name = name
				particle.particleId = guid
				this.loadParticleContext(particle)
				this.particles.push(particle)
				this.previewObject = particle
				break
			}
		}
	}
}

// 删除预览对象
Scene.deletePreviewObject = function () {
	const object = this.previewObject
	if (object) {
		switch (object.class) {
			case 'actor':
				this.actors.remove(object)
				object.player.destroy()
				break
			case 'animation':
				this.animations.remove(object)
				object.player.destroy()
				break
			case 'particle':
				this.particles.remove(object)
				object.emitter?.destroy()
				break
		}
		this.previewObject = null
		this.requestRendering()
	}
}

// 更新视差图
Scene.updateParallaxes = function (deltaTime) {
	for (const parallax of this.parallaxes) {
		if (parallax.hidden) continue
		parallax.player.update(deltaTime)
	}
}

// 绘制场景

window.Scene = Scene
