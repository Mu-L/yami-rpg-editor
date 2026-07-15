'use strict'

// ******************************** 事件编辑器 ********************************

export const EventEditor = {
	// properties
	list: $('#event-open-list'),
	commandList: $('#event-commands'),
	outerGutter: $('#event-commands-gutter-outer'),
	innerGutter: $('#event-commands-gutter-inner'),
	closing: false,
	data: null,
	caches: [],
	types: null,
	// methods
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
	// events
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
}

// list methods
EventEditor.list.lastScrollTop = 0
EventEditor.list.selectIndex = null
EventEditor.list.close = null
EventEditor.list.closeMultiple = null
EventEditor.list.closeBelow = null
EventEditor.list.closeOthers = null
EventEditor.list.closeAll = null
EventEditor.list.saveScroll = null
EventEditor.list.restoreScroll = null
EventEditor.list.defineProperties = null
EventEditor.list.createLocalEventItem = null
EventEditor.list.createGlobalEventItem = null
EventEditor.list.createIcon = null
EventEditor.list.updateItemClass = null
EventEditor.list.createIcon = null
EventEditor.list.createInitText = null
EventEditor.list.updateInitText = null
EventEditor.list.updateItemName = null
EventEditor.list.closeButtonClick = null

// 初始化
EventEditor.initialize = function () {
	// 绑定打开事件列表
	const { list } = this
	list.removable = true
	list.foldable = false
	list.bind(() => this.data)
	list.updaters.push(list.updateItemClass)
	list.creators.push(list.createInitText)
	list.creators.push(list.updateInitText)

	// 创建事件类型选项
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
	}
	this.types = {
		all: Object.values(types),
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
	}

	// 设置指令列表的内部高度
	const INNER_HEIGHT = 600
	Object.defineProperty(this.commandList, 'innerHeight', {
		configurable: true,
		value: INNER_HEIGHT
	})

	// 设置行号列表和指令列表的底部填充高度
	const PADDING_BOTTOM = INNER_HEIGHT - 20
	this.commandList.style.paddingBottom = `${PADDING_BOTTOM + 10}px`
	this.innerGutter.style.paddingBottom = `${PADDING_BOTTOM}px`

	// 侦听事件
	window.on('localize', this.windowLocalize)
	$('#event').on('close', this.windowClose)
	$('#event').on('closed', this.windowClosed)
	$('#event').on('resize', this.windowResize)
	this.list.on('pointerdown', this.listPointerdown, { capture: true })
	this.list.on('select', this.listSelect)
	this.list.on('popup', this.listPopup)
	$('#event-type').on('input', this.typeInput)
	$('#event-commands').on('change', this.commandListChange)
	this.commandList.on('update', this.commandListUpdate)
	this.commandList.on('scroll', this.commandListScroll)
	$('#event-confirm').on('click', this.confirm)
	$('#event-apply').on('click', this.apply)
}

// 打开本地事件
EventEditor.openLocalEvent = function (
	inserting,
	filter,
	name,
	event,
	callback
) {
	this.unpackOpenEvents()
	Window.open('event')
	window.on('keydown', this.windowKeydown)

	// 查询项目并更新列表
	const list = this.list
	const item = list.createLocalEventItem(
		inserting,
		filter,
		name,
		event,
		callback
	)
	list.addNodeTo(item, null)
	list.update()
	list.select(item)
	list.restoreScroll()
	list.scrollToSelection('middle')

	// 列表获得焦点
	list.getFocus()
	return item
}

// 打开数据
EventEditor.openGlobalEvent = function (guid) {
	if (!Window.isWindowOpen('event')) {
		this.unpackOpenEvents()
		Window.open('event')
		window.on('keydown', this.windowKeydown)
	} else if (this.list.read()?.id === guid) {
		return
	}

	// 查询项目并更新列表
	const list = this.list
	const item = this.getItemById(guid)
	if (item) {
		list.initialize()
		list.select(item)
		list.expandToSelection(false)
		list.update()
		list.restoreScroll()
	} else {
		const item = list.createGlobalEventItem(guid)
		list.addNodeTo(item, null)
		list.update()
		list.select(item)
		list.restoreScroll()
	}
	list.scrollToSelection('middle')

	// 列表获得焦点
	list.getFocus()
}

