'use strict'

// ******************************** 指令对象 ********************************

export const Command = {
	// properties
	target: null,
	id: null,
	words: null,
	invalid: false,
	saveVars: false,
	returnType: '',
	eventName: '',
	eventIndex: 0,
	variables: [],
	varMap: {},
	// methods
	initialize: null,
	insert: null,
	edit: null,
	open: null,
	save: null,
	parse: null,
	parseNone: null,
	parseBlend: null,
	fetchVariables: null,
	parseVariable: null,
	parseGlobalVariable: null,
	parseAttributeGroup: null,
	parseAttributeKey: null,
	parseAttributeTag: null,
	parseVariableTag: null,
	parseVariableNumber: null,
	parseVariableString: null,
	parseVariableTemplate: null,
	parseVariableAttr: null,
	parseVariableEnum: null,
	parseVariableFile: null,
	parseVariableTeam: null,
	parseMultiLineString: null,
	parseSpriteName: null,
	parseEventType: null,
	parseEnumGroup: null,
	parseEnumString: null,
	parseEnumStringTag: null,
	parseGroupEnumString: null,
	parseListItem: null,
	parseParameter: null,
	parseActor: null,
	parseSkill: null,
	parseState: null,
	parseEquipment: null,
	parseItem: null,
	parsePosition: null,
	parseAngle: null,
	parseTrigger: null,
	parseLight: null,
	parseRegion: null,
	parseTilemap: null,
	parseObject: null,
	parseElement: null,
	parsePresetObject: null,
	parsePresetElement: null,
	parseTeam: null,
	parseHexColor: null,
	parseActorSelector: null,
	parseFileName: null,
	parseAudioType: null,
	parseWait: null,
	parseEasing: null,
	parseUnlinkedId: null,
	parseTextTags: null,
	removeTextTags: null,
	setNormalColor: null,
	setVariableColor: null,
	setGlobalVariableColor: null,
	setDelimiterColor: null,
	setOperatorColor: null,
	setBooleanColor: null,
	setNumberColor: null,
	setStringColor: null,
	setScriptColor: null,
	setFileColor: null,
	setPresetColor: null,
	setWeakColor: null,
	setCommaColors: null,
	setTextId: null,
	setTooltip: null,
	setInvalid: null,
	forEachCommand: null,
	// classes
	WordList: null,
	// objects
	cases: {},
	custom: null
}

// 初始化
Command.initialize = function () {
	// 创建词语列表
	this.words = new Command.WordList()

	// 初始化相关对象
	CommandSuggestion.initialize()
	TextSuggestion.initialize()
	VariableGetter.initialize()
	ActorGetter.initialize()
	SkillGetter.initialize()
	StateGetter.initialize()
	EquipmentGetter.initialize()
	ItemGetter.initialize()
	PositionGetter.initialize()
	AngleGetter.initialize()
	TriggerGetter.initialize()
	LightGetter.initialize()
	RegionGetter.initialize()
	TilemapGetter.initialize()
	ObjectGetter.initialize()
	ElementGetter.initialize()
	AncestorGetter.initialize()
	Command.custom.initialize()

	// 初始化指令模块
	// 引用了Inspector子对象选择框的选项
	// 因此需要保证Inspector优先完成初始化
	for (const object of Object.values(this.cases)) {
		object.initialize?.()
	}
}

// 插入指令
Command.insert = function (target, id) {
	this.target = target
	if (id) {
		target.scrollAndResize()
		return this.open(id)
	}
	CommandSuggestion.open()
}

// 编辑指令
Command.edit = function (target, command) {
	const { id, params } = command
	const handler = this.cases[id]
	if (handler?.load instanceof Function) {
		this.target = target
		this.id = id
		target.scrollAndResize()
		const point = target.getSelectionPosition()
		if (point) {
			Window.setPositionMode('absolute')
			Window.absolutePos.x = point.x + 100
			Window.absolutePos.y = point.y
			Window.open(id)
			Window.setPositionMode('overlap')
			handler.load(params)
		}
	}
	if (handler) return
	const meta = Data.scripts[id]
	if (meta?.parameters.length > 0 && this.custom.commandNameMap[id]) {
		this.target = target
		this.id = id
		target.scrollAndResize()
		const point = target.getSelectionPosition()
		if (point) {
			Window.setPositionMode('absolute')
			Window.absolutePos.x = point.x + 100
			Window.absolutePos.y = point.y
			Window.open('scriptCommand')
			Window.setPositionMode('overlap')
			this.custom.load(id, params)
		}
	}
}

// 打开指令
Command.open = function (id) {
	const handler = this.cases[id]
	if (handler !== undefined) {
		this.id = id
		if (handler.load) {
			const point = this.target.getSelectionPosition()
			if (point) {
				Window.setPositionMode('absolute')
				Window.absolutePos.x = point.x + 100
				Window.absolutePos.y = point.y
				Window.open(id)
				Window.setPositionMode('overlap')
				handler.load({})
			}
		} else {
			handler.save()
		}
		return
	}
	const meta = Data.scripts[id]
	if (meta !== undefined && this.custom.commandNameMap[id]) {
		this.id = id
		if (meta.parameters.length !== 0) {
			const point = this.target.getSelectionPosition()
			if (point) {
				Window.setPositionMode('absolute')
				Window.absolutePos.x = point.x + 100
				Window.absolutePos.y = point.y
				Window.open('scriptCommand')
				Window.setPositionMode('overlap')
				this.custom.load(id, {})
			}
		} else {
			this.custom.save()
		}
	}
}

// 保存指令
Command.save = function (params) {
	const { id, target } = this
	target.save({ id, params })
	const handler = this.cases[id]
	if (handler !== undefined) {
		handler.load && Window.close(id)
	} else {
		Window.close('scriptCommand')
	}
}

// 解析指令
Command.parse = function (command, varMap) {
	this.varMap = varMap
	let id = command?.id
	// 防御：指令缺少 id 或 params 时直接标记为无效，避免整段渲染崩溃
	if (id == null) {
		this.invalid = true
		reportError(new Error('指令缺少 id'), 'Command.parse')
		return ''
	}
	if (id[0] === '!') {
		id = id.slice(1)
	}
	this.invalid = false
	const params = command.params ?? {}
	const handler = this.cases[id]
	try {
		const contents = handler
			? handler.parse(params)
			: this.custom.parse(id, params)
		return Command.parseTextTags(contents)
	} catch (err) {
		// 单条指令解析失败不应拖垮整个事件渲染
		this.invalid = true
		reportError(err, `Command.parse (id=${id})`)
		return `[解析失败: ${id}]`
	}
}

// 显示文本
// Command.cases.showText extracted -> module/command/showText.js

window.Command = Command