// 打开相关事件
EventEditor.openRelatedEvents = function (contexts) {
	const list = this.list
	const items = []
	this.clearRelatedEventClasses(...this.data)
	for (const context of contexts) {
		let item
		if (context.filter === 'global') {
			const { id } = context
			item = this.getItemById(id)
			if (!item) {
				item = list.createGlobalEventItem(id)
				TreeList.createParents([item], null)
				this.data.push(item)
			}
		} else {
			const { filter, name, event } = context
			item = this.getItemByEvent(event)
			if (!item) {
				item = list.createLocalEventItem(
					false,
					filter,
					name,
					event,
					null
				)
				TreeList.createParents([item], null)
				this.data.push(item)
			}
		}
		items.push(item)
	}
	if (items.length !== 0) {
		list.update()
		let index = Infinity
		for (const item of items) {
			item.element.addClass('related-event')
			index = Math.min(index, this.data.indexOf(item))
		}
		list.unselect()
		list.selectIndex(index)
		list.scrollToSelection('middle')
	}
}

// 查找相关事件
EventEditor.findRelatedEvents = function (eventId) {
	const guidMap = Data.manifest.guidMap
	const references = []
	const find = (event) => {
		for (const command of event.commands) {
			switch (command.id) {
				case 'callEvent':
				case '!callEvent':
					if (
						command.params.type === 'global' &&
						command.params.eventId === eventId
					) {
						return true
					}
					break
			}
		}
		return false
	}
	for (const [id, event] of Object.entries(Data.events)) {
		if (find(event)) {
			references.push({
				filter: 'global',
				id: id
			})
		}
	}
	for (const [id, actor] of Object.entries(Data.actors)) {
		for (const event of actor.events) {
			if (find(event)) {
				references.push({
					filter: 'actor',
					name: guidMap[id]?.file.basename,
					event: event
				})
			}
		}
	}
	for (const [id, skill] of Object.entries(Data.skills)) {
		for (const event of skill.events) {
			if (find(event)) {
				references.push({
					filter: 'skill',
					name: guidMap[id]?.file.basename,
					event: event
				})
			}
		}
	}
	for (const [id, trigger] of Object.entries(Data.triggers)) {
		for (const event of trigger.events) {
			if (find(event)) {
				references.push({
					filter: 'trigger',
					name: guidMap[id]?.file.basename,
					event: event
				})
			}
		}
	}
	for (const [id, item] of Object.entries(Data.items)) {
		for (const event of item.events) {
			if (find(event)) {
				references.push({
					filter: 'item',
					name: guidMap[id]?.file.basename,
					event: event
				})
			}
		}
	}
	for (const [id, equipment] of Object.entries(Data.equipments)) {
		for (const event of equipment.events) {
			if (find(event)) {
				references.push({
					filter: 'equipment',
					name: guidMap[id]?.file.basename,
					event: event
				})
			}
		}
	}
	for (const [id, state] of Object.entries(Data.states)) {
		for (const event of state.events) {
			if (find(event)) {
				references.push({
					filter: 'state',
					name: guidMap[id]?.file.basename,
					event: event
				})
			}
		}
	}
	for (const preset of Object.values(Data.scenePresets)) {
		for (const event of preset.data.events) {
			if (find(event)) {
				const rootName = guidMap[preset.sceneId]?.file.basename
				references.push({
					filter: preset.data.class,
					name: `${rootName}.${preset.data.name}`,
					event: event
				})
			}
		}
	}
	for (const preset of Object.values(Data.uiPresets)) {
		for (const event of preset.data.events) {
			if (find(event)) {
				const rootName = guidMap[preset.uiId]?.file.basename
				references.push({
					filter: 'element',
					name: `${rootName}.${preset.data.name}`,
					event: event
				})
			}
		}
	}
	this.openRelatedEvents(references)
}

// 获取所有本地事件
EventEditor.getAllLocalEvents = function () {
	const listMap = {}
	for (const [id, actor] of Object.entries(Data.actors)) {
		if (actor.events.length !== 0) {
			listMap[id] = actor.events
		}
	}
	for (const [id, skill] of Object.entries(Data.skills)) {
		if (skill.events.length !== 0) {
			listMap[id] = skill.events
		}
	}
	for (const [id, trigger] of Object.entries(Data.triggers)) {
		if (trigger.events.length !== 0) {
			listMap[id] = trigger.events
		}
	}
	for (const [id, item] of Object.entries(Data.items)) {
		if (item.events.length !== 0) {
			listMap[id] = item.events
		}
	}
	for (const [id, equipment] of Object.entries(Data.equipments)) {
		if (equipment.events.length !== 0) {
			listMap[id] = equipment.events
		}
	}
	for (const [id, state] of Object.entries(Data.states)) {
		if (state.events.length !== 0) {
			listMap[id] = state.events
		}
	}
	for (const [id, scene] of Object.entries(Data.scenes)) {
		if (scene.events.length !== 0) {
			listMap[id] = scene.events.slice()
		}
	}
	for (const { sceneId, data } of Object.values(Data.scenePresets)) {
		if (data.events.length !== 0) {
			;(listMap[sceneId] ??= []).push(...data.events)
		}
	}
	for (const { uiId, data } of Object.values(Data.uiPresets)) {
		if (data.events.length !== 0) {
			;(listMap[uiId] ??= []).push(...data.events)
		}
	}
	return listMap
}

// 清除所有事件标记类名
EventEditor.clearAllEventClasses = function (...items) {
	for (const item of items) {
		item.element.removeClass('local-event')
		item.element.removeClass('global-event')
		item.element.removeClass('related-event')
	}
}

// 清除相关事件标记类名
EventEditor.clearRelatedEventClasses = function (...items) {
	for (const item of items) {
		item.element.removeClass('related-event')
	}
}

// 保存数据
EventEditor.save = function (item) {
	const commands = item.commands
	commands.history.saveState()
	this.appendCommandsToCaches(commands)
	const commandsClone = Object.clone(commands)
	Object.defineProperty(commandsClone, 'symbol', {
		configurable: true,
		value: commands.symbol
	})
	return {
		type: item.type,
		enabled: item.event.enabled,
		commands: commandsClone
	}
}

// 判断是否已改变
EventEditor.isChanged = function () {
	for (const item of this.data) {
		if (item.changed) {
			return true
		}
	}
	return false
}

// 获取ID匹配的项目
EventEditor.getItemById = function (id) {
	const items = this.data
	const length = items.length
	for (let i = 0; i < length; i++) {
		const item = items[i]
		if (item.id === id) {
			return item
		}
	}
	return undefined
}

// 获取事件匹配的项目
EventEditor.getItemByEvent = function (event) {
	const items = this.data
	const length = items.length
	for (let i = 0; i < length; i++) {
		const item = items[i]
		if (item.event === event) {
			return item
		}
	}
	return undefined
}

// 打开指令列表
EventEditor.openCommandList = function (item) {
	// 获取指令缓存
	this.fetchCommandBuffer(item)
	$('#event-commands-fieldset').show()
	$('#event-type').show()

	const { commands, filter } = item

	// 创建类型选项
	$('#event-type').loadItems(
		Enum.getMergedItems(this.types[filter], filter + '-event')
	)

	// 创建类型工具提示
	$('#event-type').createTooltip()

	// 写入数据
	const write = getElementWriter('event')
	write('commands', commands)
	write('type', item.type)
}

// 关闭指令列表
EventEditor.closeCommandList = function () {
	this.commandList.clear()
	$('#event-commands-fieldset').hide()
	$('#event-type').hide()
}

// 解包已打开事件列表
EventEditor.unpackOpenEvents = function () {
	const copies = []
	const events = Editor.project.openEvents
	// 移除无效的事件
	let i = events.length
	while (--i >= 0) {
		if (Data.events[events[i].id] === undefined) {
			events.splice(i, 1)
		}
	}
	for (const item of events) {
		if ('name' in item) {
			item.name = EventEditor.getGlobalEventName(item.id)
			EventEditor.list.updateItemName(item)
			copies.push(item)
		} else {
			copies.push(EventEditor.list.createGlobalEventItem(item.id))
		}
	}
	this.data = copies
}

// 打包已打开事件列表
EventEditor.packOpenEvents = function () {
	const copies = []
	for (const item of this.data) {
		if (item.class === 'global') {
			copies.push(item)
		}
	}
	Editor.project.openEvents = copies
}

// 调整行号列表
EventEditor.resizeGutter = function () {
	const { outerGutter, innerGutter } = this
	const height = outerGutter.clientHeight
	if (height !== 0) {
		const length = Math.ceil(height / 20) + 1
		const nodes = innerGutter.childNodes
		let i = nodes.length
		if (i !== length) {
			if (i < length) {
				while (i < length) {
					const node = document.createElement('box')
					node.addClass('event-commands-line-number')
					node.number = -1
					innerGutter.appendChild(node)
					i++
				}
			} else {
				while (--i >= length) {
					nodes[i].remove()
				}
			}
		}
	}
}

// 更新行号列表
EventEditor.updateGutter = function (force) {
	const { commandList } = this
	const { scrollTop } = commandList
	const { outerGutter, innerGutter } = EventEditor
	const start = Math.floor(scrollTop / 20) + 1
	const end = commandList.elements.count + 1
	if (innerGutter.start !== start || force) {
		innerGutter.start = start
		const nodes = innerGutter.childNodes
		const length = nodes.length
		for (let i = 0; i < length; i++) {
			const node = nodes[i]
			const number = start + i
			if (number < end) {
				if (node.number !== number) {
					node.number = number
					node.textContent = number.toString()
				}
			} else {
				if (node.number !== -1) {
					node.number = -1
					node.textContent = ''
				} else {
					break
				}
			}
		}
	}
	// 通过容差来消除非1:1时的抖动
	const tolerance = 0.0001
	outerGutter.scrollTop = (scrollTop + tolerance) % 20
}

// 添加指令数据到缓存列表
EventEditor.appendCommandsToCaches = function (commands) {
	const { caches } = this
	if (caches.append(commands) && caches.length > 50) {
		caches.shift()
	}
}

// 获取指令缓存
EventEditor.fetchCommandBuffer = function (item) {
	if (item.commands) return
	const { event, id } = item
	// 初始化指令数据标记
	const commands = event.commands
	if (!commands.symbol) {
		Object.defineProperty(commands, 'symbol', {
			configurable: true,
			value: Symbol()
		})
	}

	// 获取指令数据缓存
	const symbol = commands.symbol
	let commandsClone = this.caches.find((target) => {
		return target.symbol === symbol
	})

	// 克隆指令数据
	if (!commandsClone) {
		commandsClone = Object.clone(commands)
		Object.defineProperties(commandsClone, {
			symbol: {
				configurable: true,
				value: symbol
			},
			eventId: {
				configurable: true,
				value: id
			}
		})
	}

	item.commands = commandsClone
}

// 清除指令缓存元素
EventEditor.clearCommandBuffers = function () {
	const { commandList } = this
	for (const commands of this.caches) {
		commandList.deleteCommandBuffers(commands)
		const { stack } = commands.history
		const { length } = stack
		for (let i = 0; i < length; i++) {
			const { commands } = stack[i]
			commandList.deleteCommandBuffers(commands)
		}
	}
}

// 获取全局事件名称
EventEditor.getGlobalEventName = function (id) {
	return Data.manifest.guidMap[id]?.file.basename ?? ''
}

// 窗口 - 本地化事件
EventEditor.windowLocalize = function (event) {
	// 更新事件类型选项名称
	const types = EventEditor.types
	const getType = Local.createGetter('eventTypes')
	const getTip = Local.createGetter('eventTips')
	for (const item of types.all) {
		const key = item.value
		const name = getType(key)
		const tip = getTip(key)
		if (name !== '') {
			item.name = name
		}
		if (tip !== '') {
			item.tip = Local.parseTip(tip, name)
		}
	}
	// 更新事件类型相关元素
	for (const selectBox of types.relatedElements) {
		selectBox.createTooltip()
		if (selectBox.read()) {
			selectBox.update()
		}
	}
}

// 窗口 - 关闭事件
EventEditor.windowClose = function (event) {
	this.closing = true
	if (this.isChanged()) {
		event.preventDefault()
		const get = Local.createGetter('confirmation')
		return Window.confirm(
			{
				message: get('closeUnsavedEvent')
			},
			[
				{
					label: get('yes'),
					click: () => {
						// 尝试恢复指令数据
						// 成功则添加到缓存
						// 失败则从缓存中移除
						for (const item of this.data) {
							if (item.changed) {
								item.changed = false
								const commands = item.commands
								if (commands.history.restoreState()) {
									this.appendCommandsToCaches(commands)
								} else {
									this.caches.remove(commands)
									item.commands = null
								}
							}
						}
						Window.close('event')
					}
				},
				{
					label: get('no')
				}
			]
		)
	}
	this.list.saveScroll()
	this.closing = false
}.bind(EventEditor)

// 窗口 - 已关闭事件
EventEditor.windowClosed = function (event) {
	this.clearAllEventClasses(...this.data)
	this.packOpenEvents()
	this.data = null
	this.list.clear()
	this.commandList.clear()
	this.clearCommandBuffers()
	window.off('keydown', this.windowKeydown)
}.bind(EventEditor)

// 窗口 - 调整大小事件
EventEditor.windowResize = function (event) {
	// 设置指令列表的内部高度
	const { list, commandList } = EventEditor
	const parent = commandList.parentNode
	const outerHeight = parent.clientHeight
	const innerHeight = Math.max(outerHeight - 20, 0)
	Object.defineProperty(commandList, 'innerHeight', {
		configurable: true,
		value: innerHeight
	})

	// 设置行号列表和指令列表的底部填充高度
	const { innerGutter } = EventEditor
	const paddingBottom = innerHeight - 20
	commandList.style.paddingBottom = `${paddingBottom + 10}px`
	innerGutter.style.paddingBottom = `${paddingBottom}px`

	// 调整列表
	list.resize()
	commandList.resize()

	// 当使用快捷键滚动到底部并且溢出时再最大化窗口
	// 会触发BUG: 插入指令resize刷新时增加scrollTop
	// 重置scrollTop可以避免这个现象
	// 由于scroll是异步事件因此不会重复触发
	const st = commandList.scrollTop
	commandList.scrollTop = 0
	commandList.scrollTop = st

	// 调整行号列表
	EventEditor.resizeGutter()
	EventEditor.updateGutter(true)
}

// 窗口 - 键盘按下事件
EventEditor.windowKeydown = function (event) {
	if (event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'KeyW':
				if (Window.getTopWindow()?.id === 'event') {
					EventEditor.list.close()
				}
				break
		}
	}
	if (event.altKey) {
		switch (event.code) {
			case 'AltLeft':
				if (Window.getTopWindow()?.id === 'event') {
					EventEditor.list.addClass('alt')
					EventEditor.commandList.addClass('alt')
					window.on('keyup', EventEditor.windowKeyup)
					window.on('pointermove', EventEditor.windowPointermove)
				}
				break
		}
	}
}

// 窗口 - 键盘弹起事件
EventEditor.windowKeyup = function (event) {
	if (!event.altKey) {
		switch (event.code) {
			case 'AltLeft':
				EventEditor.list.removeClass('alt')
				EventEditor.commandList.removeClass('alt')
				window.off('keyup', EventEditor.windowKeyup)
				window.off('pointermove', EventEditor.windowPointermove)
				break
		}
	}
}

// 窗口 - 指针移动事件
// ctrl组合快捷键导致blur无法触发按键弹起事件，补救方法
EventEditor.windowPointermove = function (event) {
	if (!event.altKey) {
		EventEditor.list.removeClass('alt')
		EventEditor.commandList.removeClass('alt')
		window.off('keyup', EventEditor.windowKeyup)
		window.off('pointermove', EventEditor.windowPointermove)
	}
}

// 列表 - 指针按下事件
EventEditor.listPointerdown = function (event) {
	if (event.altKey && event.button === 0) {
		const element = event.target
		if (element.tagName === 'NODE-ITEM') {
			const item = element.item
			if (item.id) {
				// 阻止focus后快捷键不被禁用的情况
				event.preventDefault()
				event.stopImmediatePropagation()
				EventEditor.findRelatedEvents(item.id)
			}
		}
	}
}

// 列表 - 选择事件
EventEditor.listSelect = function (event) {
	const item = event.value
	EventEditor.openCommandList(item)
	if (item.element instanceof HTMLElement) {
		item.element.removeClass('related-event')
	}
}

// 列表 - 菜单弹出事件
EventEditor.listPopup = function (event) {
	const item = event.value
	const selected = !!item
	const get = Local.createGetter('menuEventList')
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
					EventEditor.list.close(item)
				}
			},
			{
				label: get('close-below'),
				enabled: selected,
				click: () => {
					EventEditor.list.closeBelow(item)
				}
			},
			{
				label: get('close-others'),
				enabled: selected,
				click: () => {
					EventEditor.list.closeOthers(item)
				}
			},
			{
				label: get('close-all'),
				enabled: selected,
				click: () => {
					EventEditor.list.closeAll()
				}
			},
			{
				label: get('find-related-events'),
				accelerator: 'Alt+LB',
				enabled: selected && item.id !== '',
				click: () => {
					EventEditor.findRelatedEvents(item.id)
				}
			}
		]
	)
}

// 类型 - 输入事件
EventEditor.typeInput = function (event) {
	const item = EventEditor.list.read()
	if (!item.changed) {
		item.changed = true
		item.name += '*'
	}
	item.type = event.value
	EventEditor.list.updateItemName(item)
}

// 指令列表 - 改变事件
EventEditor.commandListChange = function (event) {
	if (EventEditor.closing) return
	const item = EventEditor.list.read()
	if (!item.changed) {
		item.changed = true
		item.name += '*'
		EventEditor.list.updateItemName(item)
	}
}

// 指令列表 - 更新事件
EventEditor.commandListUpdate = function (event) {
	EventEditor.resizeGutter()
	EventEditor.updateGutter(true)
}

// 指令列表 - 滚动事件
EventEditor.commandListScroll = function (event) {
	EventEditor.updateGutter(false)
}

// 确定按钮 - 鼠标点击事件
EventEditor.confirm = function (event) {
	this.apply()
	Window.close('event')
}.bind(EventEditor)

// 应用按钮 - 鼠标点击事件
EventEditor.apply = function (event) {
	for (const item of this.data) {
		switch (item.class) {
			// 保存全局事件
			case 'global':
				if (item.changed) {
					item.changed = false
					File.planToSave(item.meta)
					const event = item.event
					const save = EventEditor.save(item)
					if (event.type !== save.type) {
						event.type = save.type
						if (Inspector.fileEvent.target === event) {
							Inspector.fileEvent.write({ type: event.type })
						}
					}
					event.commands = save.commands
				}
				break
			// 保存本地事件
			case 'local':
				if (item.changed || item.inserting) {
					item.changed = false
					item.inserting = false
					if (item.callback) {
						item.callback()
					} else {
						const save = EventEditor.save(item)
						item.event.type = save.type
						item.event.commands = save.commands
					}
				}
				break
		}
	}
}.bind(EventEditor)

// 列表 - 选择索引
EventEditor.list.selectIndex = function (index) {
	const elements = this.elements
	const last = elements.count - 1
	const element = elements[Math.min(index, last)]
	if (element instanceof HTMLElement) {
		this.select(element.item)
	}
}

// 列表 - 关闭
EventEditor.list.close = function (item) {
	if (item === undefined) {
		item = this.read()
	}
	if (item) {
		const close = () => {
			const index = this.data.indexOf(item)
			EventEditor.clearAllEventClasses(item)
			this.deleteNode(item)
			EventEditor.closeCommandList()
			// 自动选择下一个列表项
			this.selectIndex(index)
		}
		if (item.changed) {
			const get = Local.createGetter('confirmation')
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
			)
		}
		close()
	}
}

// 列表 - 关闭多个事件
EventEditor.list.closeMultiple = function (items, callback) {
	if (items.length === 0) return
	const closeMultiple = () => {
		for (const item of items) {
			EventEditor.clearAllEventClasses(item)
			this.deleteNode(item)
		}
		callback?.()
	}
	for (const item of items) {
		if (item.changed) {
			const get = Local.createGetter('confirmation')
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
			)
		}
	}
	closeMultiple()
}

// 列表 - 关闭下面的事件
EventEditor.list.closeBelow = function (item) {
	const index = this.data.indexOf(item)
	this.closeMultiple(this.data.slice(index + 1))
}

// 列表 - 关闭其他的事件
EventEditor.list.closeOthers = function (item) {
	const items = this.data.slice()
	items.remove(item)
	this.closeMultiple(items)
}

// 列表 - 关闭全部的事件
EventEditor.list.closeAll = function () {
	const callback = () => EventEditor.closeCommandList()
	this.closeMultiple(this.data.slice(), callback)
}

// 列表 - 保存滚动状态
EventEditor.list.saveScroll = function () {
	this.lastScrollTop = this.scrollTop
}

// 列表 - 恢复滚动状态
EventEditor.list.restoreScroll = function () {
	this.scrollTop = this.lastScrollTop
}

// 列表 - 定义属性
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
	})
}

// 列表 - 创建本地事件项目
EventEditor.list.createLocalEventItem = function (
	inserting,
	filter,
	name,
	event,
	callback
) {
	const item = EventEditor.list.defineProperties({ id: '' })
	item.name = name
	item.class = 'local'
	item.filter = filter
	item.type = event.type
	item.event = event
	item.callback = callback
	item.inserting = inserting
	item.changed = false
	return item
}

// 列表 - 创建全局事件项目
EventEditor.list.createGlobalEventItem = function (guid) {
	const item = EventEditor.list.defineProperties({ id: guid })
	const event = Data.events[guid]
	item.name = EventEditor.getGlobalEventName(guid)
	item.class = 'global'
	item.filter = 'global'
	item.type = event.type
	item.meta = Data.manifest.guidMap[guid]
	item.event = Data.events[guid]
	item.callback = null
	item.changed = false
	return item
}

// 列表 - 更新项目类名
EventEditor.list.updateItemClass = function (item) {
	const { element } = item
	element.addClass('event-open-item')
	if (item.filter === 'global') {
		element.addClass('global-event')
	} else {
		element.addClass('local-event')
	}
}

// 列表 - 重写创建图标方法
EventEditor.list.createIcon = function () {
	const closeButton = document.createElement('text')
	closeButton.textContent = '×'
	closeButton.addClass('event-close-button')
	closeButton.on('click', EventEditor.list.closeButtonClick)
	return closeButton
}

// 列表 - 创建初始化文本
EventEditor.list.createInitText = function (item) {
	const { element } = item
	const initText = document.createElement('text')
	initText.addClass('event-init-text')
	element.appendChild(initText)
	element.initText = initText
	element.attrValue = ''
}

// 列表 - 更新初始化文本
EventEditor.list.updateInitText = function (item) {
	const { element } = item
	if (element.initText !== undefined) {
		let typeName = ''
		if (item.type !== 'common') {
			typeName =
				' : ' +
				Command.removeTextTags(
					Command.parseEventType(item.filter + '-event', item.type)
				)
		}
		if (element.attrValue !== typeName) {
			element.attrValue = typeName
			element.initText.textContent = typeName
		}
	}
}

// 列表 - 重写更新项目名称方法
EventEditor.list.updateItemName = function (item) {
	TreeList.prototype.updateItemName.call(this, item)
	this.updateInitText(item)
}

// 列表 - 关闭按钮点击事件
EventEditor.list.closeButtonClick = function (event) {
	EventEditor.list.close(event.target.parentNode.item)
}

window.EventEditor = EventEditor
