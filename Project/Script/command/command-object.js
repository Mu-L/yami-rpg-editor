'use strict'

// ******************************** 指令对象 ********************************

const Command = {
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

// 解析混合模式
Command.parseBlend = function (blend) {
	return Local.get('blend.' + blend)
}

// 获取变量列表
Command.fetchVariables = function (commands) {
	const eventId = commands.eventId
	const calledEvents = [eventId]
	let eventIndex = 0
	this.returnType = Data.events[eventId]?.returnType ?? 'none'
	this.saveVars = true
	// 获取全局事件参数变量
	const fetchParameters = (guid) => {
		const globalEvent = Data.events[guid]
		if (!globalEvent) return
		for (const { type, key } of globalEvent.parameters) {
			let varType
			switch (type) {
				case 'boolean':
					varType = 'boolean'
					break
				case 'number':
					varType = 'number'
					break
				case 'string':
					varType = 'string'
					break
				default:
					varType = 'object'
					break
			}
			Command.variables.push({
				name: key,
				type: varType,
				comment:
					this.eventName ||
					'⭐️' + Local.get(`eventParameterTypes.${type}`),
				evIndex: eventIndex,
				isLeftValue: true,
				refCount: 0
			})
		}
	}
	// 遍历指令列表获取变量
	const fetchVariables = (commands) => {
		for (const command of commands) {
			const { id, params } = command
			// 跳过关闭的指令 / 防御：指令缺少 id
			if (id == null || id[0] === '!') continue
			Command.currentCommand = command
			// 遍历调用事件中的全局事件指令列表
			if (id === 'callEvent') {
				if (
					params?.type === 'global' &&
					calledEvents.append(params.eventId)
				) {
					const file = Data.manifest.guidMap[params.eventId]?.file
					if (file instanceof FileItem && !file.data.namespace) {
						let lastEventName = this.eventName
						let lasteventIndex = this.eventIndex
						this.eventName = file.basename
						this.eventIndex = ++eventIndex
						fetchParameters(params.eventId)
						fetchVariables(file.data.commands)
						this.eventName = lastEventName
						this.eventIndex = lasteventIndex
					}
				}
			}
			// 执行指令解析事件
			const handler = this.cases[id]
			let contents
			try {
				contents = handler
					? handler.parse(params ?? {})
					: this.custom.parse(id, params ?? {})
			} catch (err) {
				// 单条指令解析失败不应中断整个变量收集
				reportError(err, `Command.fetchVariables (id=${id})`)
				contents = []
			}
			// 遍历子代指令列表
			for (const content of contents) {
				if (content.children) {
					fetchVariables(content.children)
				}
			}
		}
		Command.currentCommand = null
	}
	// 获取变量
	fetchParameters(eventId)
	fetchVariables(commands)
	// 恢复上下文状态
	const { variables } = this
	this.eventIndex = 0
	this.eventName = ''
	this.saveVars = false
	this.variables = []
	return variables
}

// 解析变量
Command.parseVariable = function (
	variable,
	valueType = '',
	isLeftValue = false
) {
	const key = variable.key
	switch (variable.type) {
		case 'local': {
			// 如果开启了保存变量模式
			if (Command.saveVars) {
				if (key !== '') {
					Command.variables.push({
						name: key,
						type: valueType,
						comment: Command.eventName,
						evIndex: Command.eventIndex,
						isLeftValue: isLeftValue,
						refCount: 0,
						command: Command.currentCommand
					})
				}
			}
			let varName = Command.setVariableColor(
				key || Local.get('common.none')
			)
			if (valueType) {
				const textId = Command.setTextId(`local-${valueType}-${key}`)
				varName = textId + varName
			}
			return varName
		}
		case 'global': {
			let varName = Command.parseGlobalVariable(key)
			if (valueType) {
				const gVar = getVariable(variable.key)
				// 优先使用全局变量值的类型
				const type = gVar ? typeof gVar.value : valueType
				const textId = Command.setTextId(
					`global-${type}-${variable.key}`
				)
				varName = textId + Command.setGlobalVariableColor(varName)
			}
			return varName
		}
		case 'self': {
			let varName = Command.setVariableColor(Local.get('variable.self'))
			if (valueType) {
				const textId = Command.setTextId(`self-${valueType}-unnamed`)
				varName = textId + varName
			}
			return varName
		}
		case 'actor': {
			const actor = Command.parseActor(variable.actor)
			const attrName = Command.parseVariableAttr('actor', key)
			return typeof key === 'string'
				? actor + Token('.') + attrName
				: actor + Token('[') + attrName + Token(']')
		}
		case 'skill': {
			const skill = Command.parseSkill(variable.skill)
			const attrName = Command.parseVariableAttr('skill', key)
			return typeof key === 'string'
				? skill + Token('.') + attrName
				: skill + Token('[') + attrName + Token(']')
		}
		case 'state': {
			const state = Command.parseState(variable.state)
			const attrName = Command.parseVariableAttr('state', key)
			return typeof key === 'string'
				? state + Token('.') + attrName
				: state + Token('[') + attrName + Token(']')
		}
		case 'equipment': {
			const equipment = Command.parseEquipment(variable.equipment)
			const attrName = Command.parseVariableAttr('equipment', key)
			return typeof key === 'string'
				? equipment + Token('.') + attrName
				: equipment + Token('[') + attrName + Token(']')
		}
		case 'item': {
			const item = Command.parseItem(variable.item)
			const attrName = Command.parseVariableAttr('item', key)
			return typeof key === 'string'
				? item + Token('.') + attrName
				: item + Token('[') + attrName + Token(']')
		}
		case 'element': {
			const element = Command.parseElement(variable.element)
			const attrName = Command.parseVariableAttr('element', key)
			return typeof key === 'string'
				? element + Token('.') + attrName
				: element + Token('[') + attrName + Token(']')
		}
	}
}

// 解析全局变量
Command.parseGlobalVariable = function (id) {
	if (id === '') return Token('none')
	const variable = getVariable(id)
	return variable ? variable.name : Command.parseUnlinkedId(id)
}

// 解析属性群组
Command.parseAttributeGroup = function (groupKey) {
	if (groupKey === '') return Token('none')
	const group = Attribute.getGroup(groupKey)
	if (group) return GameLocal.replace(group.groupName)
	this.invalid = true
	return Command.parseUnlinkedId(groupKey)
}

// 解析属性键
Command.parseAttributeKey = (function () {
	const i = / +/g
	return function (groupKey, attrId, valueType) {
		const attr = groupKey
			? Attribute.getGroupAttribute(groupKey, attrId)
			: Attribute.getAttribute(attrId)
		if (attr) {
			const type =
				valueType ?? (attr.type === 'enum' ? 'string' : attr.type)
			const textId = Command.setTextId(
				`attribute-${type}-${attr.key ?? attrId}-${attrId}`
			)
			return (
				textId +
				Command.setVariableColor(
					GameLocal.replace(attr.name.replace(i, ''))
				)
			)
		}
		this.invalid = true
		const textId = Command.setTextId(
			`attribute-${valueType ?? 'any'}-${attrId}-${attrId}`
		)
		return (
			textId + Command.setVariableColor(Command.parseUnlinkedId(attrId))
		)
	}
})()

// 解析属性标签
Command.parseAttributeTag = function (id, valueType) {
	return (
		Token('<') + Command.parseAttributeKey('', id, valueType) + Token('>')
	)
}

// 解析变量标签
Command.parseVariableTag = (function IIFE() {
	const local = /(?<=<)local:([\s\S]+?)(?=>)/g
	const global = /(?<=<)global(::?)([0-9a-f]{16})(?=>)/g
	const localVar = { type: 'local', key: '' }
	const globalVar = { type: 'global', key: '' }
	const localReplacer = (match, varKey) => {
		localVar.key = varKey
		// 使用这个方法注册变量
		return Command.parseVariable(localVar, 'any')
	}
	const globalReplacer = (match, delimiter, varKey) => {
		globalVar.key = varKey
		const varSign = delimiter === '::' ? '@' : ''
		return varSign + Command.parseVariable(globalVar, 'any')
	}
	return (string) =>
		string.replace(local, localReplacer).replace(global, globalReplacer)
})()

// 解析可变数值
Command.parseVariableNumber = function (number, unit) {
	switch (typeof number) {
		case 'number': {
			const text = Command.setNumberColor(number)
			return unit ? text + unit : text
		}
		case 'object': {
			const text = Command.parseVariable(number, 'number')
			return unit ? text + ' ' + unit : text
		}
	}
}

// 解析可变字符串
Command.parseVariableString = function (string) {
	switch (typeof string) {
		case 'string':
			return Command.setStringColor(
				`"${Command.parseMultiLineString(string)}"`
			)
		case 'object':
			return Command.parseVariable(string, 'string')
	}
}

// 解析可变模板字符串
Command.parseVariableTemplate = function (content, maxLength = 0) {
	switch (typeof content) {
		case 'string': {
			const tag = Command.parseVariableTag(GameLocal.replace(content))
			let string = Command.parseMultiLineString(tag)
			if (maxLength !== 0 && string.length > maxLength) {
				string = string.slice(0, maxLength) + '...'
			}
			return Command.setStringColor(`"${string}"`, true)
		}
		case 'object':
			return Command.parseVariable(content, 'any')
	}
}

// 解析可变属性
Command.parseVariableAttr = function (groupKey, attrId) {
	switch (typeof attrId) {
		case 'string':
			return Command.parseAttributeKey(groupKey, attrId)
		case 'object':
			return Command.parseVariable(attrId, 'string')
	}
}

// 解析可变枚举值
Command.parseVariableEnum = function (groupKey, enumId) {
	switch (typeof enumId) {
		case 'string':
			return Command.parseGroupEnumString(groupKey, enumId)
		case 'object':
			return Command.parseVariable(enumId, 'string')
	}
}

// 解析可变文件
Command.parseVariableFile = function (fileId) {
	switch (typeof fileId) {
		case 'string':
			return Command.parseFileName(fileId)
		case 'object':
			return Command.parseVariable(fileId, 'string')
	}
}

// 解析可变队伍
Command.parseVariableTeam = function (id) {
	switch (typeof id) {
		case 'string':
			return Command.parseTeam(id)
		case 'object':
			return Command.parseVariable(id, 'string')
	}
}

// 解析多行字符串
Command.parseMultiLineString = (function IIFE() {
	const regexp = /\n/g
	return function (string) {
		return string.replace(regexp, '\\n')
	}
})()

// 解析精灵图名称
Command.parseSpriteName = function (animationId, spriteId) {
	if (spriteId === '') return Token('none')
	const animation = Data.animations[animationId]
	const sprite = animation?.sprites.find((a) => a.id === spriteId)
	if (sprite) return sprite.name
	this.invalid = true
	return Command.parseUnlinkedId(spriteId)
}

// 解析事件类型(内置事件普通颜色，自定义事件字符串颜色)
Command.parseEventType = function (groupKey, eventType) {
	return (
		Local.get('eventTypes.' + eventType) ||
		Command.parseGroupEnumString(groupKey, eventType)
	)
}

// 解析枚举群组
Command.parseEnumGroup = function (groupKey) {
	if (groupKey === '') return Token('none')
	const group = Enum.getGroup(groupKey)
	if (group) return GameLocal.replace(group.groupName)
	this.invalid = true
	return Command.parseUnlinkedId(groupKey)
}

// 解析枚举字符串
Command.parseEnumString = function (stringId) {
	if (stringId === '') return Token('none')
	const string = Enum.getString(stringId)
	if (string) {
		const textId = Command.setTextId(
			`enum-string-${string.value ?? stringId}-${stringId}`
		)
		return textId + Command.setStringColor(GameLocal.replace(string.name))
	}
	this.invalid = true
	const textId = Command.setTextId(`enum-string-${stringId}-${stringId}`)
	return textId + Command.setStringColor(Command.parseUnlinkedId(stringId))
}

// 解析枚举字符串标签
Command.parseEnumStringTag = function (stringId) {
	return Token('<') + Command.parseEnumString(stringId) + Token('>')
}

// 解析群组枚举字符串
Command.parseGroupEnumString = function (groupKey, stringId) {
	if (stringId === '') return Token('none')
	const string = Enum.getGroupString(groupKey, stringId)
	const textId = Command.setTextId(`enum-string-${stringId}-${stringId}`)
	if (string)
		return textId + Command.setStringColor(GameLocal.replace(string.name))
	this.invalid = true
	return textId + Command.setStringColor(Command.parseUnlinkedId(stringId))
}

// 解析列表项目
Command.parseListItem = function (variable, index) {
	const listName = Command.parseVariable(variable, 'object')
	const listIndex = Command.parseVariableNumber(index)
	return listName + Token('[') + listIndex + Token(']')
}

// 解析参数
Command.parseParameter = function (key) {
	const label = Local.get('parameter.param')
	const paramKey = Command.parseVariableString(key)
	return label + Token('(') + paramKey + Token(')')
}

// 解析角色
Command.parseActor = function (actor) {
	switch (actor.type) {
		case 'trigger':
			return (
				Command.setTextId('actor-object-trigger') +
				Local.get('actor.trigger')
			)
		case 'caster':
			return (
				Command.setTextId('actor-object-caster') +
				Local.get('actor.caster')
			)
		case 'latest':
			return (
				Command.setTextId('actor-object-latest') +
				Local.get('actor.latest')
			)
		case 'target':
			return (
				Command.setTextId('actor-object-target') +
				Local.get('actor.target')
			)
		case 'player':
			return (
				Command.setTextId('actor-object-player') +
				Local.get('actor.player')
			)
		case 'member':
			return (
				Command.setTextId('actor-object-member') +
				Local.get('actor.member') +
				Token('[') +
				Command.parseVariableNumber(actor.memberId) +
				Token(']')
			)
		case 'global':
			return (
				Command.setTextId(`actor-object-${actor.actorId}`) +
				Command.parseFileName(actor.actorId)
			)
		case 'by-id':
			return Command.parsePresetObject(actor.presetId)
		case 'variable': {
			const label = Local.get('actor.common')
			const textId = Command.setTextId('actor-object-variable')
			const variable = Command.parseVariable(actor.variable, 'object')
			return textId + label + Token('(') + variable + Token(')')
		}
	}
}

// 解析技能
Command.parseSkill = function (skill) {
	switch (skill.type) {
		case 'trigger':
			return (
				Command.setTextId('skill-object-trigger') +
				Local.get('skill.trigger')
			)
		case 'latest':
			return (
				Command.setTextId('skill-object-latest') +
				Local.get('skill.latest')
			)
		case 'by-key': {
			const actor = Command.parseActor(skill.actor)
			const label = Local.get('skill.common')
			const textId = Command.setTextId('skill-object-by-key')
			const key = Command.parseVariableEnum('shortcut-key', skill.key)
			return (
				actor +
				Token(' -> ') +
				textId +
				label +
				Token('<') +
				key +
				Token('>')
			)
		}
		case 'by-id': {
			const actor = Command.parseActor(skill.actor)
			const file = Command.parseFileName(skill.skillId)
			return actor + Token(' -> ') + file
		}
		case 'variable': {
			const label = Local.get('skill.common')
			const textId = Command.setTextId('skill-object-variable')
			const variable = Command.parseVariable(skill.variable, 'object')
			return textId + label + Token('(') + variable + Token(')')
		}
	}
}

// 解析状态
Command.parseState = function (state) {
	switch (state.type) {
		case 'trigger':
			return (
				Command.setTextId('state-object-trigger') +
				Local.get('state.trigger')
			)
		case 'latest':
			return (
				Command.setTextId('state-object-latest') +
				Local.get('state.latest')
			)
		case 'by-id': {
			const actor = Command.parseActor(state.actor)
			const file = Command.parseFileName(state.stateId)
			return actor + Token(' -> ') + file
		}
		case 'variable': {
			const label = Local.get('state.common')
			const textId = Command.setTextId('state-object-variable')
			const variable = Command.parseVariable(state.variable, 'object')
			return textId + label + Token('(') + variable + Token(')')
		}
	}
}

// 解析装备
Command.parseEquipment = function (equipment) {
	switch (equipment.type) {
		case 'trigger':
			return (
				Command.setTextId('equipment-object-trigger') +
				Local.get('equipment.trigger')
			)
		case 'latest':
			return (
				Command.setTextId('equipment-object-latest') +
				Local.get('equipment.latest')
			)
		case 'by-slot': {
			const actor = Command.parseActor(equipment.actor)
			const label = Local.get('equipment.common')
			const textId = Command.setTextId('equipment-object-by-slot')
			const slot = Command.parseVariableEnum(
				'equipment-slot',
				equipment.slot
			)
			return (
				actor +
				Token(' -> ') +
				textId +
				label +
				Token('<') +
				slot +
				Token('>')
			)
		}
		case 'by-id-equipped':
		case 'by-id-inventory': {
			const actor = Command.parseActor(equipment.actor)
			const file = Command.parseFileName(equipment.equipmentId)
			const source = Command.setWeakColor(
				Local.get('equipment.' + equipment.type)
			)
			return (
				actor +
				Token(' -> ') +
				file +
				' ' +
				Token('(') +
				source +
				Token(')')
			)
		}
		case 'variable': {
			const label = Local.get('equipment.common')
			const textId = Command.setTextId('equipment-object-variable')
			const variable = Command.parseVariable(equipment.variable, 'object')
			return textId + label + Token('(') + variable + Token(')')
		}
	}
}

// 解析物品
Command.parseItem = function (item) {
	switch (item.type) {
		case 'trigger':
			return (
				Command.setTextId('item-object-trigger') +
				Local.get('item.trigger')
			)
		case 'latest':
			return (
				Command.setTextId('item-object-latest') +
				Local.get('item.latest')
			)
		case 'by-key': {
			const actor = Command.parseActor(item.actor)
			const label = Local.get('item.common')
			const textId = Command.setTextId('item-object-by-key')
			const key = Command.parseVariableEnum('shortcut-key', item.key)
			return (
				actor +
				Token(' -> ') +
				textId +
				label +
				Token('<') +
				key +
				Token('>')
			)
		}
		case 'by-id': {
			const actor = Command.parseActor(item.actor)
			const file = Command.parseFileName(item.itemId)
			return actor + Token(' -> ') + file
		}
		case 'variable': {
			const label = Local.get('item.common')
			const variable = Command.parseVariable(item.variable, 'object')
			const textId = Command.setTextId('item-object-variable')
			return textId + label + Token('(') + variable + Token(')')
		}
	}
}

// 解析位置
Command.parsePosition = function (position) {
	switch (position.type) {
		case 'absolute': {
			const x = Command.parseVariableNumber(position.x)
			const y = Command.parseVariableNumber(position.y)
			return (
				Local.get('position.common') +
				Token('(') +
				x +
				Token(', ') +
				y +
				Token(')')
			)
		}
		case 'relative': {
			const x = Command.parseVariableNumber(position.x)
			const y = Command.parseVariableNumber(position.y)
			return (
				Local.get('position.relative') +
				Token('(') +
				x +
				Token(', ') +
				y +
				Token(')')
			)
		}
		case 'actor':
			return (
				Local.get('position.common') +
				Token('(') +
				Command.parseActor(position.actor) +
				Token(')')
			)
		case 'trigger':
			return (
				Local.get('position.common') +
				Token('(') +
				Command.parseTrigger(position.trigger) +
				Token(')')
			)
		case 'light':
			return (
				Local.get('position.common') +
				Token('(') +
				Command.parseLight(position.light) +
				Token(')')
			)
		case 'region': {
			const region = Command.parseRegion(position.region)
			const mode = Local.get('position.region.mode.' + position.mode)
			return (
				Local.get('position.common') +
				Token('(') +
				region +
				Token(', ') +
				mode +
				Token(')')
			)
		}
		case 'object':
			return (
				Local.get('position.common') +
				Token('(') +
				Command.parsePresetObject(position.objectId) +
				Token(')')
			)
		case 'mouse':
			return (
				Local.get('position.common') +
				Token('(') +
				Local.get('position.mouse') +
				Token(')')
			)
	}
}

// 解析角度
Command.parseAngle = function (angle) {
	const type = angle.type
	const desc = Local.get('angle.' + type)
	switch (type) {
		case 'position':
			return `${desc} ${Command.parsePosition(angle.position)}`
		case 'absolute':
		case 'relative':
		case 'direction':
			return `${desc} ${Command.parseVariableNumber(angle.degrees, '°')}`
		case 'random':
			return desc
	}
}

// 解析触发器
Command.parseTrigger = function (trigger) {
	switch (trigger.type) {
		case 'trigger':
			return (
				Command.setTextId('trigger-object-trigger') +
				Local.get('trigger.trigger')
			)
		case 'latest':
			return (
				Command.setTextId('trigger-object-latest') +
				Local.get('trigger.latest')
			)
		case 'variable': {
			const label = Local.get('trigger.common')
			const textId = Command.setTextId('trigger-object-variable')
			const variable = Command.parseVariable(trigger.variable, 'object')
			return textId + label + Token('(') + variable + Token(')')
		}
	}
}

// 解析光源
Command.parseLight = function (light) {
	switch (light.type) {
		case 'trigger':
			return (
				Command.setTextId('light-object-trigger') +
				Local.get('light.trigger')
			)
		case 'latest':
			return (
				Command.setTextId('light-object-latest') +
				Local.get('light.latest')
			)
		case 'by-id':
			return Command.parsePresetObject(light.presetId)
		case 'variable': {
			const label = Local.get('light.common')
			const textId = Command.setTextId('light-object-variable')
			const variable = Command.parseVariable(light.variable, 'object')
			return textId + label + Token('(') + variable + Token(')')
		}
	}
}

// 解析区域
Command.parseRegion = function (region) {
	switch (region.type) {
		case 'trigger':
			return (
				Command.setTextId('region-object-trigger') +
				Local.get('region.trigger')
			)
		case 'by-id':
			return Command.parsePresetObject(region.presetId)
	}
}

// 解析瓦片地图
Command.parseTilemap = function (tilemap) {
	switch (tilemap.type) {
		case 'trigger':
			return (
				Command.setTextId('tilemap-object-trigger') +
				Local.get('tilemap.trigger')
			)
		case 'by-id':
			return Command.parsePresetObject(tilemap.presetId)
		case 'variable':
			return Command.parseVariable(tilemap.variable, 'object')
	}
}

// 解析场景对象
Command.parseObject = function (object) {
	switch (object.type) {
		case 'trigger':
			return (
				Command.setTextId('preset-object-trigger') +
				Local.get('object.trigger')
			)
		case 'latest':
			return (
				Command.setTextId('preset-object-latest') +
				Local.get('object.latest')
			)
		case 'by-id':
			return Command.parsePresetObject(object.presetId)
		case 'variable': {
			const label = Local.get('object.common')
			const textId = Command.setTextId('preset-object-variable')
			const variable = Command.parseVariable(object.variable, 'object')
			return textId + label + Token('(') + variable + Token(')')
		}
	}
}

// 解析元素
Command.parseElement = function (element) {
	switch (element.type) {
		case 'trigger':
			return (
				Command.setTextId('element-object-trigger') +
				Local.get('element.trigger')
			)
		case 'latest':
			return (
				Command.setTextId('element-object-latest') +
				Local.get('element.latest')
			)
		case 'by-id':
			return Command.parsePresetElement(element.presetId, false)
		case 'by-ancestor-and-id': {
			const ancestor = Command.parseElement(element.ancestor)
			const descendant = Command.parsePresetElement(
				element.presetId,
				false
			)
			return ancestor + Token(' -> ') + descendant
		}
		case 'by-index': {
			const parent = Command.parseElement(element.parent)
			const label = Local.get('element.common')
			const textId = Command.setTextId('element-object-by-index')
			const index = Command.parseVariableNumber(element.index)
			const child = textId + label + Token('[') + index + Token(']')
			return parent + Token(' -> ') + child
		}
		case 'by-button-index': {
			const focus = Command.parseElement(element.focus)
			const label = Local.get('element.button')
			const textId = Command.setTextId('element-object-by-button-index')
			const index = Command.parseVariableNumber(element.index)
			const child = textId + label + Token('[') + index + Token(']')
			return focus + Token(' -> ') + child
		}
		case 'selected-button': {
			const focus = Command.parseElement(element.focus)
			const button = Local.get('element.selected-button')
			const textId = Command.setTextId('element-object-selected-button')
			return focus + Token(' -> ') + textId + button
		}
		case 'focus':
			return (
				Command.setTextId('element-object-focus') +
				Local.get('element.focus')
			)
		case 'parent': {
			const label = Local.get('element.parent')
			const textId = Command.setTextId('element-object-parent')
			const parent = Command.parseVariable(element.variable, 'object')
			return textId + label + Token('(') + parent + Token(')')
		}
		case 'variable': {
			const label = Local.get('element.common')
			const textId = Command.setTextId('element-object-variable')
			const variable = Command.parseVariable(element.variable, 'object')
			return textId + label + Token('(') + variable + Token(')')
		}
	}
}

// 解析预设对象
Command.parsePresetObject = function (presetId) {
	if (presetId === '') return Token('none')
	const name = Data.scenePresets[presetId]?.data.name
	const textId = Command.setTextId(`scene-object-${presetId}`)
	return typeof name === 'string'
		? textId + Command.setPresetColor(name)
		: textId + Command.setPresetColor(Command.parseUnlinkedId(presetId))
}

// 解析预设元素
Command.parsePresetElement = function (presetId, detailed = true) {
	if (presetId === '') return Token('none')
	const uiId = Data.uiPresets[presetId]?.uiId ?? ''
	const preset = Data.uiPresets[presetId]?.data
	const textId = Command.setTextId(`ui-object-${presetId}`)
	let presetName = preset?.name
	if (presetName === undefined) {
		this.invalid = true
		presetName = Command.setPresetColor(Command.parseUnlinkedId(presetId))
	} else if (presetName) {
		presetName = Command.setPresetColor(presetName)
	}
	switch (detailed) {
		case true: {
			const uiName = Command.parseFileName(uiId)
			return uiName + ' ' + Token('{') + textId + presetName + Token('}')
		}
		case false:
			return textId + presetName
	}
}

// 解析队伍
Command.parseTeam = function (id) {
	const team = Data.teams.map[id]
	if (team) return team.name
	this.invalid = true
	return Command.parseUnlinkedId(id)
}

// 解析十六进制颜色
Command.parseHexColor = function (hex) {
	return Command.setStringColor('#' + hex)
}

// 解析角色选择器
Command.parseActorSelector = function (selector) {
	switch (selector) {
		case 'enemy':
		case 'friend':
		case 'team':
		case 'team-except-self':
		case 'any-except-self':
		case 'any':
			return Local.get('actorFilter.' + selector)
	}
}

// 解析文件名称
Command.parseFileName = function (id) {
	if (id === '') return Token('none')
	const meta = Data.manifest.guidMap[id]
	const textId = Command.setTextId(`file-string-${id}`)
	if (meta) return textId + Command.setFileColor(File.parseMetaName(meta))
	this.invalid = true
	return textId + Command.setFileColor(Command.parseUnlinkedId(id))
}

// 解析音频类型
Command.parseAudioType = function (type) {
	switch (type) {
		case 'bgm':
			return 'BGM'
		case 'bgs':
			return 'BGS'
		case 'cv':
			return 'CV'
		case 'se':
		case 'se-attenuated':
			return 'SE'
		case 'all':
			return 'ALL'
	}
}

// 解析等待参数
Command.parseWait = function (wait) {
	switch (wait) {
		case false:
			return ''
		case true:
			return Local.get('transition.wait')
	}
}

// 解析过渡方式
Command.parseEasing = function (easingId, duration, wait) {
	if (duration === 0) return ''
	const easing = Data.easings.map[easingId]
	const time = Command.parseVariableNumber(duration, 'ms')
	const info = (easing?.name ?? `#${easingId}`) + Token(', ') + time
	return wait ? info + Token(', ') + Local.get('transition.wait') : info
}

// 解析失去连接的ID
Command.parseUnlinkedId = function (name) {
	return name ? `#${name}` : ''
}

// 解析文本标签
Command.parseTextTags = (function IIFE() {
	const regexp = /\$_(\S+?)_\$([\s\S]*?)\$_\/_\$/g
	return function (contents) {
		let i = contents.length
		while (--i >= 0) {
			const content = contents[i]
			if (content.text !== undefined) {
				const text = content.text
				const inserts = []
				let end = 0
				let match
				while ((match = regexp.exec(text))) {
					const start = match.index
					// 插入普通文本
					if (end < start) {
						inserts.push({ text: text.slice(end, start) })
					}
					if (match[1] === 'textId') {
						// 插入文本ID
						inserts.push({ textId: match[2] })
					} else if (match[1] === 'tooltip') {
						// 插入工具提示
						inserts.push({ tooltip: match[2] })
					} else if (match[1] === 'class') {
						// 插入自定义类名
						inserts.push({ class: match[2] })
					} else if (match[2] === '$_none_$') {
						// 如果存在特殊文本，只插入颜色
						inserts.push({ color: match[1] })
					} else {
						// 插入高亮文本
						inserts.push(
							{ color: match[1] },
							{ text: match[2] },
							{ color: 'restore' }
						)
					}
					// 更新尾部索引
					end = start + match[0].length
				}
				// 如果存在高亮文本
				if (inserts.length !== 0) {
					// 插入尾部普通文本
					if (end < text.length) {
						inserts.push({ text: text.slice(end) })
					}
					// 替换内容对象
					contents.splice(i, 1, ...inserts)
				}
			}
		}
		return contents
	}
})()

// 移除文本标签
Command.removeTextTags = (function IIFE() {
	const regexp = /\$_textId_\$(?:\S+?)_\/_\$|\$_(?:\S+?)_\$/g
	return function (string) {
		return string.replace(regexp, '')
	}
})()

// 设置普通颜色
Command.setNormalColor = function (value) {
	return `$_normal_$${value}$_/_$`
}

// 设置变量颜色
Command.setVariableColor = function (value) {
	return `$_identifier_$${value}$_/_$`
}

// 设置全局变量颜色
Command.setGlobalVariableColor = function (value) {
	return `$_global-var_$${value}$_/_$`
}

// 设置定界符颜色
Command.setDelimiterColor = function (value) {
	return `$_delimiter_$${value}$_/_$`
}

// 设置操作符颜色
Command.setOperatorColor = function (value) {
	return `$_operator_$${value}$_/_$`
}

// 设置布尔值颜色
Command.setBooleanColor = function (value) {
	return `$_boolean_$${value}$_/_$`
}

// 设置数值颜色
Command.setNumberColor = function (value) {
	if (typeof value) {
		value = value.toString()
	}
	if (value[0] !== '-') return `$_number_$${value}$_/_$`
	return Token('-') + `$_number_$${value.slice(1)}$_/_$`
}

// 设置字符串颜色
Command.setStringColor = function (value, save = false) {
	if (save === false) return `$_string_$${value}$_/_$`
	return `$_string_$$_none_$$_/_$$_save_$$_none_$$_/_$${value}$_normal_$$_none_$$_/_$$_save_$$_none_$$_/_$`
}

// 设置脚本颜色
Command.setScriptColor = function (value) {
	return `$_text_$${value}$_/_$`
}

// 设置文件的颜色
Command.setFileColor = function (value) {
	return `$_file_$${value}$_/_$`
}

// 设置预设对象的颜色
Command.setPresetColor = function (value) {
	return `$_preset_$${value}$_/_$`
}

// 设置微弱的颜色
Command.setWeakColor = function (value) {
	return `$_weak_$${value}$_/_$`
}

// 设置逗号颜色
Command.setCommaColors = (function IIFE() {
	const regexp = /,/g
	return function (value) {
		return value.replace(regexp, '$_delimiter_$,$_/_$')
	}
})()

// 设置文本ID
Command.setTextId = function (id) {
	return `$_textId_$${id}$_/_$`
}

// 设置工具提示
Command.setTooltip = function (tip) {
	return `$_tooltip_$${tip}$_/_$`
}

// 设置自定义类名
Command.setClass = function (className) {
	return `$_class_$${className}$_/_$`
}

// 遍历指令列表中的每个指令
Command.forEachCommand = function (commands, handler) {
	const forEach = (commands) => {
		for (const command of commands) {
			// console.log(command)
			handler(command)
			switch (command.id) {
				case 'showChoices':
					for (const choice of command.params.choices) {
						// console.log('choice-branch')
						forEach(choice.commands)
						// console.log('--------------------')
					}
					continue
				case 'if':
					for (const branch of command.params.branches) {
						// console.log('if-branch')
						forEach(branch.commands)
						// console.log('--------------------')
					}
					if (command.params.elseCommands) {
						// console.log('if-else')
						forEach(command.params.elseCommands)
						// console.log('--------------------')
					}
					continue
				case 'switch':
					for (const branch of command.params.branches) {
						// console.log('switch-branch')
						forEach(branch.commands)
						// console.log('--------------------')
					}
					if (command.params.defaultCommands) {
						// console.log('switch-default')
						forEach(command.params.defaultCommands)
						// console.log('--------------------')
					}
					continue
				case 'loop':
					// console.log('loop-block')
					forEach(command.params.commands)
					// console.log('--------------------')
					continue
				case 'forEach':
					// console.log('forEach-block')
					forEach(command.params.commands)
					// console.log('--------------------')
					continue
				case 'independent':
					// console.log('independent-block')
					forEach(command.params.commands)
					// console.log('--------------------')
					continue
				case 'transition':
					// console.log('transition-block')
					forEach(command.params.commands)
					// console.log('--------------------')
					continue
			}
		}
	}
	return forEach(commands)
}

// 词语列表类
Command.WordList = class WordList extends Array {
	count //:number

	constructor() {
		super()
		this.count = 0
	}

	// 推入内容
	push(string) {
		if (string) this[this.count++] = string
		return this
	}

	// 连接内容
	join(joint = '$_delimiter_$, $_/_$') {
		const length = this.count
		if (length === 0) {
			return ''
		}
		this.count = 0
		let string = this[0]
		for (let i = 1; i < length; i++) {
			string += joint + this[i]
		}
		return string
	}
}

// 显示文本
Command.cases.showText = {
	latinCharWidth: 0,
	otherCharWidth: 0,
	initialize: function () {
		$('#showText-confirm').on('click', this.save)
	},
	parse: function ({ target, parameters, content }) {
		const alias = Local.get('command.showText.alias')
		const words = Command.words
			.push(Command.parseActor(target))
			.push(Command.setCommaColors(parameters))
		const contents = [
			{ fold: true },
			{ color: 'element' },
			{ text: alias + Token(': ') },
			{ color: 'gray' },
			{ color: 'save' },
			{ text: words.join() }
		]
		content = GameLocal.replace(content)
		content = Command.parseVariableTag(content)
		this.appendTextLines(contents, alias, content)
		return contents
	},
	load: function ({
		target = { type: 'trigger' },
		parameters = '',
		content = ''
	}) {
		$('#showText-target').write(target)
		$('#showText-parameters').write(parameters)
		$('#showText-content').write(content)
		if (content === '') {
			$('#showText-target').getFocus()
		} else {
			$('#showText-content').getFocus()
		}
	},
	save: function () {
		const target = $('#showText-target').read()
		const parameters = $('#showText-parameters').read()
		const content = $('#showText-content').read()
		if (content === '') {
			return $('#showText-content').getFocus()
		}
		Command.save({ target, parameters, content })
	},
	updateCharWidth: function () {
		if (this.latinCharWidth === 0) {
			const latinChars = '          '
			const otherChars = '　　　　　　　　　　'
			const font = 'var(--font-family-mono)'
			this.latinCharWidth = measureText(latinChars, font).width / 10
			this.otherCharWidth = measureText(otherChars, font).width / 10
		}
	},
	appendTextLines: (function IIFE() {
		const append = (contents, tag, text) => {
			if (contents.length === 0) {
				contents.push(
					{ color: 'element' },
					{ text: tag + Token(': ') },
					{ color: 'text' },
					{ color: 'save' },
					{ text: text }
				)
			} else {
				contents.push(
					{ break: true },
					{ color: 'transparent' },
					{ text: tag + Token(': ') },
					{ color: 'text' },
					{ color: 'save' },
					{ text: text }
				)
			}
		}
		const textIdTag = /^\$_textId_\$(?:\S+?)_\/_\$/
		const tooltipTag = /^\$_tooltip_\$(?:\S+?)_\/_\$/
		const classTag = /^\$_class_\$(?:\S+?)_\/_\$/
		const colorTag = /^\$_\S+?_\$([\s\S]*?)\$_\/_\$/
		return function (contents, tag, text) {
			if (!text) return
			this.updateCharWidth()
			const MAX_LINES = 10
			const MAX_LINE_WIDTH = 500
			const length = text.length
			const { latinCharWidth } = this
			const { otherCharWidth } = this
			let lineCount = 0
			let lineWidth = 0
			let startIndex = 0
			for (let i = 0; i < length; i++) {
				const char = text[i]
				if (char === '\n') {
					const line = text.slice(startIndex, i)
					append(contents, tag, line)
					lineWidth = 0
					startIndex = i + 1
					if (++lineCount === MAX_LINES) {
						break
					}
					continue
				}
				if (char === '$') {
					const slice = text.slice(i)
					const idMatch = slice.match(textIdTag)
					if (idMatch) {
						// 跳到结束位置
						i += idMatch[0].length - 1
						continue
					}
					const tipMatch = slice.match(tooltipTag)
					if (tipMatch) {
						// 跳到结束位置
						i += tipMatch[0].length - 1
						continue
					}
					const classMatch = slice.match(classTag)
					if (classMatch) {
						// 跳到结束位置
						i += classMatch[0].length - 1
						continue
					}
					const colorMatch = slice.match(colorTag)
					if (colorMatch) {
						for (const char of colorMatch[1]) {
							lineWidth +=
								char < '\xff' ? latinCharWidth : otherCharWidth
						}
						// 跳到结束位置
						i += colorMatch[0].length - 1
						continue
					}
				}
				const charWidth =
					char < '\xff' ? latinCharWidth : otherCharWidth
				lineWidth += charWidth
				if (lineWidth > MAX_LINE_WIDTH) {
					const line = text.slice(startIndex, i)
					append(contents, tag, line)
					lineWidth = charWidth
					startIndex = i
					if (++lineCount === MAX_LINES) {
						break
					}
					continue
				}
			}
			if (lineCount === MAX_LINES) {
				append(contents, tag, '......')
			} else if (lineWidth !== 0) {
				const line = text.slice(startIndex, length)
				append(contents, tag, line)
			}
		}
	})()
}

// 显示选项
Command.cases.showChoices = {
	initialize: function () {
		$('#showChoices-confirm').on('click', this.save)

		// 绑定选项列表
		$('#showChoices-choices').bind(Choices)

		// 清理内存 - 窗口已关闭事件
		$('#showChoices').on('closed', (event) => {
			$('#showChoices-choices').clear()
		})
	},
	parse: function ({ choices, parameters }) {
		const contents = [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.showChoices') + Token(': ') },
			{ color: 'text' },
			{ color: 'save' }
		]
		// 添加选项数量
		contents.push({ text: Command.setNumberColor(choices.length) })
		// 添加参数内容
		if (parameters) {
			contents.push(
				{ color: 'gray' },
				{ color: 'save' },
				{
					text:
						' ' +
						Token('(') +
						Command.setCommaColors(parameters) +
						Token(')')
				}
			)
		}
		contents.push({ color: 'flow' })
		// 换行
		contents.push({ break: true })
		// 添加选项分支内容
		const when = Local.get('command.showChoices.when')
		for (const choice of choices) {
			contents.push(
				{ color: 'flow' },
				{ text: when + ' ' },
				{ color: 'text' },
				{
					text: Command.parseVariableTag(
						GameLocal.replace(choice.content)
					)
				},
				{ children: choice.commands }
			)
		}
		contents.push(
			{ color: 'flow' },
			{ text: Local.get('command.showChoices.end') }
		)
		return contents
	},
	createDefaultChoices: function () {
		return [
			{
				content: Local.get('showChoices.yes'),
				commands: []
			},
			{
				content: Local.get('showChoices.no'),
				commands: []
			}
		]
	},
	load: function ({
		choices = this.createDefaultChoices(),
		parameters = ''
	}) {
		const write = getElementWriter('showChoices')
		write('choices', choices.slice())
		write('parameters', parameters)
		Command.cases.showChoices.choices = choices
		$('#showChoices-choices').getFocus()
	},
	save: function () {
		const read = getElementReader('showChoices')
		const choices = read('choices')
		if (choices.length === 0) {
			return $('#showChoices-choices').getFocus()
		}
		const parameters = read('parameters')
		Command.save({ choices, parameters })
	}
}

// 注释
Command.cases.comment = {
	initialize: function () {
		$('#comment-confirm').on('click', this.save)
	},
	parse: function ({ comment }) {
		const contents = []
		const lines = comment.split('\n')
		for (const line of lines) {
			if (contents.length === 0) {
				contents.push({ color: 'comment' }, { text: line })
			} else {
				contents.push({ break: true }, { text: line })
			}
		}
		if (lines.length > 1) {
			contents.unshift({ fold: true })
		}
		return contents
	},
	load: function ({ comment = '' }) {
		$('#comment-comment').write(comment)
		$('#comment-comment').getFocus('end')
	},
	save: function () {
		const comment = $('#comment-comment').read()
		if (comment === '') {
			return $('#comment-comment').getFocus()
		}
		Command.save({ comment })
	}
}

// 设置布尔值
Command.cases.setBoolean = {
	initialize: function () {
		$('#setBoolean-confirm').on('click', this.save)

		// 创建操作选项
		$('#setBoolean-operation').loadItems([
			{ name: 'Set', value: 'set' },
			{ name: 'Not', value: 'not' },
			{ name: 'And', value: 'and' },
			{ name: 'Or', value: 'or' },
			{ name: 'Xor', value: 'xor' }
		])

		// 创建类型选项
		$('#setBoolean-operand-type').loadItems([
			{ name: 'Constant', value: 'constant' },
			{ name: 'Variable', value: 'variable' },
			{ name: 'List', value: 'list' },
			{ name: 'Parameter', value: 'parameter' },
			{ name: 'Script', value: 'script' }
		])

		// 设置类型关联元素
		$('#setBoolean-operand-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'constant',
					targets: [$('#setBoolean-constant-value')]
				},
				{
					case: 'variable',
					targets: [$('#setBoolean-common-variable')]
				},
				{
					case: 'list',
					targets: [
						$('#setBoolean-common-variable'),
						$('#setBoolean-list-index')
					]
				},
				{
					case: 'parameter',
					targets: [$('#setBoolean-parameter-key')]
				},
				{ case: 'script', targets: [$('#setBoolean-script')] }
			])

		// 创建布尔值常量选项
		$('#setBoolean-constant-value').loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		])

		// 设置类型写入事件，切换变量输入框的过滤器
		$('#setBoolean-operand-type').on('write', (event) => {
			let filter = 'all'
			switch (event.value) {
				case 'variable':
					filter = 'boolean'
					break
				case 'list':
					filter = 'object'
					break
			}
			$('#setBoolean-common-variable').filter = filter
		})
	},
	parseOperation: function (operation) {
		switch (operation) {
			case 'set':
				return ' = '
			case 'not':
				return ' =! '
			case 'and':
				return ' &= '
			case 'or':
				return ' |= '
			case 'xor':
				return ' ^= '
		}
	},
	parseOperand: function (operand) {
		switch (operand.type) {
			case 'constant':
				return Command.setBooleanColor(operand.value.toString())
			case 'variable':
				return Command.parseVariable(operand.variable, 'boolean')
			case 'list':
				return Command.parseListItem(operand.variable, operand.index)
			case 'parameter':
				return Command.parseParameter(operand.key)
			case 'script':
				return Command.setScriptColor(operand.script)
		}
	},
	parse: function ({ variable, operation, operand }) {
		const varDesc = Command.parseVariable(
			variable,
			'boolean',
			operation === 'set'
		)
		const operator = Command.setOperatorColor(
			this.parseOperation(operation)
		)
		const value = this.parseOperand(operand)
		return [
			{ color: 'variable' },
			{ text: Local.get('command.setBoolean.alias') + ' ' },
			{ color: 'restore' },
			{ text: `${varDesc}${operator}${value}` }
		]
	},
	load: function ({
		variable = { type: 'local', key: '' },
		operation = 'set',
		operand = { type: 'constant', value: false }
	}) {
		const write = getElementWriter('setBoolean')
		let constantValue = false
		let commonVariable = { type: 'local', key: '' }
		let listIndex = 0
		let parameterKey = ''
		let script = ''
		switch (operand.type) {
			case 'constant':
				constantValue = operand.value
				break
			case 'variable':
				commonVariable = operand.variable
				break
			case 'list':
				commonVariable = operand.variable
				listIndex = operand.index
				break
			case 'parameter':
				parameterKey = operand.key
				break
			case 'script':
				script = operand.script
				break
		}
		write('variable', variable)
		write('operation', operation)
		write('operand-type', operand.type)
		write('constant-value', constantValue)
		write('common-variable', commonVariable)
		write('list-index', listIndex)
		write('parameter-key', parameterKey)
		write('script', script)
		$('#setBoolean-variable').getFocus()
	},
	save: function () {
		const read = getElementReader('setBoolean')
		const variable = read('variable')
		if (VariableGetter.isNone(variable)) {
			return $('#setBoolean-variable').getFocus()
		}
		const operation = read('operation')
		const type = read('operand-type')
		let operand
		switch (type) {
			case 'constant': {
				const value = read('constant-value')
				operand = { type, value }
				break
			}
			case 'variable': {
				const variable = read('common-variable')
				if (VariableGetter.isNone(variable)) {
					return $('#setBoolean-common-variable').getFocus()
				}
				operand = { type, variable }
				break
			}
			case 'list': {
				const variable = read('common-variable')
				if (VariableGetter.isNone(variable)) {
					return $('#setBoolean-common-variable').getFocus()
				}
				const index = read('list-index')
				operand = { type, variable, index }
				break
			}
			case 'parameter': {
				const key = read('parameter-key')
				if (key === '') {
					return $('#setBoolean-parameter-key').getFocus()
				}
				operand = { type, key }
				break
			}
			case 'script': {
				const script = read('script').trim()
				if (script === '') {
					return $('#setBoolean-script').getFocus()
				}
				operand = { type, script }
				break
			}
		}
		Command.save({ variable, operation, operand })
	}
}

// 设置数值
Command.cases.setNumber = {
	initialize: function () {
		$('#setNumber-confirm').on('click', this.save)

		// 绑定操作数列表
		$('#setNumber-operands').bind(NumberOperand)

		// 清理内存 - 窗口已关闭事件
		$('#setNumber').on('closed', (event) => {
			$('#setNumber-operands').clear()
		})
	},
	parseOperation: function (operation) {
		switch (operation) {
			case 'set':
				return ' = '
			case 'add':
				return ' += '
			case 'sub':
				return ' -= '
			case 'mul':
				return ' *= '
			case 'div':
				return ' /= '
			case 'mod':
				return ' %= '
		}
	},
	parseOperands: function (operands) {
		let expression = ''
		let currentPriority
		let nextPriority = false
		const length = operands.length
		for (let i = 0; i < length; i++) {
			const operand = operands[i]
			let operandName = NumberOperand.parseOperand(operand)
			if (i !== 0)
				switch (operand.operation.replace('()', '')) {
					case 'add':
						expression += Command.setOperatorColor(' + ')
						break
					case 'sub':
						expression += Command.setOperatorColor(' - ')
						break
					case 'mul':
						expression += Command.setOperatorColor(' * ')
						break
					case 'div':
						expression += Command.setOperatorColor(' / ')
						break
					case 'mod':
						expression += Command.setOperatorColor(' % ')
						break
				}
			currentPriority = nextPriority
			nextPriority = operands[i + 1]?.operation.includes('()')
			if (!currentPriority && nextPriority) {
				operandName = Token('(') + operandName
			}
			if (currentPriority && !nextPriority) {
				operandName = operandName + Token(')')
			}
			expression += operandName
		}
		return expression
	},
	parse: function ({ variable, operation, operands }) {
		const varDesc = Command.parseVariable(
			variable,
			'number',
			operation === 'set'
		)
		const operator = Command.setOperatorColor(
			this.parseOperation(operation)
		)
		const expression = this.parseOperands(operands)
		return [
			{ color: 'variable' },
			{ text: Local.get('command.setNumber.alias') + ' ' },
			{ color: 'restore' },
			{ text: `${varDesc}${operator}${expression}` }
		]
	},
	load: function ({
		variable = { type: 'local', key: '' },
		operation = 'set',
		operands = [{ operation: 'add', type: 'constant', value: 0 }]
	}) {
		const write = getElementWriter('setNumber')
		write('variable', variable)
		write('operation', operation)
		write('operands', operands.slice())
		$('#setNumber-variable').getFocus()
	},
	save: function () {
		const read = getElementReader('setNumber')
		const variable = read('variable')
		if (VariableGetter.isNone(variable)) {
			return $('#setNumber-variable').getFocus()
		}
		const operation = read('operation')
		const operands = read('operands')
		if (operands.length === 0) {
			return $('#setNumber-operands').getFocus()
		}
		operands[0].operation = 'add'
		Command.save({ variable, operation, operands })
	}
}

// 设置字符串
Command.cases.setString = {
	initialize: function () {
		$('#setString-confirm').on('click', this.save)

		// 创建头部操作选项
		$('#setString-operation').loadItems([
			{ name: 'Set', value: 'set' },
			{ name: 'Add', value: 'add' }
		])

		// 创建类型选项
		$('#setString-operand-type').loadItems([
			{ name: 'Constant', value: 'constant' },
			{ name: 'Variable', value: 'variable' },
			{ name: 'Template String', value: 'template' },
			{ name: 'String Method', value: 'string' },
			{ name: 'Attribute Key', value: 'attribute' },
			{ name: 'Enumeration', value: 'enum' },
			{ name: 'Object', value: 'object' },
			{ name: 'Element', value: 'element' },
			{ name: 'List', value: 'list' },
			{ name: 'Parameter', value: 'parameter' },
			{ name: 'Script', value: 'script' },
			{ name: 'Other', value: 'other' }
		])

		// 设置类型关联元素
		$('#setString-operand-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'constant',
					targets: [$('#setString-operand-common-value')]
				},
				{
					case: 'variable',
					targets: [$('#setString-operand-common-variable')]
				},
				{
					case: 'template',
					targets: [$('#setString-operand-common-value')]
				},
				{
					case: 'string',
					targets: [
						$('#setString-operand-string-method'),
						$('#setString-operand-common-variable')
					]
				},
				{
					case: 'attribute',
					targets: [$('#setString-operand-attribute-attributeId')]
				},
				{
					case: 'enum',
					targets: [$('#setString-operand-enum-stringId')]
				},
				{
					case: 'object',
					targets: [$('#setString-operand-object-property')]
				},
				{
					case: 'element',
					targets: [
						$('#setString-operand-element-property'),
						$('#setString-operand-element-element')
					]
				},
				{
					case: 'list',
					targets: [
						$('#setString-operand-common-variable'),
						$('#setString-operand-list-index')
					]
				},
				{
					case: 'parameter',
					targets: [$('#setString-operand-parameter-key')]
				},
				{ case: 'script', targets: [$('#setString-operand-script')] },
				{ case: 'other', targets: [$('#setString-operand-other-data')] }
			])

		// 设置类型写入事件，切换变量输入框的过滤器
		$('#setString-operand-type').on('write', (event) => {
			let filter = 'all'
			switch (event.value) {
				case 'variable':
					filter = 'all'
					break
				case 'string':
					filter = 'string'
					break
				case 'object':
				case 'list':
					filter = 'object'
					break
			}
			$('#setString-operand-common-variable').filter = filter
		})

		// 创建字符串方法选项
		$('#setString-operand-string-method').loadItems([
			{ name: 'Char', value: 'char' },
			{ name: 'Slice', value: 'slice' },
			{ name: 'Pad Start', value: 'pad-start' },
			{ name: 'Replace', value: 'replace' },
			{ name: 'Replace All', value: 'replace-all' }
		])

		// 设置字符串方法关联元素
		$('#setString-operand-string-method')
			.enableHiddenMode()
			.relate([
				{
					case: 'char',
					targets: [$('#setString-operand-string-char-index')]
				},
				{
					case: 'slice',
					targets: [
						$('#setString-operand-string-slice-begin'),
						$('#setString-operand-string-slice-end')
					]
				},
				{
					case: 'pad-start',
					targets: [
						$('#setString-operand-string-pad-start-length'),
						$('#setString-operand-string-pad-start-pad')
					]
				},
				{
					case: ['replace', 'replace-all'],
					targets: [
						$('#setString-operand-string-replace-pattern'),
						$('#setString-operand-string-replace-replacement')
					]
				}
			])

		// 创建对象属性选项
		$('#setString-operand-object-property').loadItems([
			{ name: 'Actor - Team ID', value: 'actor-team-id' },
			{ name: 'Actor - File ID', value: 'actor-file-id' },
			{
				name: 'Actor - Anim Motion Name',
				value: 'actor-animation-motion-name'
			},
			{ name: 'Skill - File ID', value: 'skill-file-id' },
			{ name: 'Trigger - File ID', value: 'trigger-file-id' },
			{ name: 'State - File ID', value: 'state-file-id' },
			{ name: 'Equipment - File ID', value: 'equipment-file-id' },
			{ name: 'Equipment - Slot', value: 'equipment-slot' },
			{ name: 'Item - File ID', value: 'item-file-id' },
			{ name: 'File - ID', value: 'file-id' }
		])

		// 设置对象属性关联元素
		$('#setString-operand-object-property')
			.enableHiddenMode()
			.relate([
				{
					case: [
						'actor-team-id',
						'actor-file-id',
						'actor-animation-motion-name'
					],
					targets: [$('#setString-operand-common-actor')]
				},
				{
					case: 'skill-file-id',
					targets: [$('#setString-operand-common-skill')]
				},
				{
					case: 'trigger-file-id',
					targets: [$('#setString-operand-common-trigger')]
				},
				{
					case: 'state-file-id',
					targets: [$('#setString-operand-common-state')]
				},
				{
					case: ['equipment-file-id', 'equipment-slot'],
					targets: [$('#setString-operand-common-equipment')]
				},
				{
					case: 'item-file-id',
					targets: [$('#setString-operand-common-item')]
				},
				{
					case: 'file-id',
					targets: [$('#setString-operand-object-fileId')]
				}
			])

		// 创建元素属性选项
		$('#setString-operand-element-property').loadItems([
			{ name: 'Text - Content', value: 'text-content' },
			{ name: 'Text Box - Text', value: 'textBox-text' },
			{ name: 'Dialog Box - Content', value: 'dialogBox-content' }
		])

		// 创建其他数据选项
		$('#setString-operand-other-data').loadItems([
			{ name: 'Event Trigger Key', value: 'trigger-key' },
			{
				name: 'Start Position - Scene ID',
				value: 'start-position-scene-id'
			},
			{ name: 'Show Text - Content', value: 'showText-content' },
			{ name: 'Show Choices - Content', value: 'showChoices-content' },
			{ name: 'Parse Timestamp', value: 'parse-timestamp' },
			{ name: 'Screenshot(Base64)', value: 'screenshot' },
			{ name: 'Game Language', value: 'game-language' }
		])

		// 设置其他数据关联元素
		$('#setString-operand-other-data')
			.enableHiddenMode()
			.relate([
				{
					case: 'showChoices-content',
					targets: [
						$('#setString-operand-showChoices-content-choiceIndex')
					]
				},
				{
					case: 'parse-timestamp',
					targets: [
						$('#setString-operand-parse-timestamp-variable'),
						$('#setString-operand-parse-timestamp-format')
					]
				},
				{
					case: 'screenshot',
					targets: [
						$('#setString-operand-screenshot-width'),
						$('#setString-operand-screenshot-height')
					]
				}
			])
	},

	// 解析指令
	parse: function ({ variable, operation, operand }) {
		const varDesc = Command.parseVariable(
			variable,
			'string',
			operation === 'set'
		)
		const operator = Command.setOperatorColor(
			this.parseOperation(operation)
		)
		const expression = this.parseOperand(operand)
		return [
			{ color: 'variable' },
			{ text: Local.get('command.setString.alias') + ' ' },
			{ color: 'restore' },
			{ text: `${varDesc}${operator}${expression}` }
		]
	},

	// 加载数据
	load: function ({
		variable = { type: 'local', key: '' },
		operation = 'set',
		operand = { type: 'constant', value: '' }
	}) {
		// 写入数据
		let commonValue = ''
		let stringMethod = 'char'
		let commonVariable = { type: 'local', key: '' }
		let stringCharIndex = 0
		let stringSliceBegin = 0
		let stringSliceEnd = 0
		let stringPadStartLength = 2
		let stringPadStartPad = '0'
		let stringReplacePattern = ''
		let stringReplaceReplacement = ''
		let attributeId = ''
		let enumStringId = ''
		let objectProperty = 'actor-team-id'
		let elementProperty = 'text-content'
		let elementElement = { type: 'trigger' }
		let commonActor = { type: 'trigger' }
		let commonSkill = { type: 'trigger' }
		let commonTrigger = { type: 'trigger' }
		let commonState = { type: 'trigger' }
		let commonEquipment = { type: 'trigger' }
		let commonItem = { type: 'trigger' }
		let objectFileId = ''
		let listIndex = 0
		let parameterKey = ''
		let script = ''
		let otherData = 'trigger-key'
		let showChoicesIndex = 0
		let parseTimestampVariable = { type: 'local', key: '' }
		let parseTimestampFormat = '{Y}-{M}-{D} {h}:{m}:{s}'
		let screenshotWidth = 320
		let screenshotHeight = 180
		switch (operand.type) {
			case 'constant':
			case 'template':
				commonValue = operand.value
				break
			case 'variable':
				commonVariable = operand.variable
				break
			case 'string':
				stringMethod = operand.method
				commonVariable = operand.variable
				stringCharIndex = operand.index ?? stringCharIndex
				stringSliceBegin = operand.begin ?? stringSliceBegin
				stringSliceEnd = operand.end ?? stringSliceEnd
				stringPadStartLength = operand.length ?? stringPadStartLength
				stringPadStartPad = operand.pad ?? stringPadStartPad
				stringReplacePattern = operand.pattern ?? stringReplacePattern
				stringReplaceReplacement =
					operand.replacement ?? stringReplaceReplacement
				break
			case 'attribute':
				attributeId = operand.attributeId
				break
			case 'enum':
				enumStringId = operand.stringId
				break
			case 'object':
				objectProperty = operand.property
				commonActor = operand.actor ?? commonActor
				commonSkill = operand.skill ?? commonSkill
				commonTrigger = operand.trigger ?? commonTrigger
				commonState = operand.state ?? commonState
				commonEquipment = operand.equipment ?? commonEquipment
				commonItem = operand.item ?? commonItem
				objectFileId = operand.fileId ?? objectFileId
				break
			case 'element':
				elementProperty = operand.property
				elementElement = operand.element
				break
			case 'list':
				commonVariable = operand.variable
				listIndex = operand.index
				break
			case 'parameter':
				parameterKey = operand.key
				break
			case 'script':
				script = operand.script
				break
			case 'other':
				// 补丁：2023-1-18
				switch (operand.data) {
					case 'showChoices-content-0':
					case 'showChoices-content-1':
					case 'showChoices-content-2':
					case 'showChoices-content-3':
						operand.choiceIndex = parseInt(operand.data.slice(-1))
						operand.data = 'showChoices-content'
						break
				}
				otherData = operand.data
				showChoicesIndex = operand.choiceIndex ?? showChoicesIndex
				parseTimestampVariable =
					operand.variable ?? parseTimestampVariable
				parseTimestampFormat = operand.format ?? parseTimestampFormat
				screenshotWidth = operand.width ?? screenshotWidth
				screenshotHeight = operand.height ?? screenshotHeight
				break
		}
		const write = getElementWriter('setString')
		write('variable', variable)
		write('operation', operation)
		write('operand-type', operand.type)
		write('operand-common-value', commonValue)
		write('operand-string-method', stringMethod)
		write('operand-common-variable', commonVariable)
		write('operand-string-char-index', stringCharIndex)
		write('operand-string-slice-begin', stringSliceBegin)
		write('operand-string-slice-end', stringSliceEnd)
		write('operand-string-pad-start-length', stringPadStartLength)
		write('operand-string-pad-start-pad', stringPadStartPad)
		write('operand-string-replace-pattern', stringReplacePattern)
		write('operand-string-replace-replacement', stringReplaceReplacement)
		write('operand-attribute-attributeId', attributeId)
		write('operand-enum-stringId', enumStringId)
		write('operand-object-property', objectProperty)
		write('operand-element-property', elementProperty)
		write('operand-element-element', elementElement)
		write('operand-common-actor', commonActor)
		write('operand-common-skill', commonSkill)
		write('operand-common-trigger', commonTrigger)
		write('operand-common-state', commonState)
		write('operand-common-equipment', commonEquipment)
		write('operand-common-item', commonItem)
		write('operand-object-fileId', objectFileId)
		write('operand-list-index', listIndex)
		write('operand-parameter-key', parameterKey)
		write('operand-script', script)
		write('operand-other-data', otherData)
		write('operand-showChoices-content-choiceIndex', showChoicesIndex)
		write('operand-parse-timestamp-variable', parseTimestampVariable)
		write('operand-parse-timestamp-format', parseTimestampFormat)
		write('operand-screenshot-width', screenshotWidth)
		write('operand-screenshot-height', screenshotHeight)
		$('#setString-variable').getFocus()
	},

	// 保存数据
	save: function () {
		const read = getElementReader('setString')
		const variable = read('variable')
		if (VariableGetter.isNone(variable)) {
			return $('#setString-variable').getFocus()
		}
		const operation = read('operation')
		const type = read('operand-type')
		let operand
		switch (type) {
			case 'constant':
			case 'template': {
				const value = read('operand-common-value')
				operand = { type, value }
				break
			}
			case 'variable': {
				const variable = read('operand-common-variable')
				if (VariableGetter.isNone(variable)) {
					return $('#setString-operand-common-variable').getFocus()
				}
				operand = { type, variable }
				break
			}
			case 'string': {
				const method = read('operand-string-method')
				const variable = read('operand-common-variable')
				if (VariableGetter.isNone(variable)) {
					return $('#setString-operand-common-variable').getFocus()
				}
				switch (method) {
					case 'char': {
						const index = read('operand-string-char-index')
						operand = { type, method, variable, index }
						break
					}
					case 'slice': {
						const begin = read('operand-string-slice-begin')
						const end = read('operand-string-slice-end')
						operand = { type, method, variable, begin, end }
						break
					}
					case 'pad-start': {
						const length = read('operand-string-pad-start-length')
						const pad = read('operand-string-pad-start-pad')
						operand = { type, method, variable, length, pad }
						break
					}
					case 'replace':
					case 'replace-all': {
						const pattern = read('operand-string-replace-pattern')
						if (pattern === '') {
							return $(
								'#setString-operand-string-replace-pattern'
							).getFocus()
						}
						const replacement = read(
							'operand-string-replace-replacement'
						)
						operand = {
							type,
							method,
							variable,
							pattern,
							replacement
						}
						break
					}
				}
				break
			}
			case 'attribute': {
				const attributeId = read('operand-attribute-attributeId')
				if (attributeId === '') {
					return $(
						'#setString-operand-attribute-attributeId'
					).getFocus()
				}
				operand = { type, attributeId }
				break
			}
			case 'enum': {
				const stringId = read('operand-enum-stringId')
				if (stringId === '') {
					return $('#setString-operand-enum-stringId').getFocus()
				}
				operand = { type, stringId }
				break
			}
			case 'object': {
				const property = read('operand-object-property')
				switch (property) {
					case 'actor-team-id':
					case 'actor-file-id':
					case 'actor-animation-motion-name': {
						const actor = read('operand-common-actor')
						operand = { type, property, actor }
						break
					}
					case 'skill-file-id': {
						const skill = read('operand-common-skill')
						operand = { type, property, skill }
						break
					}
					case 'trigger-file-id': {
						const trigger = read('operand-common-trigger')
						operand = { type, property, trigger }
						break
					}
					case 'state-file-id': {
						const state = read('operand-common-state')
						operand = { type, property, state }
						break
					}
					case 'equipment-file-id':
					case 'equipment-slot': {
						const equipment = read('operand-common-equipment')
						operand = { type, property, equipment }
						break
					}
					case 'item-file-id': {
						const item = read('operand-common-item')
						operand = { type, property, item }
						break
					}
					case 'file-id': {
						const fileId = read('operand-object-fileId')
						if (fileId === '') {
							return $(
								'#setString-operand-object-fileId'
							).getFocus()
						}
						operand = { type, property, fileId }
						break
					}
				}
				break
			}
			case 'element': {
				const property = read('operand-element-property')
				const element = read('operand-element-element')
				operand = { type, property, element }
				break
			}
			case 'list': {
				const variable = read('operand-common-variable')
				const index = read('operand-list-index')
				if (VariableGetter.isNone(variable)) {
					return $('#setString-operand-common-variable').getFocus()
				}
				operand = { type, variable, index }
				break
			}
			case 'parameter': {
				const key = read('operand-parameter-key')
				if (key === '') {
					return $('#setString-operand-parameter-key').getFocus()
				}
				operand = { type, key }
				break
			}
			case 'script': {
				const script = read('operand-script').trim()
				if (script === '') {
					return $('#setString-operand-script').getFocus()
				}
				operand = { type, script }
				break
			}
			case 'other': {
				const data = read('operand-other-data')
				switch (data) {
					case 'showChoices-content': {
						const choiceIndex = read(
							'operand-showChoices-content-choiceIndex'
						)
						operand = { type, data, choiceIndex }
						break
					}
					case 'parse-timestamp': {
						const variable = read(
							'operand-parse-timestamp-variable'
						)
						const format = read('operand-parse-timestamp-format')
						if (VariableGetter.isNone(variable)) {
							return $(
								'#setString-operand-parse-timestamp-variable'
							).getFocus()
						}
						operand = { type, data, variable, format }
						break
					}
					case 'screenshot': {
						const width = read('operand-screenshot-width')
						const height = read('operand-screenshot-height')
						operand = { type, data, width, height }
						break
					}
					default:
						operand = { type, data }
						break
				}
				break
			}
		}
		Command.save({ variable, operation, operand })
	},

	// 解析字符串操作
	parseOperation: function (operation) {
		switch (operation) {
			case 'set':
				return ' = '
			case 'add':
				return ' += '
		}
	},

	// 解析字符串方法
	parseStringMethod: function (operand) {
		const method = operand.method
		const variable = operand.variable
		const methodName = Local.get('command.setString.string.' + method)
		const varName = Command.parseVariable(variable, 'string')
		switch (method) {
			case 'char': {
				const index = Command.parseVariableNumber(operand.index)
				return (
					methodName +
					Token('(') +
					varName +
					Token(', ') +
					index +
					Token(')')
				)
			}
			case 'slice': {
				const begin = Command.parseVariableNumber(operand.begin)
				const end = Command.parseVariableNumber(operand.end)
				return (
					methodName +
					Token('(') +
					varName +
					Token(', ') +
					begin +
					Token(', ') +
					end +
					Token(')')
				)
			}
			case 'pad-start': {
				const length = Command.setNumberColor(operand.length)
				const pad = Command.setStringColor(operand.pad)
				return (
					methodName +
					Token('(') +
					varName +
					Token(', ') +
					length +
					Token(', ') +
					pad +
					Token(')')
				)
			}
			case 'replace':
			case 'replace-all': {
				const pattern = Command.parseVariableString(operand.pattern)
				const replacement = Command.parseVariableString(
					operand.replacement
				)
				return (
					methodName +
					Token('(') +
					varName +
					Token(', ') +
					pattern +
					Token(', ') +
					replacement +
					Token(')')
				)
			}
		}
	},

	// 解析对象属性
	parseObjectProperty: function (operand) {
		const property = Local.get(
			'command.setString.object.' + operand.property
		)
		switch (operand.property) {
			case 'actor-team-id':
			case 'actor-file-id':
			case 'actor-animation-motion-name':
				return (
					Command.parseActor(operand.actor) +
					Token(' -> ') +
					property.replace('.', Token('.'))
				)
			case 'skill-file-id':
				return (
					Command.parseSkill(operand.skill) + Token(' -> ') + property
				)
			case 'trigger-file-id':
				return (
					Command.parseTrigger(operand.trigger) +
					Token(' -> ') +
					property
				)
			case 'state-file-id':
				return (
					Command.parseState(operand.state) + Token(' -> ') + property
				)
			case 'equipment-file-id':
			case 'equipment-slot':
				return (
					Command.parseEquipment(operand.equipment) +
					Token(' -> ') +
					property
				)
			case 'item-file-id':
				return (
					Command.parseItem(operand.item) + Token(' -> ') + property
				)
			case 'file-id':
				return (
					Command.parseFileName(operand.fileId) +
					Token(' -> ') +
					property
				)
		}
	},

	// 解析元素属性
	parseElementProperty: function (operand) {
		const element = Command.parseElement(operand.element)
		const property = Local.get(
			'command.setString.element.' + operand.property
		)
		return element + Token(' -> ') + property.replace('.', Token('.'))
	},

	// 解析其他数据
	parseOther: function (operand) {
		const label = Local.get(
			'command.setString.other.' + operand.data
		).replace('.', Token('.'))
		switch (operand.data) {
			case 'trigger-key':
			case 'start-position-scene-id':
			case 'showText-content':
			case 'game-language':
				return label
			// 补丁：2023-1-18
			case 'showChoices-content-0':
			case 'showChoices-content-1':
			case 'showChoices-content-2':
			case 'showChoices-content-3': {
				const label = Local.get(
					'command.setString.other.showChoices-content'
				)
				return (
					label +
					Token('[') +
					Command.setNumberColor(operand.data.slice(-1)) +
					Token(']')
				)
			}
			case 'showChoices-content':
				return (
					label +
					Token('[') +
					Command.parseVariableNumber(operand.choiceIndex) +
					Token(']')
				)
			case 'parse-timestamp': {
				const variable = Command.parseVariable(
					operand.variable,
					'number'
				)
				const format = Command.parseVariableString(operand.format)
				return (
					label +
					Token('(') +
					variable +
					Token(', ') +
					format +
					Token(')')
				)
			}
			case 'screenshot': {
				const width = Command.setNumberColor(operand.width)
				const height = Command.setNumberColor(operand.height)
				return (
					label +
					Token('(') +
					width +
					Token(', ') +
					height +
					Token(')')
				)
			}
		}
	},

	// 解析操作数
	parseOperand: function (operand) {
		switch (operand.type) {
			case 'constant':
				return Command.setStringColor(
					`"${Command.parseMultiLineString(operand.value)}"`
				)
			case 'template':
				return Command.parseVariableTemplate(operand.value)
			case 'variable':
				return Command.parseVariable(operand.variable, 'string')
			case 'string':
				return this.parseStringMethod(operand)
			case 'attribute':
				return Command.parseAttributeTag(operand.attributeId, 'string')
			case 'enum':
				return Command.parseEnumStringTag(operand.stringId)
			case 'object':
				return this.parseObjectProperty(operand)
			case 'element':
				return this.parseElementProperty(operand)
			case 'list':
				return Command.parseListItem(operand.variable, operand.index)
			case 'parameter':
				return Command.parseParameter(operand.key)
			case 'script':
				return operand.script
			case 'other':
				return this.parseOther(operand)
		}
	}
}

// 设置对象
Command.cases.setObject = {
	initialize: function () {
		$('#setObject-confirm').on('click', this.save)

		// 创建类型选项
		$('#setObject-operand-type').loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Actor', value: 'actor' },
			{ name: 'Skill', value: 'skill' },
			{ name: 'State', value: 'state' },
			{ name: 'Equipment', value: 'equipment' },
			{ name: 'Item', value: 'item' },
			{ name: 'Trigger', value: 'trigger' },
			{ name: 'Light', value: 'light' },
			{ name: 'Object', value: 'object' },
			{ name: 'Element', value: 'element' },
			{ name: 'Variable', value: 'variable' },
			{ name: 'List', value: 'list' }
		])

		// 设置类型关联元素
		$('#setObject-operand-type')
			.enableHiddenMode()
			.relate([
				{ case: 'actor', targets: [$('#setObject-operand-actor')] },
				{ case: 'skill', targets: [$('#setObject-operand-skill')] },
				{ case: 'state', targets: [$('#setObject-operand-state')] },
				{
					case: 'equipment',
					targets: [$('#setObject-operand-equipment')]
				},
				{ case: 'item', targets: [$('#setObject-operand-item')] },
				{ case: 'trigger', targets: [$('#setObject-operand-trigger')] },
				{ case: 'light', targets: [$('#setObject-operand-light')] },
				{ case: 'object', targets: [$('#setObject-operand-object')] },
				{ case: 'element', targets: [$('#setObject-operand-element')] },
				{
					case: 'variable',
					targets: [$('#setObject-operand-variable')]
				},
				{
					case: 'list',
					targets: [
						$('#setObject-operand-variable'),
						$('#setObject-operand-list-index')
					]
				}
			])
	},
	parseOperand: function (operand) {
		switch (operand.type) {
			case 'none':
				return Token('null')
			case 'actor':
				return Command.parseActor(operand.actor)
			case 'skill':
				return Command.parseSkill(operand.skill)
			case 'state':
				return Command.parseState(operand.state)
			case 'equipment':
				return Command.parseEquipment(operand.equipment)
			case 'item':
				return Command.parseItem(operand.item)
			case 'trigger':
				return Command.parseTrigger(operand.trigger)
			case 'light':
				return Command.parseLight(operand.light)
			case 'object':
				return Command.parseObject(operand.object)
			case 'element':
				return Command.parseElement(operand.element)
			case 'variable':
				return Command.parseVariable(operand.variable, 'object')
			case 'list':
				return Command.parseListItem(operand.variable, operand.index)
		}
	},
	parse: function ({ variable, operand }) {
		const varDesc = Command.parseVariable(variable, 'object', true)
		const object = this.parseOperand(operand)
		return [
			{ color: 'variable' },
			{ text: Local.get('command.setObject.alias') + ' ' },
			{ color: 'restore' },
			{ text: `${varDesc} ${Token('=')} ${object}` }
		]
	},
	load: function ({
		variable = { type: 'local', key: '' },
		operand = { type: 'none' }
	}) {
		const write = getElementWriter('setObject')
		let operandActor = { type: 'trigger' }
		let operandSkill = { type: 'trigger' }
		let operandState = { type: 'trigger' }
		let operandEquipment = { type: 'trigger' }
		let operandItem = { type: 'trigger' }
		let operandTrigger = { type: 'trigger' }
		let operandLight = { type: 'trigger' }
		let operandObject = { type: 'trigger' }
		let operandElement = { type: 'trigger' }
		let operandVariable = { type: 'local', key: '' }
		let operandListIndex = 0
		switch (operand.type) {
			case 'actor':
				operandActor = operand.actor
				break
			case 'skill':
				operandSkill = operand.skill
				break
			case 'state':
				operandState = operand.state
				break
			case 'equipment':
				operandEquipment = operand.equipment
				break
			case 'item':
				operandItem = operand.item
				break
			case 'trigger':
				operandTrigger = operand.trigger
				break
			case 'light':
				operandLight = operand.light
				break
			case 'object':
				operandObject = operand.object
				break
			case 'element':
				operandElement = operand.element
				break
			case 'variable':
				operandVariable = operand.variable
				break
			case 'list':
				operandVariable = operand.variable
				operandListIndex = operand.index
				break
		}
		write('variable', variable)
		write('operand-type', operand.type)
		write('operand-actor', operandActor)
		write('operand-skill', operandSkill)
		write('operand-state', operandState)
		write('operand-equipment', operandEquipment)
		write('operand-item', operandItem)
		write('operand-trigger', operandTrigger)
		write('operand-light', operandLight)
		write('operand-object', operandObject)
		write('operand-element', operandElement)
		write('operand-variable', operandVariable)
		write('operand-list-index', operandListIndex)
		$('#setObject-variable').getFocus()
	},
	save: function () {
		const read = getElementReader('setObject')
		const variable = read('variable')
		if (VariableGetter.isNone(variable)) {
			return $('#setObject-variable').getFocus()
		}
		const type = read('operand-type')
		let operand
		switch (type) {
			case 'none':
				operand = { type }
				break
			case 'actor': {
				const actor = read('operand-actor')
				operand = { type, actor }
				break
			}
			case 'skill': {
				const skill = read('operand-skill')
				operand = { type, skill }
				break
			}
			case 'state': {
				const state = read('operand-state')
				operand = { type, state }
				break
			}
			case 'equipment': {
				const equipment = read('operand-equipment')
				operand = { type, equipment }
				break
			}
			case 'item': {
				const item = read('operand-item')
				operand = { type, item }
				break
			}
			case 'trigger': {
				const trigger = read('operand-trigger')
				operand = { type, trigger }
				break
			}
			case 'light': {
				const light = read('operand-light')
				operand = { type, light }
				break
			}
			case 'object': {
				const object = read('operand-object')
				operand = { type, object }
				break
			}
			case 'element': {
				const element = read('operand-element')
				operand = { type, element }
				break
			}
			case 'variable': {
				const variable = read('operand-variable')
				if (VariableGetter.isNone(variable)) {
					return $('#setObject-operand-variable').getFocus()
				}
				operand = { type, variable }
				break
			}
			case 'list': {
				const variable = read('operand-variable')
				if (VariableGetter.isNone(variable)) {
					return $('#setObject-operand-variable').getFocus()
				}
				const index = read('operand-list-index')
				operand = { type, variable, index }
				break
			}
		}
		Command.save({ variable, operand })
	}
}

// 设置列表
Command.cases.setList = {
	initialize: function () {
		$('#setList-confirm').on('click', this.save)

		// 创建操作选项
		$('#setList-operation').loadItems([
			{ name: 'Set to Empty', value: 'set-empty' },
			{ name: 'Set Numbers', value: 'set-numbers' },
			{ name: 'Set Strings', value: 'set-strings' },
			{ name: 'Set Boolean', value: 'set-boolean' },
			{ name: 'Set Number', value: 'set-number' },
			{ name: 'Set String', value: 'set-string' },
			{ name: 'Set Variable', value: 'set-variable' },
			{ name: 'Split String', value: 'split-string' },
			{ name: 'Push', value: 'push' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Get Attribute Names', value: 'get-attribute-names' },
			{ name: 'Get Attribute Keys', value: 'get-attribute-keys' },
			{ name: 'Get Enumeration Names', value: 'get-enum-names' },
			{ name: 'Get Enumeration Values', value: 'get-enum-values' },
			{ name: 'Get Actor Targets', value: 'get-actor-targets' }
		])

		// 设置操作关联元素
		$('#setList-operation')
			.enableHiddenMode()
			.relate([
				{ case: 'set-numbers', targets: [$('#setList-numbers')] },
				{ case: 'set-strings', targets: [$('#setList-strings')] },
				{
					case: 'set-boolean',
					targets: [
						$('#setList-index'),
						$('#setList-index-skip-check'),
						$('#setList-boolean')
					]
				},
				{
					case: 'set-number',
					targets: [
						$('#setList-index'),
						$('#setList-index-skip-check'),
						$('#setList-number')
					]
				},
				{
					case: 'set-string',
					targets: [
						$('#setList-index'),
						$('#setList-index-skip-check'),
						$('#setList-string')
					]
				},
				{
					case: 'set-variable',
					targets: [
						$('#setList-index'),
						$('#setList-index-skip-check'),
						$('#setList-operand')
					]
				},
				{
					case: 'split-string',
					targets: [$('#setList-operand'), $('#setList-separator')]
				},
				{ case: ['push', 'remove'], targets: [$('#setList-operand')] },
				{
					case: ['get-attribute-names', 'get-attribute-keys'],
					targets: [$('#setList-attribute-groupId')]
				},
				{
					case: ['get-enum-names', 'get-enum-values'],
					targets: [$('#setList-enum-groupId')]
				},
				{ case: 'get-actor-targets', targets: [$('#setList-actor')] }
			])

		// 创建布尔值常量选项
		$('#setList-boolean').loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		])
	},
	parse: function ({
		variable,
		operation,
		list,
		index,
		constant,
		operand,
		separator,
		groupId,
		actor,
		skipCheck = true
	}) {
		let info
		let isLeftValue = true
		switch (operation) {
			case 'set-boolean':
			case 'set-number':
			case 'set-string':
			case 'set-variable':
			case 'push':
			case 'remove':
				isLeftValue = false
				break
		}
		const varName = Command.parseVariable(variable, 'object', isLeftValue)
		const equal = Command.setOperatorColor('=')
		switch (operation) {
			case 'set-empty':
				info = `${varName} ${equal} ${Token('[') + Token(']')}`
				break
			case 'set-numbers': {
				let values = ''
				if (list.length !== 0) {
					for (const number of list) {
						if (values !== '') {
							values += Token(', ')
						}
						values += Command.setNumberColor(number)
					}
				}
				info = `${varName} ${equal} ${Token('[') + values + Token(']')}`
				break
			}
			case 'set-strings': {
				let values = ''
				if (list.length !== 0) {
					for (const string of list) {
						if (values !== '') {
							values += Token(', ')
						}
						values += Command.setStringColor(`"${string}"`)
					}
					values = Command.parseMultiLineString(values)
				}
				info = `${varName} ${equal} ${Token('[') + values + Token(']')}`
				break
			}
			case 'set-boolean':
				info = `${varName}${
					Token('[') + Command.parseVariableNumber(index) + Token(']')
				} ${equal} ${Command.setBooleanColor(constant)}`
				if (skipCheck) {
					info += `, ${Local.get('command.setList.skipCheck')}`
				}
				break
			case 'set-number':
				info = `${varName}${
					Token('[') + Command.parseVariableNumber(index) + Token(']')
				} ${equal} ${Command.setNumberColor(constant)}`
				if (skipCheck) {
					info += `, ${Local.get('command.setList.skipCheck')}`
				}
				break
			case 'set-string': {
				const string = Command.setStringColor(
					'"' + Command.parseMultiLineString(constant) + '"'
				)
				info = `${varName}${
					Token('[') + Command.parseVariableNumber(index) + Token(']')
				} ${equal} ${string}`
				if (skipCheck) {
					info += `, ${Local.get('command.setList.skipCheck')}`
				}
				break
			}
			case 'set-variable':
				info = `${varName}${
					Token('[') + Command.parseVariableNumber(index) + Token(']')
				} ${equal} ${Command.parseVariable(operand, 'any')}`
				if (skipCheck) {
					info += `, ${Local.get('command.setList.skipCheck')}`
				}
				break
			case 'split-string': {
				const label = Local.get('command.setList.split-string')
				const text1 = Command.parseVariable(operand, 'string')
				const text2 = Command.parseVariableString(separator)
				const comma = Command.setDelimiterColor(', ')
				info = `${varName} ${equal} ${label}${Token(
					'('
				)}${text1}${comma}${text2}${Token(')')}`
				break
			}
			case 'push':
				info = `${varName} ${Command.setOperatorColor(
					'+='
				)} ${Command.parseVariable(operand, 'any')}`
				break
			case 'remove':
				info = `${varName} ${Command.setOperatorColor(
					'-='
				)} ${Command.parseVariable(operand, 'any')}`
				break
			case 'get-attribute-names':
			case 'get-attribute-keys': {
				const label = Local.get('command.setList.' + operation)
				const group = Command.parseAttributeGroup(groupId)
				info = `${varName} ${equal} ${label}${Token('(')}${group}${Token(')')}`
				break
			}
			case 'get-enum-names':
			case 'get-enum-values': {
				const label = Local.get('command.setList.' + operation)
				const group = Command.parseEnumGroup(groupId)
				info = `${varName} ${equal} ${label}${Token('(')}${group}${Token(')')}`
				break
			}
			case 'get-actor-targets': {
				const label = Local.get('command.setList.' + operation)
				const actorInfo = Command.parseActor(actor)
				info = `${varName} ${equal} ${label}${Token('(')}${actorInfo}${Token(
					')'
				)}`
				break
			}
		}
		return [
			{ color: 'variable' },
			{ text: Local.get('command.setList.alias') + ' ' },
			{ color: 'restore' },
			{ text: info }
		]
	},
	load: function ({
		variable = { type: 'local', key: '' },
		operation = 'set-empty',
		list = [],
		index = 0,
		constant = 0,
		operand = { type: 'local', key: '' },
		separator = '',
		groupId = '',
		actor = { type: 'trigger' },
		skipCheck = true
	}) {
		let numbers = []
		let strings = []
		let boolean = false
		let number = 0
		let string = ''
		let attrGroupId = ''
		let enumGroupId = ''
		switch (operation) {
			case 'set-numbers':
				numbers = list
				break
			case 'set-strings':
				strings = list
				break
			case 'set-boolean':
				boolean = constant
				break
			case 'set-number':
				number = constant
				break
			case 'set-string':
				string = constant
				break
			case 'get-attribute-names':
			case 'get-attribute-keys':
				attrGroupId = groupId
				break
			case 'get-enum-names':
			case 'get-enum-values':
				enumGroupId = groupId
				break
		}
		const write = getElementWriter('setList')
		write('variable', variable)
		write('operation', operation)
		write('numbers', numbers)
		write('strings', strings)
		write('index', index)
		write('boolean', boolean)
		write('number', number)
		write('string', string)
		write('operand', operand)
		write('separator', separator)
		write('attribute-groupId', attrGroupId)
		write('enum-groupId', enumGroupId)
		write('actor', actor)
		write('index-skip-check', skipCheck)
		$('#setList-variable').getFocus()
	},
	save: function () {
		const read = getElementReader('setList')
		const variable = read('variable')
		if (VariableGetter.isNone(variable)) {
			return $('#setList-variable').getFocus()
		}
		const operation = read('operation')
		switch (operation) {
			case 'set-empty':
				Command.save({ variable, operation })
				break
			case 'set-numbers': {
				const list = read('numbers')
				if (list.length === 0) {
					return $('#setList-numbers').getFocus()
				}
				Command.save({ variable, operation, list })
				break
			}
			case 'set-strings': {
				const list = read('strings')
				if (list.length === 0) {
					return $('#setList-strings').getFocus()
				}
				Command.save({ variable, operation, list })
				break
			}
			case 'set-boolean': {
				const index = read('index')
				const skipCheck = read('index-skip-check')
				const constant = read('boolean')
				Command.save({
					variable,
					operation,
					index,
					constant,
					skipCheck
				})
				break
			}
			case 'set-number': {
				const index = read('index')
				const skipCheck = read('index-skip-check')
				const constant = read('number')
				Command.save({
					variable,
					operation,
					index,
					constant,
					skipCheck
				})
				break
			}
			case 'set-string': {
				const index = read('index')
				const skipCheck = read('index-skip-check')
				const constant = read('string')
				Command.save({
					variable,
					operation,
					index,
					constant,
					skipCheck
				})
				break
			}
			case 'set-variable': {
				const index = read('index')
				const skipCheck = read('index-skip-check')
				const operand = read('operand')
				if (VariableGetter.isNone(operand)) {
					return $('#setList-operand').getFocus()
				}
				Command.save({ variable, operation, index, operand, skipCheck })
				break
			}
			case 'split-string': {
				const operand = read('operand')
				if (VariableGetter.isNone(operand)) {
					return $('#setList-operand').getFocus()
				}
				const separator = read('separator')
				Command.save({ variable, operation, operand, separator })
				break
			}
			case 'push':
			case 'remove': {
				const operand = read('operand')
				if (VariableGetter.isNone(operand)) {
					return $('#setList-operand').getFocus()
				}
				Command.save({ variable, operation, operand })
				break
			}
			case 'get-attribute-names':
			case 'get-attribute-keys': {
				const groupId = read('attribute-groupId')
				if (groupId === '') {
					return $('#setList-attribute-groupId').getFocus()
				}
				Command.save({ variable, operation, groupId })
				break
			}
			case 'get-enum-names':
			case 'get-enum-values': {
				const groupId = read('enum-groupId')
				if (groupId === '') {
					return $('#setList-enum-groupId').getFocus()
				}
				Command.save({ variable, operation, groupId })
				break
			}
			case 'get-actor-targets': {
				const actor = read('actor')
				Command.save({ variable, operation, actor })
				break
			}
		}
	}
}

// 删除变量
Command.cases.deleteVariable = {
	initialize: function () {
		$('#deleteVariable-confirm').on('click', this.save)
	},
	parse: function ({ variable }) {
		return [
			{ color: 'variable' },
			{ text: Local.get('command.deleteVariable.alias') + ' ' },
			{ color: 'restore' },
			{ text: Command.parseVariable(variable, 'any') }
		]
	},
	load: function ({ variable = { type: 'local', key: '' } }) {
		$('#deleteVariable-variable').write(variable)
		$('#deleteVariable-variable').getFocus()
	},
	save: function () {
		const elVariable = $('#deleteVariable-variable')
		const variable = elVariable.read()
		if (VariableGetter.isNone(variable)) {
			return elVariable.getFocus()
		}
		Command.save({ variable })
	}
}

// 分支条件
Command.cases.if = {
	elseCommands: null,
	initialize: function () {
		$('#if-confirm').on('click', this.save)

		// 绑定分支列表
		$('#if-branches').bind(IfBranch)

		// 绑定条件列表
		$('#if-branch-conditions').bind(IfCondition)

		// 清理内存 - 窗口已关闭事件
		$('#if').on('closed', (event) => {
			this.elseCommands = null
			$('#if-branches').clear()
		})
	},
	parse: function ({ branches, elseCommands }) {
		const contents = [{ fold: true }]
		const textIf = Local.get('command.if')
		const textElse = Local.get('command.if.else')
		for (let index = 0; index < branches.length; index++) {
			const branch = branches[index]
			contents.push(
				{ color: 'flow' },
				...(index === 0 ? [] : [{ text: textElse + ' ' }]),
				{ text: textIf + ' ' },
				{ color: 'normal' },
				{ text: IfBranch.parse(branch) },
				{ children: branch.commands }
			)
		}
		if (elseCommands) {
			contents.push(
				{ color: 'flow' },
				{ text: Local.get('command.if.else') },
				{ children: elseCommands }
			)
		}
		contents.push({ color: 'flow' }, { text: Local.get('command.if.end') })
		return contents
	},
	load: function ({ branches = [], elseCommands = null }) {
		const write = getElementWriter('if')
		write('branches', branches.slice())
		write('else', !!elseCommands)
		Command.cases.if.elseCommands = elseCommands
		$('#if-branches').getFocus()
	},
	save: function () {
		const read = getElementReader('if')
		const branches = read('branches')
		if (branches.length === 0) {
			return $('#if-branches').getFocus()
		}
		switch (read('else')) {
			case true: {
				const elseCommands = Command.cases.if.elseCommands ?? []
				Command.save({ branches, elseCommands })
				break
			}
			case false:
				Command.save({ branches })
				break
		}
	}
}

// 匹配
Command.cases.switch = {
	defaultCommands: null,
	initialize: function () {
		$('#switch-confirm').on('click', this.save)

		// 绑定分支列表
		$('#switch-branches').bind(SwitchBranch)

		// 绑定条件列表
		$('#switch-branch-conditions').bind(SwitchCondition)

		// 清理内存 - 窗口已关闭事件
		$('#switch').on('closed', (event) => {
			this.defaultCommands = null
			$('#switch-branches').clear()
		})
	},
	parse: function ({ variable, branches, defaultCommands }) {
		const contents = [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.switch') + ' ' },
			{ color: 'normal' },
			{ text: Command.parseVariable(variable, 'any') },
			{ break: true }
		]
		const textCase = Local.get('command.switch.case')
		for (const branch of branches) {
			contents.push(
				{ color: 'flow' },
				{ text: textCase + ' ' },
				{ color: 'normal' },
				{ text: SwitchBranch.parse(branch) },
				{ children: branch.commands }
			)
		}
		if (defaultCommands) {
			contents.push(
				{ color: 'flow' },
				{ text: Local.get('command.switch.default') },
				{ children: defaultCommands }
			)
		}
		contents.push(
			{ color: 'flow' },
			{ text: Local.get('command.switch.end') }
		)
		return contents
	},
	load: function ({
		variable = { type: 'local', key: '' },
		branches = [],
		defaultCommands = null
	}) {
		const write = getElementWriter('switch')
		write('variable', variable)
		write('branches', branches.slice())
		write('default', !!defaultCommands)
		Command.cases.switch.defaultCommands = defaultCommands
		$('#switch-variable').getFocus()
	},
	save: function () {
		const read = getElementReader('switch')
		const variable = read('variable')
		if (VariableGetter.isNone(variable)) {
			return $('#switch-variable').getFocus()
		}
		const branches = read('branches')
		if (branches.length === 0) {
			return $('#switch-branches').getFocus()
		}
		switch (read('default')) {
			case true: {
				const defaultCommands =
					Command.cases.switch.defaultCommands ?? []
				Command.save({ variable, branches, defaultCommands })
				break
			}
			case false:
				Command.save({ variable, branches })
				break
		}
	}
}

// 循环
Command.cases.loop = {
	commands: null,
	initialize: function () {
		$('#loop-confirm').on('click', this.save)

		// 绑定条件列表
		$('#loop-conditions').bind(IfCondition)

		// 创建模式选项
		$('#loop-mode').loadItems([
			{ name: 'Meet All', value: 'all' },
			{ name: 'Meet Any', value: 'any' }
		])

		// 清理内存 - 窗口已关闭事件
		$('#loop').on('closed', (event) => {
			this.commands = null
			$('#loop-conditions').clear()
		})
	},
	parse: function ({ mode, conditions, commands }) {
		const contents = [{ fold: true }, { color: 'flow' }]
		if (conditions.length !== 0) {
			const condition = IfBranch.parse({ mode, conditions })
			contents.push(
				{ text: Local.get('command.loop.while') },
				{ color: 'restore' },
				{ text: ' ' + condition }
			)
		} else {
			contents.push({ text: Local.get('command.loop') })
		}
		contents.push(
			{ children: commands },
			{ color: 'flow' },
			{ text: Local.get('command.loop.end') }
		)
		return contents
	},
	load: function ({ mode = 'all', conditions = [], commands = [] }) {
		const write = getElementWriter('loop')
		write('mode', mode)
		write('conditions', conditions.slice())
		Command.cases.loop.commands = commands
		$('#loop-conditions').getFocus()
	},
	save: function () {
		const read = getElementReader('loop')
		const mode = read('mode')
		const conditions = read('conditions')
		const commands = Command.cases.loop.commands
		Command.save({ mode, conditions, commands })
	}
}

// 遍历
Command.cases.forEach = {
	commands: null,
	initialize: function () {
		$('#forEach-confirm').on('click', this.save)

		// 创建数据选项
		$('#forEach-data').loadItems([
			{ name: 'List', value: 'list' },
			{ name: 'Skill', value: 'skill' },
			{ name: 'State', value: 'state' },
			{ name: 'Equipment', value: 'equipment' },
			{ name: 'Inventory', value: 'inventory' },
			{ name: 'Element', value: 'element' },
			{ name: 'Party Member', value: 'member' },
			{ name: 'Attribute Key', value: 'attribute' },
			{ name: 'Enumeration Value', value: 'enum' },
			{ name: 'Save Data', value: 'save' },
			{ name: 'Touch Point', value: 'touch' },
			{ name: 'Changed Touch Point', value: 'changed-touch' }
		])

		// 设置数据关联元素
		$('#forEach-data')
			.enableHiddenMode()
			.relate([
				{
					case: 'list',
					targets: [$('#forEach-list'), $('#forEach-variable')]
				},
				{
					case: ['skill', 'state', 'equipment', 'inventory'],
					targets: [$('#forEach-actor'), $('#forEach-variable')]
				},
				{
					case: 'element',
					targets: [$('#forEach-element'), $('#forEach-variable')]
				},
				{ case: 'member', targets: [$('#forEach-variable')] },
				{
					case: 'attribute',
					targets: [
						$('#forEach-attribute-groupId'),
						$('#forEach-variable')
					]
				},
				{
					case: 'enum',
					targets: [
						$('#forEach-enum-groupId'),
						$('#forEach-variable')
					]
				},
				{ case: 'save', targets: [$('#forEach-saveIndex')] },
				{
					case: ['touch', 'changed-touch'],
					targets: [$('#forEach-touchId')]
				}
			])

		// 清理内存 - 窗口已关闭事件
		$('#forEach').on('closed', (event) => {
			this.commands = null
		})
	},
	parse: function ({
		data,
		list,
		actor,
		element,
		groupId,
		variable,
		saveIndex,
		touchId,
		commands
	}) {
		const dataInfo = Local.get('command.forEach.' + data)
		const words = Command.words
		switch (data) {
			case 'list': {
				const varName = Command.parseVariable(variable, 'any', true)
				const listName = Command.parseVariable(list, 'object')
				words.push(
					varName + Token(' = ') + listName + Token(' -> ') + dataInfo
				)
				break
			}
			case 'skill':
			case 'state':
			case 'equipment':
			case 'inventory': {
				const varName = Command.parseVariable(variable, 'object', true)
				const actorInfo = Command.parseActor(actor)
				words.push(
					varName +
						Token(' = ') +
						actorInfo +
						Token(' -> ') +
						dataInfo
				)
				break
			}
			case 'element': {
				const varName = Command.parseVariable(variable, 'object', true)
				const elInfo = Command.parseElement(element)
				words.push(
					varName + Token(' = ') + elInfo + Token(' -> ') + dataInfo
				)
				break
			}
			case 'member': {
				const varName = Command.parseVariable(variable, 'object', true)
				words.push(varName + Token(' = ') + dataInfo)
				break
			}
			case 'attribute': {
				const varName = Command.parseVariable(variable, 'string', true)
				const group = Command.parseAttributeGroup(groupId)
				words.push(
					varName + Token(' = ') + group + Token(' -> ') + dataInfo
				)
				break
			}
			case 'enum': {
				const varName = Command.parseVariable(variable, 'string', true)
				const group = Command.parseEnumGroup(groupId)
				words.push(
					varName + Token(' = ') + group + Token(' -> ') + dataInfo
				)
				break
			}
			case 'save': {
				const varName = Command.parseVariable(saveIndex, 'number', true)
				words.push(
					Token('{') +
						varName +
						Command.setDelimiterColor(', ...}') +
						Token(' = ') +
						dataInfo
				)
				break
			}
			case 'touch':
			case 'changed-touch': {
				const varName = Command.parseVariable(touchId, 'number', true)
				words.push(varName + Token(' = ') + dataInfo)
				break
			}
		}
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.forEach') + ' ' },
			{ color: 'restore' },
			{ text: words.join() },
			{ children: commands },
			{ color: 'flow' },
			{ text: Local.get('command.forEach.end') }
		]
	},
	load: function ({
		data = 'list',
		list = { type: 'local', key: '' },
		actor = { type: 'trigger' },
		element = { type: 'trigger' },
		groupId = '',
		variable = { type: 'local', key: '' },
		saveIndex = { type: 'local', key: '' },
		touchId = { type: 'local', key: '' },
		commands = []
	}) {
		let attrGroupId = ''
		let enumGroupId = ''
		switch (data) {
			case 'attribute':
				attrGroupId = groupId
				break
			case 'enum':
				enumGroupId = groupId
				break
		}
		const write = getElementWriter('forEach')
		write('data', data)
		write('list', list)
		write('actor', actor)
		write('element', element)
		write('attribute-groupId', attrGroupId)
		write('enum-groupId', enumGroupId)
		write('variable', variable)
		write('saveIndex', saveIndex)
		write('touchId', touchId)
		Command.cases.forEach.commands = commands
		$('#forEach-data').getFocus()
	},
	save: function () {
		const read = getElementReader('forEach')
		const data = read('data')
		const commands = Command.cases.forEach.commands
		switch (data) {
			case 'list': {
				const list = read('list')
				if (VariableGetter.isNone(list)) {
					return $('#forEach-list').getFocus()
				}
				const variable = read('variable')
				if (VariableGetter.isNone(variable)) {
					return $('#forEach-variable').getFocus()
				}
				Command.save({ data, list, variable, commands })
				break
			}
			case 'skill':
			case 'state':
			case 'equipment':
			case 'inventory': {
				const actor = read('actor')
				const variable = read('variable')
				if (VariableGetter.isNone(variable)) {
					return $('#forEach-variable').getFocus()
				}
				Command.save({ data, actor, variable, commands })
				break
			}
			case 'element': {
				const element = read('element')
				const variable = read('variable')
				if (VariableGetter.isNone(variable)) {
					return $('#forEach-variable').getFocus()
				}
				Command.save({ data, element, variable, commands })
				break
			}
			case 'member':
				const variable = read('variable')
				if (VariableGetter.isNone(variable)) {
					return $('#forEach-variable').getFocus()
				}
				Command.save({ data, variable, commands })
				break
			case 'attribute': {
				const groupId = read('attribute-groupId')
				if (groupId === '') {
					return $('#forEach-attribute-groupId').getFocus()
				}
				const variable = read('variable')
				if (VariableGetter.isNone(variable)) {
					return $('#forEach-variable').getFocus()
				}
				Command.save({ data, groupId, variable, commands })
				break
			}
			case 'enum': {
				const groupId = read('enum-groupId')
				if (groupId === '') {
					return $('#forEach-enum-groupId').getFocus()
				}
				const variable = read('variable')
				if (VariableGetter.isNone(variable)) {
					return $('#forEach-variable').getFocus()
				}
				Command.save({ data, groupId, variable, commands })
				break
			}
			case 'save': {
				const saveIndex = read('saveIndex')
				if (VariableGetter.isNone(saveIndex)) {
					return $('#forEach-saveIndex').getFocus()
				}
				Command.save({ data, saveIndex, commands })
				break
			}
			case 'touch':
			case 'changed-touch': {
				const touchId = read('touchId')
				if (VariableGetter.isNone(touchId)) {
					return $('#forEach-touchId').getFocus()
				}
				Command.save({ data, touchId, commands })
				break
			}
		}
	}
}

// 跳出循环
Command.cases.break = {
	parse: function () {
		return [{ color: 'flow' }, { text: Local.get('command.break') }]
	},
	save: function () {
		Command.save({})
	}
}

// 继续循环
Command.cases.continue = {
	parse: function () {
		return [{ color: 'flow' }, { text: Local.get('command.continue') }]
	},
	save: function () {
		Command.save({})
	}
}

// 独立执行
Command.cases.independent = {
	parse: function ({ commands }) {
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.independent') },
			{ children: commands },
			{ text: Local.get('command.independent.end') }
		]
	},
	save: function () {
		Command.save({ commands: [] })
	}
}

// 调用事件
Command.cases.callEvent = {
	windowFrame: $('#callEvent'),
	gridBox: $('#callEvent').querySelector('grid-box'),
	eventArgs: [],
	parameters: [],
	eventResult: null,
	initialize: function () {
		$('#callEvent-confirm').on('click', this.save)

		// 创建类型选项
		$('#callEvent-type').loadItems([
			{ name: 'Global', value: 'global' },
			{ name: 'Inherited', value: 'inherited' },
			{ name: 'Scene', value: 'scene' },
			{ name: 'Actor', value: 'actor' },
			{ name: 'Skill', value: 'skill' },
			{ name: 'State', value: 'state' },
			{ name: 'Equipment', value: 'equipment' },
			{ name: 'Item', value: 'item' },
			{ name: 'Light', value: 'light' },
			{ name: 'Element', value: 'element' }
		])

		// 设置关联元素
		$('#callEvent-type')
			.enableHiddenMode()
			.relate([
				{ case: 'global', targets: [$('#callEvent-eventId')] },
				{ case: 'scene', targets: [$('#callEvent-eventType')] },
				{
					case: 'actor',
					targets: [$('#callEvent-actor'), $('#callEvent-eventType')]
				},
				{
					case: 'skill',
					targets: [$('#callEvent-skill'), $('#callEvent-eventType')]
				},
				{
					case: 'state',
					targets: [$('#callEvent-state'), $('#callEvent-eventType')]
				},
				{
					case: 'equipment',
					targets: [
						$('#callEvent-equipment'),
						$('#callEvent-eventType')
					]
				},
				{
					case: 'item',
					targets: [$('#callEvent-item'), $('#callEvent-eventType')]
				},
				{
					case: 'light',
					targets: [$('#callEvent-light'), $('#callEvent-eventType')]
				},
				{
					case: 'element',
					targets: [
						$('#callEvent-element'),
						$('#callEvent-eventType')
					]
				}
			])

		// 窗口 - 已关闭事件
		this.windowFrame.on('closed', (event) => {
			this.eventArgs = []
			this.clearGlobalEventElements()
		})

		// 类型 - 写入事件
		$('#callEvent-type').on('write', (event) => {
			const type = event.value
			// 加载事件类型选项(创建了全局事件类型但是没用到)
			if (type !== 'inherited') {
				const elEventType = $('#callEvent-eventType')
				const eventTypes = Enum.getMergedItems(
					EventEditor.types[type],
					type + '-event'
				)
				elEventType.loadItems(eventTypes)
				elEventType.createTooltip()
				elEventType.write(eventTypes[0].value)
			}
			// 显示或隐藏全局事件参数和返回值元素组件
			for (const element of $('.call-event-component')) {
				type === 'global' ? element.show() : element.hide()
			}
			this.resizeWindow()
		})

		// 全局事件ID - 写入事件
		$('#callEvent-eventId').on('write', (event) => {
			this.eventArgs = this.readEventArgs()
			this.clearGlobalEventElements()
			const id = event.value
			if (id !== '') {
				const flags = {}
				const globalEvent = Data.events[id]
				for (const parameter of globalEvent.parameters) {
					if (parameter.key in flags) {
						continue
					}
					flags[parameter.key] = true
					this.createParameterElements(parameter)
				}
				this.createEventResultElements(globalEvent.returnType)
			}
			this.resizeWindow()
		})

		// 全局事件ID - 输入事件
		$('#callEvent-eventId').on('input', (event) => {
			this.writeEventArgs(this.eventArgs)
		})
	},
	// 调整窗口大小
	resizeWindow: function () {
		this.windowFrame.style.height = `${this.gridBox.clientHeight + 78}px`
	},
	// 清除全局事件元素
	clearGlobalEventElements: function () {
		const { parameters } = this
		if (parameters.length !== 0) {
			for (const { label, input } of parameters) {
				label.remove()
				input.remove()
			}
			parameters.length = 0
		}
		const { eventResult } = this
		if (eventResult) {
			eventResult.label.remove()
			eventResult.input.remove()
			this.eventResult = null
		}
	},
	// 创建参数元素
	createParameterElements: function (parameter) {
		const { type, key, note } = parameter
		const label = document.createElement('text')
		const name = key ? key.charAt(0).toUpperCase() + key.slice(1) : ''
		label.textContent = name
		let input
		switch (type) {
			case 'boolean':
				input = new SelectBox()
				input.loadItems([
					{ name: 'False', value: false },
					{ name: 'True', value: true }
				])
				break
			case 'number':
				input = new NumberVar()
				input.numBox.input.min = '-1000000000'
				input.numBox.input.max = '1000000000'
				input.numBox.decimals = 10
				break
			case 'string':
				input = new TextAreaVar()
				input.strBox.setAttribute(
					'menu',
					'tag-local-var tag-global-var tag-dynamic-global-var tag-localization'
				)
				input.addClass('callEvent-argument-string')
				input.on('change', () => this.resizeWindow())
				Selection.addEventListeners(input.strBox)
				break
			case 'object':
				input = new CustomBox()
				input.type = 'variable'
				input.filter = 'object'
				break
			case 'actor':
				input = new CustomBox()
				input.type = 'actor'
				break
			case 'skill':
				input = new CustomBox()
				input.type = 'skill'
				break
			case 'state':
				input = new CustomBox()
				input.type = 'state'
				break
			case 'equipment':
				input = new CustomBox()
				input.type = 'equipment'
				break
			case 'item':
				input = new CustomBox()
				input.type = 'item'
				break
			case 'trigger':
				input = new CustomBox()
				input.type = 'trigger'
				break
			case 'light':
				input = new CustomBox()
				input.type = 'light'
				break
			case 'element':
				input = new CustomBox()
				input.type = 'element'
				break
		}
		if (note) {
			input.setTooltip(`<b>${name}</b>\n${note}`)
		}
		label.addClass('call-event-component')
		input.addClass('call-event-component')
		this.gridBox.appendChild(label)
		this.gridBox.appendChild(input)
		this.parameters.push({ key, type, label, input })
	},
	// 创建返回值元素
	createEventResultElements: function (type) {
		let input
		switch (type) {
			case 'none':
				return
			case 'boolean':
				input = new CustomBox()
				input.type = 'variable'
				input.filter = 'boolean'
				break
			case 'number':
				input = new CustomBox()
				input.type = 'variable'
				input.filter = 'number'
				break
			case 'string':
				input = new CustomBox()
				input.type = 'variable'
				input.filter = 'string'
				break
			case 'object':
				input = new CustomBox()
				input.type = 'variable'
				input.filter = 'object'
				break
			case 'actor':
			case 'skill':
			case 'state':
			case 'equipment':
			case 'item':
			case 'trigger':
			case 'light':
			case 'element':
				input = new CustomBox()
				input.type = 'variable'
				input.filter = 'object'
				break
		}
		input.write({ type: 'local', key: '' })
		const label = document.createElement('text')
		const text = Local.get('command.callEvent.return')
		const tip = Local.get('command.callEvent.return.tip')
		label.textContent = text
		input.setTooltip(`<b>${text}</b>\n${tip}`)
		label.addClass('call-event-component')
		input.addClass('call-event-component')
		this.gridBox.appendChild(label)
		this.gridBox.appendChild(input)
		this.eventResult = { type, label, input }
	},
	parseEventArgs: function (event, args) {
		const words = Command.words
		if (event) {
			const flags = {}
			const parameters = event.parameters
			outer: for (const { type, key, note } of parameters) {
				const name = note
					? Command.setTooltip(`<b>${key}</b>\n${note}`) + key
					: key
				for (const arg of args) {
					if (arg.key === key && arg.type === type) {
						if (key in flags) {
							continue
						}
						flags[key] = true
						words.push(
							name + Token(' = ') + this.parseEventArgInput(arg)
						)
						continue outer
					}
				}
				const info = `${Command.setClass('error')}${name}${
					Token(': ') +
					Command.setWeakColor(
						Local.get('eventParameterTypes.' + type)
					)
				}`
				words.push(info)
			}
		}
		let info = words.join()
		if (info) info = `(${info})`
		return info
	},
	parseEventArgInput: function (arg) {
		switch (arg.type) {
			case 'boolean':
				return Command.setBooleanColor(arg.value.toString())
			case 'number':
				return Command.parseVariableNumber(arg.value)
			case 'string':
				return Command.parseVariableTemplate(arg.value, 40)
			case 'object':
				return Command.parseVariable(arg.value, 'object')
			case 'actor':
				return Command.parseActor(arg.value)
			case 'skill':
				return Command.parseSkill(arg.value)
			case 'state':
				return Command.parseState(arg.value)
			case 'equipment':
				return Command.parseEquipment(arg.value)
			case 'item':
				return Command.parseItem(arg.value)
			case 'trigger':
				return Command.parseTrigger(arg.value)
			case 'light':
				return Command.parseLight(arg.value)
			case 'element':
				return Command.parseElement(arg.value)
		}
	},
	getDefaultArgValue: function (type) {
		switch (type) {
			case 'boolean':
				return false
			case 'number':
				return 0
			case 'string':
				return ''
			case 'object':
				return { type: 'local', key: '' }
			case 'actor':
			case 'skill':
			case 'state':
			case 'equipment':
			case 'item':
			case 'trigger':
			case 'light':
			case 'element':
				return { type: 'trigger' }
		}
	},
	writeEventArgs: function (args) {
		outer: for (const { type, key, input } of this.parameters) {
			for (const arg of args) {
				if (arg.key === key && arg.type === type) {
					input.write(arg.value)
					continue outer
				}
			}
			input.write(this.getDefaultArgValue(type))
		}
	},
	readEventArgs: function () {
		const args = []
		for (const { type, key, input } of this.parameters) {
			const value = input.read()
			if (type === 'object' && VariableGetter.isNone(value)) {
				input.getFocus()
				return null
			}
			args.push({ type, key, value })
		}
		return args
	},
	writeEventResult: function (eventResult) {
		if (this.eventResult === null) return
		if (eventResult.type === 'none') return
		const baseTypes = 'boolean|number|string'
		const objectTypes =
			'actor|skill|state|equipment|item|trigger|light|element|any'
		// 如果数据结构兼容，写入数据
		if (
			eventResult.type === this.eventResult.type ||
			(baseTypes.includes(eventResult.type) &&
				baseTypes.includes(this.eventResult.type) &&
				eventResult.variable.type === 'local') ||
			(objectTypes.includes(eventResult.type) &&
				objectTypes.includes(this.eventResult.type))
		) {
			this.eventResult.input.write(eventResult.variable)
		}
	},
	readEventResult: function () {
		const eventResult = { type: 'none' }
		if (this.eventResult !== null) {
			eventResult.type = this.eventResult.type
			eventResult.variable = this.eventResult.input.read()
		}
		return eventResult
	},
	parse: function ({
		type,
		actor,
		skill,
		state,
		equipment,
		item,
		light,
		element,
		eventId,
		eventArgs,
		eventResult,
		eventType
	}) {
		const words = Command.words
		switch (type) {
			case 'global': {
				// 2025.2.22补丁
				if (eventArgs === undefined) {
					eventArgs = []
				}
				if (eventResult === undefined) {
					eventResult = { type: 'none' }
				}
				let leftValue = ''
				let eventName = Command.parseFileName(eventId)
				const event = Data.events[eventId]
				if (!event) break
				switch (eventResult.type) {
					case 'none':
						if (event.returnType !== 'none') {
							leftValue = Command.setVariableColor('?')
						}
						break
					case 'boolean':
					case 'number':
					case 'string':
						leftValue = Command.parseVariable(
							eventResult.variable,
							eventResult.type,
							true
						)
						break
					case 'object':
						leftValue = Command.parseVariable(
							eventResult.variable,
							'object',
							true
						)
						break
					case 'actor':
					case 'skill':
					case 'state':
					case 'equipment':
					case 'item':
					case 'trigger':
					case 'light':
					case 'element':
						leftValue = Command.parseVariable(
							eventResult.variable,
							'object',
							true
						)
						break
				}
				if (leftValue) {
					if (eventResult.type !== event.returnType) {
						leftValue = Command.setClass('error') + leftValue
					}
					leftValue += Token(' = ')
				}
				if (event.description) {
					eventName =
						Command.setTooltip(
							`<b>${Command.removeTextTags(eventName)}</b>\n${
								event.description
							}`
						) + eventName
				}
				words.push(
					leftValue +
						eventName +
						this.parseEventArgs(event, eventArgs)
				)
				break
			}
			case 'inherited':
				words.push(Local.get('command.callEvent.inherited'))
				break
			case 'scene':
				words.push(Local.get('command.callEvent.scene'))
				break
			case 'actor':
				words.push(Command.parseActor(actor))
				break
			case 'skill':
				words.push(Command.parseSkill(skill))
				break
			case 'state':
				words.push(Command.parseState(state))
				break
			case 'equipment':
				words.push(Command.parseEquipment(equipment))
				break
			case 'item':
				words.push(Command.parseItem(item))
				break
			case 'light':
				words.push(Command.parseLight(light))
				break
			case 'element':
				words.push(Command.parseElement(element))
				break
		}
		if (eventType) {
			words.push(Command.parseEventType(type + '-event', eventType))
		}
		const contents = [
			{ color: 'flow' },
			{ text: Local.get('command.callEvent.alias') + Token(': ') },
			{ text: words.join() }
		]
		if (type === 'global') {
			contents.unshift({ class: 'parent:global-event' })
		}
		return contents
	},
	load: function ({
		type = 'global',
		actor = { type: 'trigger' },
		skill = { type: 'trigger' },
		state = { type: 'trigger' },
		equipment = { type: 'trigger' },
		item = { type: 'trigger' },
		light = { type: 'trigger' },
		element = { type: 'trigger' },
		eventId = '',
		eventArgs = [],
		eventResult = { type: 'none' },
		eventType = ''
	}) {
		const write = getElementWriter('callEvent')
		write('type', type)
		write('actor', actor)
		write('skill', skill)
		write('state', state)
		write('equipment', equipment)
		write('item', item)
		write('light', light)
		write('element', element)
		write('eventId', eventId)
		write('eventType', eventType)
		this.writeEventArgs(eventArgs)
		this.writeEventResult(eventResult)
		$('#callEvent-type').getFocus()
	},
	save: function () {
		const read = getElementReader('callEvent')
		const type = read('type')
		switch (type) {
			case 'global': {
				const eventId = read('eventId')
				if (eventId === '') {
					return $('#callEvent-eventId').getFocus()
				}
				const callEvent = Command.cases.callEvent
				const eventArgs = callEvent.readEventArgs()
				if (eventArgs === null) return
				const eventResult = callEvent.readEventResult()
				if (
					eventResult.type !== 'none' &&
					VariableGetter.isNone(eventResult.variable)
				) {
					return callEvent.eventResult.input.getFocus()
				}
				Command.save({ type, eventId, eventArgs, eventResult })
				break
			}
			case 'inherited':
				Command.save({ type })
				break
			case 'scene':
				const eventType = read('eventType')
				if (eventType === '') {
					return $('#callEvent-eventType').getFocus()
				}
				Command.save({ type, eventType })
				break
			default: {
				const target = read(type)
				const eventType = read('eventType')
				if (eventType === '') {
					return $('#callEvent-eventType').getFocus()
				}
				Command.save({
					type: type,
					[type]: target,
					eventType: eventType
				})
				break
			}
		}
	}
}

// 返回值
Command.cases.return = {
	typeItems: {
		none: { name: 'None', value: 'none' },
		boolean: { name: 'Boolean', value: 'boolean' },
		number: { name: 'Number', value: 'number' },
		string: { name: 'String', value: 'string' },
		object: { name: 'Object', value: 'object' },
		actor: { name: 'Actor', value: 'actor' },
		skill: { name: 'Skill', value: 'skill' },
		state: { name: 'State', value: 'state' },
		equipment: { name: 'Equipment', value: 'equipment' },
		item: { name: 'Item', value: 'item' },
		trigger: { name: 'Trigger', value: 'trigger' },
		light: { name: 'Light', value: 'light' },
		element: { name: 'Element', value: 'element' }
	},
	initialize: function () {
		$('#return-confirm').on('click', this.save)

		// 创建返回类型选项
		$('#return-type').loadItems(Object.values(this.typeItems))

		// 创建布尔值选项
		$('#return-boolean').loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		])

		// 设置返回类型关联元素
		$('#return-type')
			.enableHiddenMode()
			.relate([
				{ case: 'boolean', targets: [$('#return-boolean')] },
				{ case: 'number', targets: [$('#return-number')] },
				{ case: 'string', targets: [$('#return-string')] },
				{ case: 'object', targets: [$('#return-object')] },
				{ case: 'actor', targets: [$('#return-actor')] },
				{ case: 'skill', targets: [$('#return-skill')] },
				{ case: 'state', targets: [$('#return-state')] },
				{ case: 'equipment', targets: [$('#return-equipment')] },
				{ case: 'item', targets: [$('#return-item')] },
				{ case: 'trigger', targets: [$('#return-trigger')] },
				{ case: 'light', targets: [$('#return-light')] },
				{ case: 'element', targets: [$('#return-element')] }
			])
	},
	parse: function ({ type, value }) {
		const words = Command.words
		switch (type) {
			case 'none':
				break
			case 'boolean':
				words.push(Command.setBooleanColor(value.toString()))
				break
			case 'number':
				words.push(Command.parseVariableNumber(value))
				break
			case 'string':
				words.push(Command.parseVariableString(value))
				break
			case 'object':
				words.push(Command.parseVariable(value, 'object'))
				break
			case 'actor':
				words.push(Command.parseActor(value))
				break
			case 'skill':
				words.push(Command.parseSkill(value))
				break
			case 'state':
				words.push(Command.parseState(value))
				break
			case 'equipment':
				words.push(Command.parseEquipment(value))
				break
			case 'item':
				words.push(Command.parseItem(value))
				break
			case 'trigger':
				words.push(Command.parseTrigger(value))
				break
			case 'light':
				words.push(Command.parseLight(value))
				break
			case 'element':
				words.push(Command.parseElement(value))
				break
		}
		let info = words.join()
		if (Command.returnType !== type) {
			info = Command.setClass('error') + (info || '?')
		}
		return [
			{ color: 'flow' },
			{ text: Local.get('command.return') + ' ' },
			{ color: 'restore' },
			{ text: info }
		]
	},
	// 加载类型选项
	loadTypeItems: function (type) {
		let items
		switch (type) {
			case 'none':
				items = [this.typeItems.none]
				break
			case 'boolean':
				items = [this.typeItems.boolean]
				break
			case 'number':
				items = [this.typeItems.number]
				break
			case 'string':
				items = [this.typeItems.string]
				break
			case 'object':
				items = [this.typeItems.object]
				break
			case 'actor':
				items = [this.typeItems.actor]
				break
			case 'skill':
				items = [this.typeItems.skill]
				break
			case 'state':
				items = [this.typeItems.state]
				break
			case 'equipment':
				items = [this.typeItems.equipment]
				break
			case 'item':
				items = [this.typeItems.item]
				break
			case 'trigger':
				items = [this.typeItems.trigger]
				break
			case 'light':
				items = [this.typeItems.light]
				break
			case 'element':
				items = [this.typeItems.element]
				break
			default:
				throw new Error('Not implemented')
		}
		$('#return-type').loadItems(items)
	},
	load: function ({ type = Command.returnType, value = null }) {
		this.loadTypeItems(Command.returnType)
		const write = getElementWriter('return')
		write('type', type)
		write('boolean', type === 'boolean' && value !== null ? value : false)
		write('number', type === 'number' && value !== null ? value : 0)
		write('string', type === 'string' && value !== null ? value : '')
		write(
			'object',
			type === 'object' && value !== null
				? value
				: { type: 'local', key: '' }
		)
		write(
			'actor',
			type === 'actor' && value !== null ? value : { type: 'trigger' }
		)
		write(
			'skill',
			type === 'skill' && value !== null ? value : { type: 'trigger' }
		)
		write(
			'state',
			type === 'state' && value !== null ? value : { type: 'trigger' }
		)
		write(
			'equipment',
			type === 'equipment' && value !== null ? value : { type: 'trigger' }
		)
		write(
			'item',
			type === 'item' && value !== null ? value : { type: 'trigger' }
		)
		write(
			'trigger',
			type === 'trigger' && value !== null ? value : { type: 'trigger' }
		)
		write(
			'light',
			type === 'light' && value !== null ? value : { type: 'trigger' }
		)
		write(
			'element',
			type === 'element' && value !== null ? value : { type: 'trigger' }
		)
		$('#return-type').getFocus()
	},
	save: function () {
		const read = getElementReader('return')
		const type = read('type')
		switch (type) {
			case 'none':
				Command.save({ type })
				break
			case 'boolean':
				Command.save({ type, value: read('boolean') })
				break
			case 'number':
				Command.save({ type, value: read('number') })
				break
			case 'string':
				Command.save({ type, value: read('string') })
				break
			case 'object': {
				const variable = read('object')
				if (VariableGetter.isNone(variable)) {
					return $('#return-object').getFocus()
				}
				Command.save({ type, value: variable })
				break
			}
			case 'actor':
				Command.save({ type, value: read('actor') })
				break
			case 'skill':
				Command.save({ type, value: read('skill') })
				break
			case 'state':
				Command.save({ type, value: read('state') })
				break
			case 'equipment':
				Command.save({ type, value: read('equipment') })
				break
			case 'item':
				Command.save({ type, value: read('item') })
				break
			case 'trigger':
				Command.save({ type, value: read('trigger') })
				break
			case 'light':
				Command.save({ type, value: read('light') })
				break
			case 'element':
				Command.save({ type, value: read('element') })
				break
		}
	}
}

// 停止事件
Command.cases.stopEvent = {
	initialize: function () {
		$('#stopEvent-confirm').on('click', this.save)

		// 创建类型选项
		$('#stopEvent-type').loadItems([
			{ name: 'Current', value: 'current' },
			{ name: 'Global', value: 'global' },
			{ name: 'Scene', value: 'scene' },
			{ name: 'Actor', value: 'actor' },
			{ name: 'Skill', value: 'skill' },
			{ name: 'State', value: 'state' },
			{ name: 'Equipment', value: 'equipment' },
			{ name: 'Item', value: 'item' },
			{ name: 'Light', value: 'light' },
			{ name: 'Element', value: 'element' }
		])

		// 设置关联元素
		$('#stopEvent-type')
			.enableHiddenMode()
			.relate([
				{ case: 'global', targets: [$('#stopEvent-eventId')] },
				{ case: 'scene', targets: [$('#stopEvent-eventType')] },
				{
					case: 'actor',
					targets: [$('#stopEvent-actor'), $('#stopEvent-eventType')]
				},
				{
					case: 'skill',
					targets: [$('#stopEvent-skill'), $('#stopEvent-eventType')]
				},
				{
					case: 'state',
					targets: [$('#stopEvent-state'), $('#stopEvent-eventType')]
				},
				{
					case: 'equipment',
					targets: [
						$('#stopEvent-equipment'),
						$('#stopEvent-eventType')
					]
				},
				{
					case: 'item',
					targets: [$('#stopEvent-item'), $('#stopEvent-eventType')]
				},
				{
					case: 'light',
					targets: [$('#stopEvent-light'), $('#stopEvent-eventType')]
				},
				{
					case: 'element',
					targets: [
						$('#stopEvent-element'),
						$('#stopEvent-eventType')
					]
				}
			])

		// 类型 - 写入事件
		$('#stopEvent-type').on('write', (event) => {
			const type = event.value
			// 加载事件类型选项(创建了全局事件类型但是没用到)
			if (type !== 'current') {
				const elEventType = $('#stopEvent-eventType')
				const eventTypes = Enum.getMergedItems(
					EventEditor.types[type],
					type + '-event'
				)
				elEventType.loadItems(eventTypes)
				elEventType.createTooltip()
				elEventType.write(eventTypes[0].value)
			}
		})
	},
	parse: function ({
		type,
		actor,
		skill,
		state,
		equipment,
		item,
		light,
		element,
		eventId,
		eventType
	}) {
		// 2025.2.27补丁
		if (type === undefined) {
			type = 'current'
		}
		const words = Command.words
		switch (type) {
			case 'current':
				words.push(Local.get('command.stopEvent.current'))
				break
			case 'global':
				words.push(Command.parseFileName(eventId))
				break
			case 'scene':
				words.push(Local.get('command.stopEvent.scene'))
				break
			case 'actor':
				words.push(Command.parseActor(actor))
				break
			case 'skill':
				words.push(Command.parseSkill(skill))
				break
			case 'state':
				words.push(Command.parseState(state))
				break
			case 'equipment':
				words.push(Command.parseEquipment(equipment))
				break
			case 'item':
				words.push(Command.parseItem(item))
				break
			case 'light':
				words.push(Command.parseLight(light))
				break
			case 'element':
				words.push(Command.parseElement(element))
				break
		}
		if (eventType) {
			words.push(Command.parseEventType(type + '-event', eventType))
		}
		return [
			{ color: 'flow' },
			{ text: Local.get('command.stopEvent.alias') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		type = 'current',
		actor = { type: 'trigger' },
		skill = { type: 'trigger' },
		state = { type: 'trigger' },
		equipment = { type: 'trigger' },
		item = { type: 'trigger' },
		light = { type: 'trigger' },
		element = { type: 'trigger' },
		eventId = '',
		eventType = ''
	}) {
		const write = getElementWriter('stopEvent')
		write('type', type)
		write('actor', actor)
		write('skill', skill)
		write('state', state)
		write('equipment', equipment)
		write('item', item)
		write('light', light)
		write('element', element)
		write('eventId', eventId)
		write('eventType', eventType)
		$('#stopEvent-type').getFocus()
	},
	save: function () {
		const read = getElementReader('stopEvent')
		const type = read('type')
		switch (type) {
			case 'current':
				Command.save({ type })
				break
			case 'global': {
				const eventId = read('eventId')
				if (eventId === '') {
					return $('#stopEvent-eventId').getFocus()
				}
				Command.save({ type, eventId })
				break
			}
			case 'scene':
				const eventType = read('eventType')
				if (eventType === '') {
					return $('#stopEvent-eventType').getFocus()
				}
				Command.save({ type, eventType })
				break
			default: {
				const target = read(type)
				const eventType = read('eventType')
				if (eventType === '') {
					return $('#stopEvent-eventType').getFocus()
				}
				Command.save({
					type: type,
					[type]: target,
					eventType: eventType
				})
				break
			}
		}
	}
}

// 注册事件
Command.cases.registerEvent = {
	commands: [],
	priorityEnabled: false,
	initialize: function () {
		$('#registerEvent-confirm').on('click', this.save)

		// 创建目标选项
		$('#registerEvent-target').loadItems([
			{ name: 'Global', value: 'global' },
			{ name: 'Actor', value: 'actor' },
			{ name: 'Element', value: 'element' }
		])

		// 设置目标关联元素
		$('#registerEvent-target')
			.enableHiddenMode()
			.relate([
				{ case: 'actor', targets: [$('#registerEvent-actor')] },
				{ case: 'element', targets: [$('#registerEvent-element')] }
			])

		// 目标 - 写入事件
		$('#registerEvent-target').on('write', (event) => {
			const type = event.value
			const elEventType = $('#registerEvent-type')
			const registerType = 'register_' + type
			const eventTypes = Enum.getMergedItems(
				EventEditor.types[registerType],
				type + '-event'
			)
			this.switchTypeAndTagInput()
			// 加载事件类型选项
			elEventType.loadItems(eventTypes)
			elEventType.createTooltip()
			elEventType.write(eventTypes[0].value)
		})

		// 创建操作选项
		$('#registerEvent-operation').loadItems([
			{ name: 'Register', value: 'register' },
			{ name: 'Unregister', value: 'unregister' },
			{ name: 'Reset', value: 'reset' }
		])

		// 事件操作 - 写入事件
		$('#registerEvent-operation').on('write', () => {
			this.switchTypeAndTagInput()
			this.switchPriority()
			this.switchNamespace()
		})

		// 事件类型 - 写入事件
		$('#registerEvent-type').on('write', () => this.switchPriority())
	},
	switchTypeAndTagInput: function (event) {
		const show = (input) => {
			input.previousElementSibling.show()
			input.show()
		}
		const hide = (input) => {
			input.previousElementSibling.hide()
			input.hide()
		}
		const typeInput = $('#registerEvent-type')
		const tagInput = $('#registerEvent-tag')
		const target = $('#registerEvent-target').read()
		const operation = $('#registerEvent-operation').read()
		switch (target) {
			case 'global':
				switch (operation) {
					case 'register':
						show(typeInput)
						show(tagInput)
						break
					case 'unregister':
						hide(typeInput)
						show(tagInput)
						break
					case 'reset':
						hide(typeInput)
						hide(tagInput)
						break
				}
				break
			case 'actor':
			case 'element':
				switch (operation) {
					case 'register':
					case 'unregister':
						show(typeInput)
						hide(tagInput)
						break
					case 'reset':
						hide(typeInput)
						hide(tagInput)
						break
				}
				break
		}
	},
	switchPriority: function () {
		const priorityTypes = {
			input: true,
			keydown: true,
			keyup: true,
			mousedown: true,
			mouseup: true,
			mousemove: true,
			doubleclick: true,
			wheel: true,
			touchstart: true,
			touchmove: true,
			touchend: true,
			gamepadbuttonpress: true,
			gamepadbuttonrelease: true,
			gamepadleftstickchange: true,
			gamepadrightstickchange: true
		}
		const target = $('#registerEvent-target').read()
		const operation = $('#registerEvent-operation').read()
		const type = $('#registerEvent-type').read()
		const priority = $('#registerEvent-priority')
		if (
			target === 'global' &&
			operation === 'register' &&
			type in priorityTypes
		) {
			priority.previousElementSibling.show()
			priority.show()
			this.priorityEnabled = true
		} else {
			priority.previousElementSibling.hide()
			priority.hide()
			this.priorityEnabled = false
		}
	},
	switchNamespace: function () {
		const namespace = $('#registerEvent-namespace')
		const operation = $('#registerEvent-operation').read()
		if (operation === 'register') {
			namespace.previousElementSibling.show()
			namespace.show()
		} else {
			namespace.previousElementSibling.hide()
			namespace.hide()
		}
	},
	parse: function ({
		target,
		actor,
		element,
		operation,
		type,
		priority,
		tag,
		commands,
		namespace
	}) {
		const words = Command.words
		switch (target) {
			case 'global':
				switch (operation) {
					case 'register': {
						const priorityFlag = priority
							? Command.setOperatorColor('*')
							: ''
						const tagName = tag
							? Token('(') +
								Command.parseVariableString(tag) +
								Token(')')
							: ''
						words.push(
							Command.parseEventType(target + '-event', type) +
								priorityFlag +
								tagName
						)
						break
					}
					case 'unregister': {
						const tagName =
							Token('(') +
							Command.parseVariableString(tag) +
							Token(')')
						words.push(
							Local.get(
								'command.registerEvent.reset.global-event'
							) + tagName
						)
						break
					}
					case 'reset':
						words.push(
							Local.get(
								'command.registerEvent.reset.global-events'
							)
						)
						break
				}
				break
			case 'actor':
				switch (operation) {
					case 'register':
					case 'unregister':
						words.push(Command.parseActor(actor))
						words.push(
							Command.parseEventType(target + '-event', type)
						)
						break
					case 'reset':
						words.push(
							Command.parseActor(actor) +
								Token(' -> ') +
								Local.get('command.registerEvent.reset.events')
						)
						break
				}
				break
			case 'element':
				switch (operation) {
					case 'register':
					case 'unregister':
						words.push(Command.parseElement(element))
						words.push(
							Command.parseEventType(target + '-event', type)
						)
						break
					case 'reset':
						words.push(
							Command.parseElement(element) +
								Token(' -> ') +
								Local.get('command.registerEvent.reset.events')
						)
						break
				}
				break
		}
		if (operation === 'register' && namespace) {
			words.push(Local.get('command.registerEvent.namespace'))
		}

		const contents = [
			{ color: 'flow' },
			{
				text:
					Local.get('command.registerEvent.alias.' + operation) +
					Token(': ')
			},
			{ text: words.join() }
		]
		if (commands) {
			contents.unshift({ fold: true })
			contents.push(
				{ children: commands },
				{ color: 'flow' },
				{ text: Local.get('command.registerEvent.end') }
			)
		}
		return contents
	},
	load: function ({
		target = 'global',
		actor = { type: 'trigger' },
		element = { type: 'trigger' },
		operation = 'register',
		type = 'autorun',
		priority = false,
		namespace = false,
		tag = '',
		commands = []
	}) {
		const write = getElementWriter('registerEvent')
		write('target', target)
		write('actor', actor)
		write('element', element)
		write('operation', operation)
		write('type', type)
		write('priority', priority)
		write('namespace', namespace)
		write('tag', tag)
		Command.cases.registerEvent.commands = commands
		this.switchNamespace()
		$('#registerEvent-target').getFocus()
	},
	save: function () {
		const read = getElementReader('registerEvent')
		const target = read('target')
		const operation = read('operation')
		const type = read('type')
		const commands = Command.cases.registerEvent.commands
		const namespace = read('namespace')
		switch (target) {
			case 'global':
				switch (operation) {
					case 'register': {
						let tag = read('tag')
						if (typeof tag === 'string') {
							tag = tag.trim()
						}
						const priority = Command.cases.registerEvent
							.priorityEnabled
							? read('priority')
							: false
						Command.save({
							target,
							operation,
							type,
							priority,
							namespace,
							tag,
							commands
						})
						break
					}
					case 'unregister': {
						let tag = read('tag')
						if (
							typeof tag === 'string' &&
							(tag = tag.trim()) === ''
						) {
							return $('#registerEvent-tag').getFocus()
						}
						Command.save({ target, operation, tag })
						break
					}
					case 'reset':
						Command.save({ target, operation })
						break
				}
				break
			case 'actor': {
				const actor = read('actor')
				switch (operation) {
					case 'register':
						Command.save({
							target,
							actor,
							operation,
							type,
							namespace,
							commands
						})
						break
					case 'unregister':
						Command.save({ target, actor, operation, type })
						break
					case 'reset':
						Command.save({ target, actor, operation })
						break
				}
				break
			}
			case 'element': {
				const element = read('element')
				switch (operation) {
					case 'register':
						Command.save({
							target,
							element,
							operation,
							type,
							namespace,
							commands
						})
						break
					case 'unregister':
						Command.save({ target, element, operation, type })
						break
					case 'reset':
						Command.save({ target, element, operation })
						break
				}
				break
			}
		}
	}
}

// 设置事件
Command.cases.setEvent = {
	initialize: function () {
		$('#setEvent-confirm').on('click', this.save)

		// 创建操作选项
		$('#setEvent-operation').loadItems([
			{ name: 'Stop Propagation', value: 'stop-propagation' },
			{ name: 'Pause and Save to Variable', value: 'pause' },
			{ name: 'Continue and Reset Variable', value: 'continue' },
			{ name: 'Enable Global Event', value: 'enable' },
			{ name: 'Disable Global Event', value: 'disable' },
			{ name: 'Set to Highest Priority', value: 'highest-priority' },
			{ name: 'Go to Choice Branch', value: 'goto-choice-branch' }
		])

		// 设置操作关联元素
		$('#setEvent-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['pause', 'continue'],
					targets: [$('#setEvent-variable')]
				},
				{
					case: ['enable', 'disable', 'highest-priority'],
					targets: [$('#setEvent-eventId')]
				},
				{
					case: 'goto-choice-branch',
					targets: [$('#setEvent-choiceIndex')]
				}
			])
	},
	parse: function ({ operation, variable, eventId, choiceIndex }) {
		const words = Command.words.push(
			Local.get('command.setEvent.' + operation)
		)
		switch (operation) {
			case 'pause':
				words.push(Command.parseVariable(variable, 'object', true))
				break
			case 'continue':
				words.push(Command.parseVariable(variable, 'object'))
				break
			case 'enable':
			case 'disable':
			case 'highest-priority':
				words.push(Command.parseFileName(eventId))
				break
			case 'goto-choice-branch':
				words.push(Command.parseVariableNumber(choiceIndex))
				break
		}
		return [
			{ color: 'flow' },
			{ text: Local.get('command.setEvent.alias') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		operation = 'stop-propagation',
		variable = { type: 'global', key: '' },
		eventId = '',
		choiceIndex = 0
	}) {
		// 补丁：删除了阻止和回复场景输入事件选项
		switch (operation) {
			case 'prevent-scene-input-events':
			case 'restore-scene-input-events':
				operation = 'stop-propagation'
				break
		}
		const write = getElementWriter('setEvent')
		write('operation', operation)
		write('variable', variable)
		write('eventId', eventId)
		write('choiceIndex', choiceIndex)
		$('#setEvent-operation').getFocus()
	},
	save: function () {
		const read = getElementReader('setEvent')
		const operation = read('operation')
		switch (operation) {
			case 'stop-propagation':
				Command.save({ operation })
				break
			case 'pause':
			case 'continue': {
				const variable = read('variable')
				if (VariableGetter.isNone(variable)) {
					return $('#setEvent-variable').getFocus()
				}
				Command.save({ operation, variable })
				break
			}
			case 'enable':
			case 'disable':
			case 'highest-priority': {
				const eventId = read('eventId')
				if (eventId === '') {
					return $('#setEvent-eventId').getFocus()
				}
				Command.save({ operation, eventId })
				break
			}
			case 'goto-choice-branch': {
				const choiceIndex = read('choiceIndex')
				Command.save({ operation, choiceIndex })
				break
			}
		}
	}
}

// 过渡
Command.cases.transition = {
	commands: null,
	initialize: function () {
		$('#transition-confirm').on('click', this.save)

		// 创建过渡方式选项 - 窗口打开事件
		$('#transition').on('open', function (event) {
			$('#transition-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#transition').on('closed', function (event) {
			$('#transition-easingId').clear()
			this.commands = null
		})
	},
	parse: function ({ variable, start, end, easingId, duration, commands }) {
		const varName = Command.parseVariable(variable, 'number', true)
		const from = Command.parseVariableNumber(start)
		const to = Command.parseVariableNumber(end)
		const easing = Command.parseEasing(easingId, duration)
		const expression = varName + Token(' = ') + from + Token(' -> ') + to
		const words = Command.words.push(expression).push(easing)
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.transition') + ' ' },
			{ color: 'restore' },
			{ text: words.join() },
			{ children: commands },
			{ color: 'flow' },
			{ text: Local.get('command.transition.end') }
		]
	},
	load: function ({
		variable = { type: 'local', key: '' },
		start = 0,
		end = 1,
		easingId = Data.easings[0].id,
		duration = 1000,
		commands = []
	}) {
		const write = getElementWriter('transition')
		write('variable', variable)
		write('start', start)
		write('end', end)
		write('easingId', easingId)
		write('duration', duration)
		Command.cases.transition.commands = commands
		$('#transition-variable').getFocus()
	},
	save: function () {
		const read = getElementReader('transition')
		const variable = read('variable')
		if (VariableGetter.isNone(variable)) {
			return $('#transition-variable').getFocus()
		}
		const start = read('start')
		const end = read('end')
		const easingId = read('easingId')
		const duration = read('duration')
		if (duration === 0) {
			return $('#transition-duration').getFocus('all')
		}
		const commands = Command.cases.transition.commands
		Command.save({ variable, start, end, easingId, duration, commands })
	}
}

// 指令块
Command.cases.block = {
	initialize: function () {
		$('#block-confirm').on('click', this.save)
	},
	parse: function ({ note, asynchronous, commands }) {
		// 补丁：2025-3-21
		if (asynchronous === undefined) {
			asynchronous = false
		}
		const asyncFlag = asynchronous ? Command.setOperatorColor('*') : ''
		const blockNote =
			note || asyncFlag ? Token(': ') + note + asyncFlag : ''
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.block') + blockNote },
			{ children: commands },
			{ color: 'flow' },
			{ text: Local.get('command.block.end') }
		]
	},
	load: function ({ note = '', asynchronous = false, commands = [] }) {
		$('#block-note').write(note)
		$('#block-asynchronous').write(asynchronous)
		$('#block-note').getFocus()
		Command.cases.block.commands = commands
	},
	save: function () {
		const note = $('#block-note').read().trim()
		const asynchronous = $('#block-asynchronous').read()
		const commands = Command.cases.block.commands
		Command.save({ note, asynchronous, commands })
	}
}

// 标签
Command.cases.label = {
	initialize: function () {
		$('#label-confirm').on('click', this.save)
	},
	parse: function ({ name }) {
		return [
			{ color: 'flow' },
			{ text: Local.get('command.label') + Token(': ') },
			{ color: 'label' },
			{ text: name }
		]
	},
	load: function ({ name = '' }) {
		$('#label-name').write(name)
		$('#label-name').getFocus('all')
	},
	save: function () {
		const name = $('#label-name').read().trim()
		if (name === '') {
			return $('#label-name').getFocus()
		}
		Command.save({ name })
	}
}

// 跳转到
Command.cases.jumpTo = {
	initialize: function () {
		$('#jumpTo-confirm').on('click', this.save)

		// 侦听文本提示
		TextSuggestion.listen($('#jumpTo-label'), this.loadLabels)

		// 创建操作选项
		$('#jumpTo-operation').loadItems([
			{ name: 'Jump to Label', value: 'jump' },
			{ name: 'Save and Jump to Label', value: 'save-jump' },
			{ name: 'Jump to the Saved Location', value: 'return' }
		])

		// 设置操作关联元素
		$('#jumpTo-operation')
			.enableHiddenMode()
			.relate([
				{ case: ['jump', 'save-jump'], targets: [$('#jumpTo-label')] }
			])
	},
	parse: function ({ operation, label }) {
		const words = Command.words
		switch (operation) {
			case 'jump':
				words.push(label)
				break
			case 'save-jump':
				words.push(label).push(Local.get('command.jumpTo.save'))
				break
			case 'return':
				words.push(Local.get('command.jumpTo.savedLocation'))
				break
		}
		return [
			{ color: 'flow' },
			{ text: Local.get('command.jumpTo.alias') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ operation = 'jump', label = '' }) {
		$('#jumpTo-operation').write(operation)
		$('#jumpTo-label').write(label)
		$('#jumpTo-operation').getFocus()
	},
	save: function () {
		const operation = $('#jumpTo-operation').read()
		switch (operation) {
			case 'jump':
			case 'save-jump': {
				const label = $('#jumpTo-label').read().trim()
				if (label === '') {
					return $('#jumpTo-label').getFocus()
				}
				Command.save({ operation, label })
				break
			}
			case 'return':
				Command.save({ operation })
				break
		}
	},
	// 加载本地变量键
	loadLabels: function () {
		const items = []
		const commands = EventEditor.commandList.read()
		if (!commands) return items
		// 遍历目标事件的指令列表
		Command.forEachCommand(commands, (command) => {
			if (command.id === 'label') {
				items.push({
					name: command.params.name,
					icon: 'icon-label'
				})
			}
		})
		// 按名称排序列表项，并返回
		return items.sort((a, b) => a.name.localeCompare(b.name))
	}
}

// 等待
Command.cases.wait = {
	initialize: function () {
		$('#wait-confirm').on('click', this.save)
	},
	parse: function ({ duration }) {
		return [
			{ color: 'wait' },
			{ text: Local.get('command.wait') + Token(': ') },
			{ text: Command.parseVariableNumber(duration, 'ms') }
		]
	},
	load: function ({ duration = 1 }) {
		$('#wait-duration').write(duration)
		$('#wait-duration').getFocus('all')
	},
	save: function () {
		const duration = $('#wait-duration').read()
		Command.save({ duration })
	}
}

// 创建元素
Command.cases.createElement = {
	initialize: function () {
		$('#createElement-confirm').on('click', this.save)

		// 创建操作选项
		$('#createElement-operation').loadItems([
			{ name: 'Append All to Root', value: 'append-all-to-root' },
			{ name: 'Append One to Root', value: 'append-one-to-root' },
			{ name: 'Append All to Element', value: 'append-all-to-element' },
			{ name: 'Append One to Element', value: 'append-one-to-element' }
		])

		// 设置操作关联元素
		$('#createElement-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'append-all-to-root',
					targets: [$('#createElement-uiId')]
				},
				{
					case: 'append-one-to-root',
					targets: [$('#createElement-presetId')]
				},
				{
					case: 'append-all-to-element',
					targets: [
						$('#createElement-parent'),
						$('#createElement-uiId')
					]
				},
				{
					case: 'append-one-to-element',
					targets: [
						$('#createElement-parent'),
						$('#createElement-presetId')
					]
				}
			])
	},
	parseUIAndNodeNames: function (uiId) {
		const uiName = Command.parseFileName(uiId)
		const data = Data.ui[uiId]
		if (data !== undefined) {
			const words = Command.words
			const nodes = data.nodes
			for (const { name } of nodes) {
				if (name !== '') {
					words.push(Command.setPresetColor(name))
				}
				if (words.count === 5) {
					break
				}
			}
			if (words.count < nodes.length) {
				words.push(Token('...'))
			}
			return uiName + ' ' + Token('{') + words.join() + Token('}')
		}
		return uiName
	},
	parse: function ({ operation, parent, uiId, presetId }) {
		let info
		switch (operation) {
			case 'append-all-to-root':
				info = this.parseUIAndNodeNames(uiId)
				break
			case 'append-one-to-root':
				info = Command.parsePresetElement(presetId)
				break
			case 'append-all-to-element':
				info =
					Command.parseElement(parent) +
					Token(' -> ') +
					this.parseUIAndNodeNames(uiId)
				break
			case 'append-one-to-element':
				info =
					Command.parseElement(parent) +
					Token(' -> ') +
					Command.parsePresetElement(presetId)
				break
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.createElement') + Token(': ') },
			{ text: info }
		]
	},
	load: function ({
		operation = 'append-all-to-root',
		parent = { type: 'trigger' },
		uiId = '',
		presetId = PresetElement.getDefaultPresetId()
	}) {
		const write = getElementWriter('createElement')
		write('operation', operation)
		write('parent', parent)
		write('uiId', uiId)
		write('presetId', presetId)
		$('#createElement-operation').getFocus('all')
	},
	save: function () {
		const read = getElementReader('createElement')
		const operation = read('operation')
		switch (operation) {
			case 'append-all-to-root': {
				const uiId = read('uiId')
				if (uiId === '') {
					return $('#createElement-uiId').getFocus()
				}
				Command.save({ operation, uiId })
				break
			}
			case 'append-one-to-root': {
				const presetId = read('presetId')
				if (presetId === '') {
					return $('#createElement-presetId').getFocus()
				}
				Command.save({ operation, presetId })
				break
			}
			case 'append-all-to-element': {
				const parent = read('parent')
				const uiId = read('uiId')
				if (uiId === '') {
					return $('#createElement-uiId').getFocus()
				}
				Command.save({ operation, parent, uiId })
				break
			}
			case 'append-one-to-element': {
				const parent = read('parent')
				const presetId = read('presetId')
				if (presetId === '') {
					return $('#createElement-presetId').getFocus()
				}
				Command.save({ operation, parent, presetId })
				break
			}
		}
	}
}

// 设置图像
Command.cases.setImage = {
	initialize: function () {
		$('#setImage-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setImage-properties').bind(ImageProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setImage').on('closed', (event) => {
			$('#setImage-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(ImageProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setImage') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setImage')
		write('element', element)
		write('properties', properties.slice())
		$('#setImage-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setImage')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setImage-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}

// 加载图像
Command.cases.loadImage = {
	initialize: function () {
		$('#loadImage-confirm').on('click', this.save)

		// 创建类型选项
		$('#loadImage-type').loadItems([
			{ name: 'Actor Portrait', value: 'actor-portrait' },
			{ name: 'Skill Icon', value: 'skill-icon' },
			{ name: 'State Icon', value: 'state-icon' },
			{ name: 'Equipment Icon', value: 'equipment-icon' },
			{ name: 'Item Icon', value: 'item-icon' },
			{ name: 'Shortcut Icon', value: 'shortcut-icon' },
			{ name: 'Base64 Image', value: 'base64' }
		])

		// 设置类型关联元素
		$('#loadImage-type')
			.enableHiddenMode()
			.relate([
				{ case: 'actor-portrait', targets: [$('#loadImage-actor')] },
				{ case: 'skill-icon', targets: [$('#loadImage-skill')] },
				{ case: 'state-icon', targets: [$('#loadImage-state')] },
				{
					case: 'equipment-icon',
					targets: [$('#loadImage-equipment')]
				},
				{ case: 'item-icon', targets: [$('#loadImage-item')] },
				{
					case: 'shortcut-icon',
					targets: [$('#loadImage-actor'), $('#loadImage-key')]
				},
				{ case: 'base64', targets: [$('#loadImage-variable')] }
			])
	},
	parse: function ({
		element,
		type,
		actor,
		skill,
		state,
		equipment,
		item,
		key,
		variable
	}) {
		const words = Command.words.push(Command.parseElement(element))
		const label = Local.get('command.loadImage.' + type)
		let content
		switch (type) {
			case 'actor-portrait':
				content = Command.parseActor(actor)
				break
			case 'skill-icon':
				content = Command.parseSkill(skill)
				break
			case 'state-icon':
				content = Command.parseState(state)
				break
			case 'equipment-icon':
				content = Command.parseEquipment(equipment)
				break
			case 'item-icon':
				content = Command.parseItem(item)
				break
			case 'shortcut-icon': {
				const actorInfo = Command.parseActor(actor)
				const shortcutKey = Command.parseVariableEnum(
					'shortcut-key',
					key
				)
				content = actorInfo + Token(' -> ') + shortcutKey
				break
			}
			case 'base64':
				content = Command.parseVariable(variable, 'string')
				break
		}
		words.push(label + Token('(') + content + Token(')'))
		return [
			{ color: 'element' },
			{ text: Local.get('command.loadImage') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		element = { type: 'trigger' },
		type = 'actor-portrait',
		actor = { type: 'trigger' },
		skill = { type: 'trigger' },
		state = { type: 'trigger' },
		equipment = { type: 'trigger' },
		item = { type: 'trigger' },
		key = Enum.getDefStringId('shortcut-key'),
		variable = { type: 'local', key: '' }
	}) {
		// 加载快捷键选项
		$('#loadImage-key').loadItems(Enum.getStringItems('shortcut-key'))
		const write = getElementWriter('loadImage')
		write('element', element)
		write('type', type)
		write('actor', actor)
		write('skill', skill)
		write('state', state)
		write('equipment', equipment)
		write('item', item)
		write('key', key)
		write('variable', variable)
		$('#loadImage-element').getFocus()
	},
	save: function () {
		const read = getElementReader('loadImage')
		const element = read('element')
		const type = read('type')
		switch (type) {
			case 'actor-portrait': {
				const actor = read('actor')
				Command.save({ element, type, actor })
				break
			}
			case 'skill-icon': {
				const skill = read('skill')
				Command.save({ element, type, skill })
				break
			}
			case 'state-icon': {
				const state = read('state')
				Command.save({ element, type, state })
				break
			}
			case 'equipment-icon': {
				const equipment = read('equipment')
				Command.save({ element, type, equipment })
				break
			}
			case 'item-icon': {
				const item = read('item')
				Command.save({ element, type, item })
				break
			}
			case 'shortcut-icon': {
				const actor = read('actor')
				const key = read('key')
				Command.save({ element, type, actor, key })
				break
			}
			case 'base64': {
				const variable = read('variable')
				if (VariableGetter.isNone(variable)) {
					return $('#loadImage-variable').getFocus()
				}
				Command.save({ element, type, variable })
				break
			}
		}
	}
}

// 改变图像色调
Command.cases.tintImage = {
	initialize: function () {
		$('#tintImage-confirm').on('click', this.save)

		// 创建模式选项
		$('#tintImage-mode').loadItems([
			{ name: 'Full', value: 'full' },
			{ name: 'RGB', value: 'rgb' },
			{ name: 'Gray', value: 'gray' }
		])

		// 设置模式关联元素
		$('#tintImage-mode')
			.enableHiddenMode()
			.relate([
				{
					case: 'full',
					targets: [
						$('#tintImage-tint-0'),
						$('#tintImage-tint-1'),
						$('#tintImage-tint-2'),
						$('#tintImage-tint-3')
					]
				},
				{
					case: 'rgb',
					targets: [
						$('#tintImage-tint-0'),
						$('#tintImage-tint-1'),
						$('#tintImage-tint-2')
					]
				},
				{ case: 'gray', targets: [$('#tintImage-tint-3')] }
			])

		// 创建等待结束选项
		$('#tintImage-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#tintImage').on('open', function (event) {
			$('#tintImage-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#tintImage').on('closed', function (event) {
			$('#tintImage-easingId').clear()
			$('#tintImage-filter').clear()
		})

		// 写入滤镜框 - 色调输入框输入事件
		$(
			'#tintImage-mode, #tintImage-tint-0, #tintImage-tint-1, #tintImage-tint-2, #tintImage-tint-3'
		).on('input', function (event) {
			const tint = [0, 0, 0, 0]
			const read = getElementReader('tintImage')
			switch (read('mode')) {
				case 'full':
					tint[0] = read('tint-0')
					tint[1] = read('tint-1')
					tint[2] = read('tint-2')
					tint[3] = read('tint-3')
					break
				case 'rgb':
					tint[0] = read('tint-0')
					tint[1] = read('tint-1')
					tint[2] = read('tint-2')
					break
				case 'gray':
					tint[3] = read('tint-3')
					break
			}
			$('#tintImage-filter').write(tint)
		})
	},
	parseTint: function (mode, [red, green, blue, gray]) {
		const label = Local.get('command.tintImage.' + mode)
		const _red = Command.setNumberColor(red)
		const _green = Command.setNumberColor(green)
		const _blue = Command.setNumberColor(blue)
		const _gray = Command.setNumberColor(gray)
		switch (mode) {
			case 'full':
				return (
					label +
					Token('(') +
					_red +
					Token(', ') +
					_green +
					Token(', ') +
					_blue +
					Token(', ') +
					_gray +
					Token(')')
				)
			case 'rgb':
				return (
					label +
					Token('(') +
					_red +
					Token(', ') +
					_green +
					Token(', ') +
					_blue +
					Token(')')
				)
			case 'gray':
				return label + Token('(') + _gray + Token(')')
		}
	},
	parse: function ({ element, mode, tint, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseElement(element))
			.push(this.parseTint(mode, tint))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'element' },
			{ text: Local.get('command.tintImage') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		element = { type: 'trigger' },
		mode = 'full',
		tint = [0, 0, 0, 0],
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('tintImage')
		write('element', element)
		write('mode', mode)
		write('tint-0', tint[0])
		write('tint-1', tint[1])
		write('tint-2', tint[2])
		write('tint-3', tint[3])
		write('filter', tint)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#tintImage-element').getFocus()
	},
	save: function () {
		const read = getElementReader('tintImage')
		const element = read('element')
		const mode = read('mode')
		let red = read('tint-0')
		let green = read('tint-1')
		let blue = read('tint-2')
		let gray = read('tint-3')
		switch (mode) {
			case 'full':
				break
			case 'rgb':
				gray = 0
				break
			case 'gray':
				red = 0
				green = 0
				blue = 0
				break
		}
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		const tint = [red, green, blue, gray]
		Command.save({ element, mode, tint, easingId, duration, wait })
	}
}

// 设置文本
Command.cases.setText = {
	initialize: function () {
		$('#setText-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setText-properties').bind(TextProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setText').on('closed', (event) => {
			$('#setText-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(TextProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setText') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setText')
		write('element', element)
		write('properties', properties.slice())
		$('#setText-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setText')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setText-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}

// 设置文本框
Command.cases.setTextBox = {
	initialize: function () {
		$('#setTextBox-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setTextBox-properties').bind(TextBoxProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setTextBox').on('closed', (event) => {
			$('#setTextBox-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(TextBoxProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setTextBox') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setTextBox')
		write('element', element)
		write('properties', properties.slice())
		$('#setTextBox-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setTextBox')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setTextBox-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}

// 设置对话框
Command.cases.setDialogBox = {
	initialize: function () {
		$('#setDialogBox-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setDialogBox-properties').bind(DialogBoxProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setDialogBox').on('closed', (event) => {
			$('#setDialogBox-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(DialogBoxProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setDialogBox') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setDialogBox')
		write('element', element)
		write('properties', properties.slice())
		$('#setDialogBox-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setDialogBox')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setDialogBox-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}

// 控制对话框
Command.cases.controlDialog = {
	initialize: function () {
		$('#controlDialog-confirm').on('click', this.save)

		// 创建操作选项
		$('#controlDialog-operation').loadItems([
			{ name: 'Pause Printing', value: 'pause' },
			{ name: 'Continue Printing', value: 'continue' },
			{ name: 'Print Immediately', value: 'print-immediately' },
			{ name: 'Print Next Page', value: 'print-next-page' }
		])
	},
	parse: function ({ element, operation }) {
		const words = Command.words
			.push(Command.parseElement(element))
			.push(Local.get('command.controlDialog.' + operation))
		return [
			{ color: 'element' },
			{ text: Local.get('command.controlDialog') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, operation = 'pause' }) {
		const write = getElementWriter('controlDialog')
		write('element', element)
		write('operation', operation)
		$('#controlDialog-element').getFocus()
	},
	save: function () {
		const read = getElementReader('controlDialog')
		const element = read('element')
		const operation = read('operation')
		Command.save({ element, operation })
	}
}

// 设置进度条
Command.cases.setProgressBar = {
	initialize: function () {
		$('#setProgressBar-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setProgressBar-properties').bind(ProgressBarProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setProgressBar').on('closed', (event) => {
			$('#setProgressBar-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(ProgressBarProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setProgressBar') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setProgressBar')
		write('element', element)
		write('properties', properties.slice())
		$('#setProgressBar-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setProgressBar')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setProgressBar-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}

// 设置按钮
Command.cases.setButton = {
	initialize: function () {
		$('#setButton-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setButton-properties').bind(ButtonProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setButton').on('closed', (event) => {
			$('#setButton-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(ButtonProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setButton') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setButton')
		write('element', element)
		write('properties', properties.slice())
		$('#setButton-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setButton')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setButton-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}

// 控制按钮
Command.cases.controlButton = {
	initialize: function () {
		$('#controlButton-confirm').on('click', this.save)

		// 创建操作选项
		$('#controlButton-operation').loadItems([
			{ name: 'Select Default Button', value: 'select-default' },
			{ name: 'Select Button', value: 'select' },
			{ name: 'Display Hover Mode', value: 'hover-mode' },
			{ name: 'Display Active Mode', value: 'active-mode' },
			{ name: 'Restore Display Mode', value: 'normal-mode' }
		])

		// 设置操作关联元素
		$('#controlButton-operation')
			.enableHiddenMode()
			.relate([
				{
					case: [
						'select',
						'hover-mode',
						'active-mode',
						'normal-mode'
					],
					targets: [$('#controlButton-element')]
				}
			])
	},
	parse: function ({ operation, element }) {
		const words = Command.words.push(
			Local.get('command.controlButton.' + operation)
		)
		switch (operation) {
			case 'select':
			case 'hover-mode':
			case 'active-mode':
			case 'normal-mode':
				words.push(Command.parseElement(element))
				break
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.controlButton') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		operation = 'select-default',
		element = { type: 'trigger' }
	}) {
		const write = getElementWriter('controlButton')
		write('operation', operation)
		write('element', element)
		$('#controlButton-operation').getFocus()
	},
	save: function () {
		const read = getElementReader('controlButton')
		const operation = read('operation')
		switch (operation) {
			case 'select-default':
				Command.save({ operation })
				break
			case 'select':
			case 'hover-mode':
			case 'active-mode':
			case 'normal-mode': {
				const element = read('element')
				Command.save({ operation, element })
				break
			}
		}
	}
}

// 设置动画
Command.cases.setAnimation = {
	initialize: function () {
		$('#setAnimation-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setAnimation-properties').bind(AnimationProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setAnimation').on('closed', (event) => {
			$('#setAnimation-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(AnimationProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setAnimation') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setAnimation')
		write('element', element)
		write('properties', properties.slice())
		$('#setAnimation-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setAnimation')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setAnimation-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}

// 设置视频
Command.cases.setVideo = {
	initialize: function () {
		$('#setVideo-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setVideo-properties').bind(VideoProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setVideo').on('closed', (event) => {
			$('#setVideo-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(VideoProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setVideo') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setVideo')
		write('element', element)
		write('properties', properties.slice())
		$('#setVideo-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setVideo')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setVideo-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}

// 设置窗口
Command.cases.setWindow = {
	initialize: function () {
		$('#setWindow-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setWindow-properties').bind(WindowProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setWindow').on('closed', (event) => {
			$('#setWindow-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(WindowProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setWindow') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setWindow')
		write('element', element)
		write('properties', properties.slice())
		$('#setWindow-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setWindow')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setWindow-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}

// 等待视频结束
Command.cases.waitForVideo = {
	initialize: function () {
		$('#waitForVideo-confirm').on('click', this.save)
	},
	parse: function ({ element }) {
		return [
			{ color: 'element' },
			{ text: Local.get('command.waitForVideo') + Token(': ') },
			{ text: Command.parseElement(element) }
		]
	},
	load: function ({ element = { type: 'trigger' } }) {
		$('#waitForVideo-element').write(element)
		$('#waitForVideo-element').getFocus()
	},
	save: function () {
		const element = $('#waitForVideo-element').read()
		Command.save({ element })
	}
}

// 设置元素
Command.cases.setElement = {
	initialize: function () {
		$('#setElement-confirm').on('click', this.save)

		// 创建操作选项
		$('#setElement-operation').loadItems([
			{ name: 'Hide', value: 'hide' },
			{ name: 'Show', value: 'show' },
			{ name: 'Disable Pointer Events', value: 'disable-pointer-events' },
			{ name: 'Enable Pointer Events', value: 'enable-pointer-events' },
			{ name: 'Skip Pointer Events', value: 'skip-pointer-events' },
			{ name: 'Move to First', value: 'move-to-first' },
			{ name: 'Move to Last', value: 'move-to-last' }
		])
	},
	parse: function ({ element, operation }) {
		const words = Command.words
			.push(Command.parseElement(element))
			.push(Local.get('command.setElement.' + operation))
		return [
			{ color: 'element' },
			{ text: Local.get('command.setElement.alias') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, operation = 'hide' }) {
		const write = getElementWriter('setElement')
		write('element', element)
		write('operation', operation)
		$('#setElement-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setElement')
		const element = read('element')
		const operation = read('operation')
		Command.save({ element, operation })
	}
}

// 嵌套元素
Command.cases.nestElement = {
	initialize: function () {
		$('#nestElement-confirm').on('click', this.save)
	},
	parse: function ({ parent, child }) {
		const pElement = Command.parseElement(parent)
		const cElement = Command.parseElement(child)
		return [
			{ color: 'element' },
			{ text: Local.get('command.nestElement') + Token(': ') },
			{ text: pElement + Token(' -> ') + cElement }
		]
	},
	load: function ({
		parent = { type: 'trigger' },
		child = { type: 'latest' }
	}) {
		$('#nestElement-parent').write(parent)
		$('#nestElement-child').write(child)
		$('#nestElement-parent').getFocus()
	},
	save: function () {
		const parent = $('#nestElement-parent').read()
		const child = $('#nestElement-child').read()
		Command.save({ parent, child })
	}
}

// 移动元素
Command.cases.moveElement = {
	initialize: function () {
		$('#moveElement-confirm').on('click', this.save)

		// 绑定属性列表
		$('#moveElement-properties').bind(TransformProperty)

		// 创建等待结束选项
		$('#moveElement-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#moveElement').on('open', function (event) {
			$('#moveElement-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#moveElement').on('closed', function (event) {
			$('#moveElement-properties').clear()
			$('#moveElement-easingId').clear()
		})
	},
	parse: function ({ element, properties, easingId, duration, wait }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(TransformProperty.parse(property))
		}
		words.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'element' },
			{ text: Local.get('command.moveElement') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		element = { type: 'trigger' },
		properties = [],
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('moveElement')
		write('element', element)
		write('properties', properties.slice())
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#moveElement-element').getFocus()
	},
	save: function () {
		const read = getElementReader('moveElement')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#moveElement-properties').getFocus()
		}
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ element, properties, easingId, duration, wait })
	}
}

// 删除元素
Command.cases.deleteElement = {
	initialize: function () {
		$('#deleteElement-confirm').on('click', this.save)

		// 创建操作选项
		$('#deleteElement-operation').loadItems([
			{ name: 'Delete Element', value: 'delete-element' },
			{ name: 'Delete Children', value: 'delete-children' },
			{ name: 'Delete All', value: 'delete-all' }
		])

		// 设置操作关联元素
		$('#deleteElement-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['delete-element', 'delete-children'],
					targets: [$('#deleteElement-element')]
				}
			])
	},
	parse: function ({ operation, element }) {
		let info
		switch (operation) {
			case 'delete-element':
				info = Command.parseElement(element)
				break
			case 'delete-children':
				info =
					Command.parseElement(element) +
					Token(' -> ') +
					Local.get('command.deleteElement.children')
				break
			case 'delete-all':
				info = Local.get('command.deleteElement.all-elements')
				break
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.deleteElement') + Token(': ') },
			{ text: info }
		]
	},
	load: function ({
		operation = 'delete-element',
		element = { type: 'trigger' }
	}) {
		$('#deleteElement-operation').write(operation)
		$('#deleteElement-element').write(element)
		$('#deleteElement-operation').getFocus()
	},
	save: function () {
		const operation = $('#deleteElement-operation').read()
		switch (operation) {
			case 'delete-element':
			case 'delete-children': {
				const element = $('#deleteElement-element').read()
				Command.save({ operation, element })
				break
			}
			case 'delete-all':
				Command.save({ operation })
				break
		}
	}
}

// 设置指针事件根元素
Command.cases.setPointerEventRoot = {
	initialize: function () {
		$('#setPointerEventRoot-confirm').on('click', this.save)

		// 创建操作选项
		$('#setPointerEventRoot-operation').loadItems([
			{ name: 'Add Root Element', value: 'add' },
			{ name: 'Remove Root Element', value: 'remove' },
			{ name: 'Remove The Latest Root Element', value: 'remove-latest' },
			{ name: 'Reset', value: 'reset' }
		])

		// 设置操作关联元素
		$('#setPointerEventRoot-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['add', 'remove'],
					targets: [$('#setPointerEventRoot-element')]
				}
			])
	},
	parse: function ({ operation, element }) {
		// 补丁：2023-3-19
		if (operation === 'set') {
			operation = 'add'
		}
		const words = Command.words.push(
			Local.get('command.setPointerEventRoot.' + operation)
		)
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseElement(element))
				break
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setPointerEventRoot') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ operation = 'add', element = { type: 'trigger' } }) {
		// 补丁：2023-3-19
		if (operation === 'set') {
			operation = 'add'
		}
		$('#setPointerEventRoot-operation').write(operation)
		$('#setPointerEventRoot-element').write(element)
		$('#setPointerEventRoot-operation').getFocus()
	},
	save: function () {
		const operation = $('#setPointerEventRoot-operation').read()
		switch (operation) {
			case 'add':
			case 'remove': {
				const element = $('#setPointerEventRoot-element').read()
				Command.save({ operation, element })
				break
			}
			case 'remove-latest':
			case 'reset':
				Command.save({ operation })
				break
		}
	}
}

// 设置焦点
Command.cases.setFocus = {
	initialize: function () {
		$('#setFocus-confirm').on('click', this.save)

		// 创建操作选项
		$('#setFocus-operation').loadItems([
			{ name: 'Add Focus', value: 'add' },
			{ name: 'Remove Focus', value: 'remove' },
			{ name: 'Remove The Latest Focus', value: 'remove-latest' },
			{ name: 'Reset', value: 'reset' }
		])

		// 创建模式选项
		$('#setFocus-mode').loadItems([
			{ name: 'Control Child Buttons', value: 'control-child-buttons' },
			{
				name: 'Control Descendant Buttons',
				value: 'control-descendant-buttons'
			}
		])

		// 设置操作关联元素
		$('#setFocus-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'add',
					targets: [
						$('#setFocus-element'),
						$('#setFocus-mode'),
						$('#setFocus-cancelable')
					]
				},
				{ case: 'remove', targets: [$('#setFocus-element')] }
			])
	},
	parse: function ({ operation, element, mode, cancelable }) {
		const words = Command.words.push(
			Local.get('command.setFocus.' + operation)
		)
		switch (operation) {
			case 'add':
				// 补丁：2023-3-21
				if (mode === undefined) {
					mode = 'control-child-buttons'
				}
				words.push(Command.parseElement(element))
				words.push(Local.get('command.setFocus.' + mode))
				if (cancelable) {
					words.push(Local.get('command.setFocus.cancelable'))
				}
				break
			case 'remove':
				words.push(Command.parseElement(element))
				break
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setFocus') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		operation = 'add',
		element = { type: 'trigger' },
		mode = 'control-child-buttons',
		cancelable = true
	}) {
		$('#setFocus-operation').write(operation)
		$('#setFocus-element').write(element)
		$('#setFocus-mode').write(mode)
		$('#setFocus-cancelable').write(cancelable)
		$('#setFocus-operation').getFocus()
	},
	save: function () {
		const read = getElementReader('setFocus')
		const operation = read('operation')
		switch (operation) {
			case 'add': {
				const element = read('element')
				const mode = read('mode')
				const cancelable = read('cancelable')
				Command.save({ operation, element, mode, cancelable })
				break
			}
			case 'remove': {
				const element = read('element')
				Command.save({ operation, element })
				break
			}
			case 'remove-latest':
			case 'reset':
				Command.save({ operation })
				break
		}
	}
}

// 创建对象
Command.cases.createObject = {
	initialize: function () {
		$('#createObject-confirm').on('click', this.save)
	},
	parse: function ({ presetId, position }) {
		const words = Command.words
			.push(Command.parsePresetObject(presetId))
			.push(Command.parsePosition(position))
		return [
			{ color: 'object' },
			{ text: Local.get('command.createObject') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		presetId = '',
		position = { type: 'actor', actor: { type: 'trigger' } }
	}) {
		const write = getElementWriter('createObject')
		write('presetId', presetId)
		write('position', position)
		$('#createObject-presetId').getFocus()
	},
	save: function () {
		const read = getElementReader('createObject')
		const presetId = read('presetId')
		if (presetId === '') {
			return $('#createObject-presetId').getFocus()
		}
		const position = read('position')
		Command.save({ presetId, position })
	}
}

// 移动光源
Command.cases.moveLight = {
	initialize: function () {
		$('#moveLight-confirm').on('click', this.save)

		// 绑定属性列表
		$('#moveLight-properties').bind(LightProperty)

		// 创建等待选项
		$('#moveLight-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#moveLight').on('open', function (event) {
			$('#moveLight-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#moveLight').on('closed', function (event) {
			$('#moveLight-properties').clear()
			$('#moveLight-easingId').clear()
		})
	},
	parse: function ({ light, properties, easingId, duration, wait }) {
		const words = Command.words.push(Command.parseLight(light))
		for (const property of properties) {
			words.push(LightProperty.parse(property))
		}
		words.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'object' },
			{ text: Local.get('command.moveLight') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		light = { type: 'trigger' },
		properties = [],
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('moveLight')
		write('light', light)
		write('properties', properties.slice())
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#moveLight-light').getFocus()
	},
	save: function () {
		const read = getElementReader('moveLight')
		const light = read('light')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#moveLight-properties').getFocus()
		}
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ light, properties, easingId, duration, wait })
	}
}

// 删除对象
Command.cases.deleteObject = {
	initialize: function () {
		$('#deleteObject-confirm').on('click', this.save)
	},
	parse: function ({ object }) {
		return [
			{ color: 'object' },
			{ text: Local.get('command.deleteObject') + Token(': ') },
			{ text: Command.parseObject(object) }
		]
	},
	load: function ({ object = { type: 'trigger' } }) {
		$('#deleteObject-object').write(object)
		$('#deleteObject-object').getFocus()
	},
	save: function () {
		const object = $('#deleteObject-object').read()
		Command.save({ object })
	}
}

// 设置状态
Command.cases.setState = {
	initialize: function () {
		$('#setState-confirm').on('click', this.save)

		// 创建操作选项
		$('#setState-operation').loadItems([
			{ name: 'Set Time', value: 'set-time' },
			{ name: 'Increase Time', value: 'increase-time' },
			{ name: 'Decrease Time', value: 'decrease-time' }
		])
	},
	parseOperation: function (operation) {
		return Local.get('command.setState.' + operation)
	},
	parse: function ({ state, operation, time }) {
		const words = Command.words
			.push(Command.parseState(state))
			.push(this.parseOperation(operation))
			.push(Command.parseVariableNumber(time, 'ms'))
		return [
			{ color: 'object' },
			{ text: Local.get('command.setState') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		state = { type: 'trigger' },
		operation = 'set-time',
		time = 0
	}) {
		const write = getElementWriter('setState')
		write('state', state)
		write('operation', operation)
		write('time', time)
		$('#setState-state').getFocus()
	},
	save: function () {
		const read = getElementReader('setState')
		const state = read('state')
		const operation = read('operation')
		const time = read('time')
		Command.save({ state, operation, time })
	}
}

// 播放动画
Command.cases.playAnimation = {
	initialize: function () {
		$('#playAnimation-confirm').on('click', this.save)

		// 创建模式选项
		$('#playAnimation-mode').loadItems([
			{ name: 'Position', value: 'position' },
			{ name: 'Actor', value: 'actor' }
		])

		// 设置模式关联元素
		$('#playAnimation-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'position', targets: [$('#playAnimation-position')] },
				{ case: 'actor', targets: [$('#playAnimation-actor')] }
			])

		// 创建旋转选项
		$('#playAnimation-rotatable').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建等待结束选项
		$('#playAnimation-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 动画ID - 写入事件
		$('#playAnimation-animationId').on('write', (event) => {
			const elMotion = $('#playAnimation-motion')
			elMotion.loadItems(Animation.getMotionListItems(event.value))
			elMotion.write2(elMotion.read())
		})
	},
	parseRotatable: function (rotatable) {
		return rotatable ? Local.get('command.playAnimation.rotatable') : ''
	},
	parsePriority: function (priority) {
		if (priority === 0) return ''
		const abs = Command.setNumberColor(Math.abs(priority))
		return priority > 0 ? Token('+') + abs : Token('-') + abs
	},
	parseOffsetY: function (offsetY) {
		let num
		if (typeof offsetY === 'number')
			num = Command.setNumberColor(Math.abs(offsetY)) + 'px'
		return typeof offsetY === 'number'
			? offsetY > 0
				? num
				: Token('-') + num
			: Command.parseVariableNumber(offsetY)
	},
	parse: function ({
		mode,
		position,
		actor,
		animationId,
		motion,
		rotatable,
		priority,
		offsetY,
		angle,
		speed,
		wait
	}) {
		const words = Command.words
		switch (mode) {
			case 'position':
				words.push(Command.parsePosition(position))
				break
			case 'actor': {
				const bind = Local.get('command.playAnimation.bind')
				words.push(
					bind + Token('(') + Command.parseActor(actor) + Token(')')
				)
				break
			}
		}
		words
			.push(Command.parseFileName(animationId))
			.push(Command.parseEnumString(motion))
			.push(this.parseRotatable(rotatable))
			.push(this.parsePriority(priority))
			.push(this.parseOffsetY(offsetY))
			.push(Command.parseVariableNumber(angle, '°'))
			.push(Command.parseVariableNumber(speed))
			.push(Command.parseWait(wait))
		return [
			{ color: 'object' },
			{ text: Local.get('command.playAnimation') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		mode = 'position',
		position = { type: 'actor', actor: { type: 'trigger' } },
		actor = { type: 'trigger' },
		animationId = '',
		motion = '',
		rotatable = false,
		priority = 0,
		offsetY = 0,
		angle = 0,
		speed = 1,
		wait = false
	}) {
		const write = getElementWriter('playAnimation')
		write('mode', mode)
		write('position', position)
		write('actor', actor)
		write('animationId', animationId)
		write('motion', motion)
		write('rotatable', rotatable)
		write('priority', priority)
		write('offsetY', offsetY)
		write('angle', angle)
		write('speed', speed)
		write('wait', wait)
		$('#playAnimation-mode').getFocus()
	},
	save: function () {
		const read = getElementReader('playAnimation')
		const mode = read('mode')
		const animationId = read('animationId')
		const motion = read('motion')
		const rotatable = read('rotatable')
		const priority = read('priority')
		const offsetY = read('offsetY')
		const angle = read('angle')
		const speed = read('speed')
		const wait = read('wait')
		if (animationId === '') {
			return $('#playAnimation-animationId').getFocus()
		}
		if (motion === '') {
			return $('#playAnimation-motion').getFocus()
		}
		switch (mode) {
			case 'position': {
				const position = read('position')
				Command.save({
					mode,
					position,
					animationId,
					motion,
					rotatable,
					priority,
					offsetY,
					angle,
					speed,
					wait
				})
				break
			}
			case 'actor': {
				const actor = read('actor')
				Command.save({
					mode,
					actor,
					animationId,
					motion,
					rotatable,
					priority,
					offsetY,
					angle,
					speed,
					wait
				})
				break
			}
		}
	}
}

// 设置对象动画
Command.cases.setObjectAnimation = {
	initialize: function () {
		$('#setObjectAnimation-confirm').on('click', this.save)

		// 创建分类选项
		$('#setObjectAnimation-sort').loadItems([
			{ name: 'Only Actor Animation', value: 'actor' },
			{ name: 'All Animation Components', value: 'components' },
			{ name: 'Trigger Animation', value: 'trigger' },
			{ name: 'Scene Animation', value: 'animation' }
		])

		// 设置动画关联元素
		$('#setObjectAnimation-sort')
			.enableHiddenMode()
			.relate([
				{
					case: ['actor', 'components'],
					targets: [$('#setObjectAnimation-actor')]
				},
				{
					case: 'trigger',
					targets: [$('#setObjectAnimation-trigger')]
				},
				{
					case: 'animation',
					targets: [$('#setObjectAnimation-animation')]
				}
			])

		// 创建操作选项
		$('#setObjectAnimation-operation').loadItems([
			{ name: 'Set Tint', value: 'set-tint' },
			{ name: 'Set RGB', value: 'set-rgb' },
			{ name: 'Set Gray', value: 'set-gray' },
			{ name: 'Set Opacity', value: 'set-opacity' },
			{ name: 'Set OffsetY', value: 'set-offsetY' },
			{ name: 'Set Rotation', value: 'set-rotation' }
		])

		// 设置操作关联元素
		$('#setObjectAnimation-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'set-tint',
					targets: [
						$('#setObjectAnimation-tint-0'),
						$('#setObjectAnimation-tint-1'),
						$('#setObjectAnimation-tint-2'),
						$('#setObjectAnimation-tint-3')
					]
				},
				{
					case: 'set-rgb',
					targets: [
						$('#setObjectAnimation-tint-0'),
						$('#setObjectAnimation-tint-1'),
						$('#setObjectAnimation-tint-2')
					]
				},
				{
					case: 'set-gray',
					targets: [$('#setObjectAnimation-tint-3')]
				},
				{
					case: 'set-opacity',
					targets: [$('#setObjectAnimation-opacity')]
				},
				{
					case: 'set-offsetY',
					targets: [$('#setObjectAnimation-offsetY')]
				},
				{
					case: 'set-rotation',
					targets: [$('#setObjectAnimation-rotation')]
				}
			])

		// 创建等待结束选项
		$('#setObjectAnimation-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setObjectAnimation').on('open', function (event) {
			$('#setObjectAnimation-easingId').loadItems(
				Data.createEasingItems()
			)
		})

		// 清理内存 - 窗口已关闭事件
		$('#setObjectAnimation').on('closed', function (event) {
			$('#setObjectAnimation-easingId').clear()
		})
	},
	parseTint: function (operation, [red, green, blue, gray]) {
		const label = Local.get('command.setObjectAnimation.' + operation)
		const _red = Command.setNumberColor(red)
		const _green = Command.setNumberColor(green)
		const _blue = Command.setNumberColor(blue)
		const _gray = Command.setNumberColor(gray)
		switch (operation) {
			case 'set-tint':
				return (
					label +
					Token('(') +
					_red +
					Token(', ') +
					_green +
					Token(', ') +
					_blue +
					Token(', ') +
					_gray +
					Token(')')
				)
			case 'set-rgb':
				return (
					label +
					Token('(') +
					_red +
					Token(', ') +
					_green +
					Token(', ') +
					_blue +
					Token(')')
				)
			case 'set-gray':
				return label + Token('(') + _gray + Token(')')
		}
	},
	parseProperty: function (operation, property) {
		const label = Local.get('command.setObjectAnimation.' + operation)
		return (
			label +
			Token('(') +
			Command.parseVariableNumber(property) +
			Token(')')
		)
	},
	parse: function ({
		sort,
		object,
		operation,
		tint,
		opacity,
		offsetY,
		rotation,
		easingId,
		duration,
		wait
	}) {
		const words = Command.words
		words.push(Local.get('command.setObjectAnimation.sort.' + sort))
		switch (sort) {
			case 'actor':
			case 'components':
				words.push(Command.parseActor(object))
				break
			case 'trigger':
				words.push(Command.parseTrigger(object))
				break
			case 'animation':
				words.push(Command.parseObject(object))
				break
		}
		switch (operation) {
			case 'set-tint':
			case 'set-rgb':
			case 'set-gray':
				words.push(this.parseTint(operation, tint))
				break
			case 'set-opacity':
				words.push(this.parseProperty(operation, opacity))
				break
			case 'set-offsetY':
				words.push(this.parseProperty(operation, offsetY))
				break
			case 'set-rotation':
				words.push(this.parseProperty(operation, rotation))
				break
		}
		words.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'object' },
			{ text: Local.get('command.setObjectAnimation') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		sort = 'actor',
		object = { type: 'trigger' },
		operation = 'set-tint',
		tint = [0, 0, 0, 0],
		opacity = 1,
		offsetY = 0,
		rotation = 0,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setObjectAnimation')
		let actor = { type: 'trigger' }
		let trigger = { type: 'trigger' }
		let animation = { type: 'trigger' }
		switch (sort) {
			case 'actor':
			case 'components':
				actor = object
				break
			case 'trigger':
				trigger = object
				break
			case 'animation':
				animation = object
				break
		}
		write('sort', sort)
		write('actor', actor)
		write('trigger', trigger)
		write('animation', animation)
		write('operation', operation)
		write('tint-0', tint[0])
		write('tint-1', tint[1])
		write('tint-2', tint[2])
		write('tint-3', tint[3])
		write('opacity', opacity)
		write('offsetY', offsetY)
		write('rotation', rotation)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setObjectAnimation-sort').getFocus()
	},
	save: function () {
		const read = getElementReader('setObjectAnimation')
		const sort = read('sort')
		const operation = read('operation')
		let object
		let red = read('tint-0')
		let green = read('tint-1')
		let blue = read('tint-2')
		let gray = read('tint-3')
		switch (sort) {
			case 'actor':
			case 'components':
				object = read('actor')
				break
			case 'trigger':
				object = read('trigger')
				break
			case 'animation':
				object = read('animation')
				break
		}
		switch (operation) {
			case 'set-tint':
				break
			case 'set-rgb':
				gray = 0
				break
			case 'set-gray':
				red = 0
				green = 0
				blue = 0
				break
		}
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		if ('set-tint|set-rgb|set-gray'.includes(operation)) {
			const tint = [red, green, blue, gray]
			Command.save({
				sort,
				object,
				operation,
				tint,
				easingId,
				duration,
				wait
			})
		} else if (operation === 'set-opacity') {
			const opacity = read('opacity')
			Command.save({
				sort,
				object,
				operation,
				opacity,
				easingId,
				duration,
				wait
			})
		} else if (operation === 'set-offsetY') {
			const offsetY = read('offsetY')
			Command.save({
				sort,
				object,
				operation,
				offsetY,
				easingId,
				duration,
				wait
			})
		} else if (operation === 'set-rotation') {
			const rotation = read('rotation')
			Command.save({
				sort,
				object,
				operation,
				rotation,
				easingId,
				duration,
				wait
			})
		}
	}
}

// 播放音频
Command.cases.playAudio = {
	initialize: function () {
		$('#playAudio-confirm').on('click', this.save)

		// 创建类型选项
		$('#playAudio-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' },
			{ name: 'SE - Attenuated', value: 'se-attenuated' }
		])

		// 设置类型关联元素
		$('#playAudio-type')
			.enableHiddenMode()
			.relate([
				{ case: 'se-attenuated', targets: [$('#playAudio-location')] }
			])
	},
	parse: function ({ type, audio, volume, location }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(Command.parseFileName(audio))
			.push(Command.setNumberColor(volume))
		switch (type) {
			case 'se-attenuated':
				words.push(Command.parsePosition(location))
				break
		}
		return [
			{ color: 'audio' },
			{ text: Local.get('command.playAudio') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		type = 'se-attenuated',
		audio = '',
		volume = 1,
		location = { type: 'actor', actor: { type: 'trigger' } }
	}) {
		const write = getElementWriter('playAudio')
		write('type', type)
		write('audio', audio)
		write('volume', volume)
		write('location', location)
		$('#playAudio-type').getFocus()
	},
	save: function () {
		const read = getElementReader('playAudio')
		const type = read('type')
		const audio = read('audio')
		const volume = read('volume')
		if (audio === '') {
			return $('#playAudio-audio').getFocus()
		}
		switch (type) {
			case 'bgm':
			case 'bgs':
			case 'cv':
			case 'se':
				Command.save({ type, audio, volume })
				break
			case 'se-attenuated': {
				const location = read('location')
				Command.save({ type, audio, volume, location })
				break
			}
		}
	}
}

// 停止播放音频
Command.cases.stopAudio = {
	initialize: function () {
		$('#stopAudio-confirm').on('click', this.save)

		// 创建类型选项
		$('#stopAudio-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' },
			{ name: 'ALL', value: 'all' }
		])
	},
	parse: function ({ type }) {
		const words = Command.words.push(Command.parseAudioType(type))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.stopAudio') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ type = 'bgm' }) {
		const write = getElementWriter('stopAudio')
		write('type', type)
		$('#stopAudio-type').getFocus()
	},
	save: function () {
		const read = getElementReader('stopAudio')
		const type = read('type')
		Command.save({ type })
	}
}

// 设置音量
Command.cases.setVolume = {
	initialize: function () {
		$('#setVolume-confirm').on('click', this.save)

		// 创建类型选项
		$('#setVolume-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' }
		])

		// 创建等待选项
		$('#setVolume-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setVolume').on('open', function (event) {
			$('#setVolume-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#setVolume').on('closed', function (event) {
			$('#setVolume-easingId').clear()
		})
	},
	parse: function ({ type, volume, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(Command.parseVariableNumber(volume))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setVolume') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		type = 'bgm',
		volume = 1,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setVolume')
		write('type', type)
		write('volume', volume)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setVolume-type').getFocus()
	},
	save: function () {
		const read = getElementReader('setVolume')
		const type = read('type')
		const volume = read('volume')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ type, volume, easingId, duration, wait })
	}
}

// 设置声像
Command.cases.setPan = {
	initialize: function () {
		$('#setPan-confirm').on('click', this.save)

		// 创建类型选项
		$('#setPan-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' }
		])

		// 创建等待选项
		$('#setPan-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setPan').on('open', function (event) {
			$('#setPan-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#setPan').on('closed', function (event) {
			$('#setPan-easingId').clear()
		})
	},
	parse: function ({ type, pan, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(Command.parseVariableNumber(pan))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setPan') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		type = 'bgm',
		pan = 0,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setPan')
		write('type', type)
		write('pan', pan)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setPan-type').getFocus()
	},
	save: function () {
		const read = getElementReader('setPan')
		const type = read('type')
		const pan = read('pan')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ type, pan, easingId, duration, wait })
	}
}

// 设置混响
Command.cases.setReverb = {
	initialize: function () {
		$('#setReverb-confirm').on('click', this.save)

		// 创建类型选项
		$('#setReverb-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' }
		])

		// 创建等待选项
		$('#setReverb-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setReverb').on('open', function (event) {
			$('#setReverb-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#setReverb').on('closed', function (event) {
			$('#setReverb-easingId').clear()
		})
	},
	parse: function ({ type, dry, wet, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(Command.parseVariableNumber(dry))
			.push(Command.parseVariableNumber(wet))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setReverb') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		type = 'bgm',
		dry = 1,
		wet = 0,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setReverb')
		write('type', type)
		write('dry', dry)
		write('wet', wet)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setReverb-type').getFocus()
	},
	save: function () {
		const read = getElementReader('setReverb')
		const type = read('type')
		const dry = read('dry')
		const wet = read('wet')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ type, dry, wet, easingId, duration, wait })
	}
}

// 设置循环
Command.cases.setLoop = {
	initialize: function () {
		$('#setLoop-confirm').on('click', this.save)

		// 创建类型选项
		$('#setLoop-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' }
		])

		// 创建循环选项
		$('#setLoop-loop').loadItems([
			{ name: 'Once', value: false },
			{ name: 'Loop', value: true }
		])
	},
	parseLoop: function (loop) {
		switch (loop) {
			case false:
				return Local.get('command.setLoop.once')
			case true:
				return Local.get('command.setLoop.loop')
		}
	},
	parse: function ({ type, loop }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(this.parseLoop(loop))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setLoop') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ type = 'bgm', loop = false }) {
		const write = getElementWriter('setLoop')
		write('type', type)
		write('loop', loop)
		$('#setLoop-type').getFocus()
	},
	save: function () {
		const read = getElementReader('setLoop')
		const type = read('type')
		const loop = read('loop')
		Command.save({ type, loop })
	}
}

// 保存音频
Command.cases.saveAudio = {
	initialize: function () {
		$('#saveAudio-confirm').on('click', this.save)

		// 创建类型选项
		$('#saveAudio-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' }
		])
	},
	parse: function ({ type }) {
		return [
			{ color: 'audio' },
			{ text: Local.get('command.saveAudio') + Token(': ') },
			{ text: Command.parseAudioType(type) }
		]
	},
	load: function ({ type = 'bgm' }) {
		const write = getElementWriter('saveAudio')
		write('type', type)
		$('#saveAudio-type').getFocus()
	},
	save: function () {
		const read = getElementReader('saveAudio')
		const type = read('type')
		Command.save({ type })
	}
}

// 恢复音频
Command.cases.restoreAudio = {
	initialize: function () {
		$('#restoreAudio-confirm').on('click', this.save)

		// 创建类型选项
		$('#restoreAudio-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' }
		])
	},
	parse: function ({ type }) {
		return [
			{ color: 'audio' },
			{ text: Local.get('command.restoreAudio') + Token(': ') },
			{ text: Command.parseAudioType(type) }
		]
	},
	load: function ({ type = 'bgm' }) {
		const write = getElementWriter('restoreAudio')
		write('type', type)
		$('#restoreAudio-type').getFocus()
	},
	save: function () {
		const read = getElementReader('restoreAudio')
		const type = read('type')
		Command.save({ type })
	}
}

// 创建角色
Command.cases.createActor = {
	initialize: function () {
		$('#createActor-confirm').on('click', this.save)

		// 创建队伍选项 - 窗口打开事件
		$('#createActor').on('open', function (event) {
			$('#createActor-teamId').loadItems(Data.createTeamItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#createActor').on('closed', function (event) {
			$('#createActor-teamId').clear()
		})
	},
	parse: function ({ actorId, teamId, position, angle }) {
		const words = Command.words
			.push(Command.parseFileName(actorId))
			.push(Command.parseTeam(teamId))
			.push(Command.parsePosition(position))
			.push(Command.parseVariableNumber(angle, '°'))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.createActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actorId = '',
		teamId = Data.teams.list[0].id,
		position = { type: 'absolute', x: 0, y: 0 },
		angle = 0
	}) {
		const write = getElementWriter('createActor')
		write('actorId', actorId)
		write('teamId', teamId)
		write('position', position)
		write('angle', angle)
		$('#createActor-actorId').getFocus('all')
	},
	save: function () {
		const read = getElementReader('createActor')
		const actorId = read('actorId')
		const teamId = read('teamId')
		const position = read('position')
		const angle = read('angle')
		if (actorId === '') {
			return $('#createActor-actorId').getFocus()
		}
		Command.save({ actorId, teamId, position, angle })
	}
}

// 移动角色
Command.cases.moveActor = {
	initialize: function () {
		$('#moveActor-confirm').on('click', this.save)

		// 创建移动模式选项
		$('#moveActor-mode').loadItems([
			{ name: 'Stop', value: 'stop' },
			{ name: 'Keep', value: 'keep' },
			{ name: 'Straight', value: 'straight' },
			{ name: 'Navigate', value: 'navigate' },
			{ name: 'Navigate - Bypass Actors', value: 'navigate-bypass' },
			{ name: 'Teleport', value: 'teleport' }
		])

		// 设置移动模式关联元素
		$('#moveActor-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'keep', targets: [$('#moveActor-angle')] },
				{
					case: ['straight', 'navigate', 'navigate-bypass'],
					targets: [$('#moveActor-destination'), $('#moveActor-wait')]
				},
				{ case: 'teleport', targets: [$('#moveActor-destination')] }
			])

		// 创建等待结束选项
		$('#moveActor-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
	},
	parseMode: function (mode) {
		let string = Local.get('command.moveActor.mode.' + mode)
		if (mode === 'navigate-bypass') {
			string = string.replace('(', Token('(')).replace(')', Token(')'))
		}
		return string
	},
	parse: function ({ actor, mode, angle, destination, wait }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(this.parseMode(mode))
		switch (mode) {
			case 'stop':
				break
			case 'keep':
				words.push(Command.parseVariableNumber(angle, '°'))
				break
			case 'straight':
			case 'navigate':
			case 'navigate-bypass':
				words.push(Command.parsePosition(destination))
				words.push(Command.parseWait(wait))
				break
			case 'teleport':
				words.push(Command.parsePosition(destination))
				break
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.moveActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		mode = 'straight',
		angle = 0,
		destination = { type: 'absolute', x: 0, y: 0 },
		wait = false
	}) {
		const write = getElementWriter('moveActor')
		write('actor', actor)
		write('mode', mode)
		write('angle', angle)
		write('destination', destination)
		write('wait', wait)
		$('#moveActor-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('moveActor')
		const actor = read('actor')
		const mode = read('mode')
		switch (mode) {
			case 'stop':
				Command.save({ actor, mode })
				break
			case 'keep': {
				const angle = read('angle')
				Command.save({ actor, mode, angle })
				break
			}
			case 'straight':
			case 'navigate':
			case 'navigate-bypass': {
				const destination = read('destination')
				const wait = read('wait')
				Command.save({ actor, mode, destination, wait })
				break
			}
			case 'teleport': {
				const destination = read('destination')
				Command.save({ actor, mode, destination })
				break
			}
		}
	}
}

// 跟随角色
Command.cases.followActor = {
	initialize: function () {
		$('#followActor-confirm').on('click', this.save)

		// 创建模式选项
		$('#followActor-mode').loadItems([
			{ name: 'Circle', value: 'circle' },
			{ name: 'Rectangle', value: 'rectangle' }
		])

		// 设置模式关联元素
		$('#followActor-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'circle', targets: [$('#followActor-offset')] },
				{ case: 'rectangle', targets: [$('#followActor-vertDist')] }
			])

		// 创建导航选项
		$('#followActor-navigate').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 设置导航关联元素
		$('#followActor-navigate')
			.enableHiddenMode()
			.relate([{ case: true, targets: [$('#followActor-bypass')] }])

		// 创建绕过角色选项
		$('#followActor-bypass').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建跟随一次选项
		$('#followActor-once').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 设置跟随一次关联元素
		$('#followActor-once')
			.enableHiddenMode()
			.relate([{ case: true, targets: [$('#followActor-wait')] }])

		// 创建等待选项
		$('#followActor-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
	},
	parseActors: function (actor, target) {
		const sActor = Command.parseActor(actor)
		const dActor = Command.parseActor(target)
		return sActor + Token(' -> ') + dActor
	},
	parse: function ({
		actor,
		target,
		mode,
		minDist,
		maxDist,
		offset,
		vertDist,
		bufferDist,
		navigate,
		bypass,
		once,
		wait
	}) {
		// 2025.3.5补丁
		if (bufferDist === undefined) {
			bufferDist = 0
		}
		const words = Command.words
			.push(this.parseActors(actor, target))
			.push(Local.get('command.followActor.mode.' + mode))
			.push(
				Command.parseVariableNumber(minDist) +
					Token(' ~ ') +
					Command.parseVariableNumber(maxDist)
			)
		switch (mode) {
			case 'circle':
				words.push(Command.setNumberColor(offset.toString()))
				break
			case 'rectangle':
				words.push(Command.setNumberColor(vertDist.toString()))
				break
		}
		words.push(Command.setNumberColor(bufferDist.toString()))
		if (navigate) {
			words.push(Local.get('command.followActor.navigate'))
			if (bypass) {
				words.push(Local.get('command.followActor.bypass'))
			}
		}
		if (once) {
			words.push(Local.get('command.followActor.once'))
			words.push(Command.parseWait(wait))
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.followActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		target = { type: 'trigger' },
		mode = 'circle',
		minDist = 1,
		maxDist = 2,
		offset = 0,
		vertDist = 0,
		bufferDist = 0,
		navigate = true,
		bypass = false,
		once = false,
		wait = false
	}) {
		const write = getElementWriter('followActor')
		write('actor', actor)
		write('target', target)
		write('mode', mode)
		write('minDist', minDist)
		write('maxDist', maxDist)
		write('offset', offset)
		write('vertDist', vertDist)
		write('bufferDist', bufferDist)
		write('navigate', navigate)
		write('bypass', bypass)
		write('once', once)
		write('wait', wait)
		$('#followActor-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('followActor')
		const actor = read('actor')
		const target = read('target')
		const mode = read('mode')
		const minDist = read('minDist')
		const maxDist = read('maxDist')
		const bufferDist = read('bufferDist')
		const navigate = read('navigate')
		const bypass = navigate ? { bypass: read('bypass') } : {}
		const once = read('once')
		const wait = once ? read('wait') : false
		switch (mode) {
			case 'circle': {
				const offset = read('offset')
				Command.save({
					actor,
					target,
					mode,
					minDist,
					maxDist,
					offset,
					bufferDist,
					navigate,
					...bypass,
					once,
					wait
				})
				break
			}
			case 'rectangle': {
				const vertDist = read('vertDist')
				Command.save({
					actor,
					target,
					mode,
					minDist,
					maxDist,
					vertDist,
					bufferDist,
					navigate,
					...bypass,
					once,
					wait
				})
				break
			}
		}
	}
}

// 平移角色
Command.cases.translateActor = {
	initialize: function () {
		$('#translateActor-confirm').on('click', this.save)

		// 创建等待结束选项
		$('#translateActor-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#translateActor').on('open', function (event) {
			$('#translateActor-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#translateActor').on('closed', function (event) {
			$('#translateActor-easingId').clear()
		})
	},
	parse: function ({ actor, angle, distance, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseAngle(angle))
			.push(Command.parseVariableNumber(distance, 't'))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.translateActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		angle = { type: 'absolute', degrees: 0 },
		distance = 0,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('translateActor')
		write('actor', actor)
		write('angle', angle)
		write('distance', distance)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#translateActor-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('translateActor')
		const actor = read('actor')
		const angle = read('angle')
		const distance = read('distance')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		if (distance === 0) {
			return $('#translateActor-distance').getFocus('all')
		}
		Command.save({ actor, angle, distance, easingId, duration, wait })
	}
}

// 增减仇恨值
Command.cases.changeThreat = {
	initialize: function () {
		$('#changeThreat-confirm').on('click', this.save)

		// 创建操作选项
		$('#changeThreat-operation').loadItems([
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		])
	},
	parseActors: function (actor, target) {
		const sActor = Command.parseActor(actor)
		const dActor = Command.parseActor(target)
		return sActor + Token(' -> ') + dActor
	},
	parseOperation: function (operation) {
		return Local.get('command.changeThreat.' + operation)
	},
	parse: function ({ actor, target, operation, threat }) {
		const words = Command.words
			.push(this.parseActors(actor, target))
			.push(this.parseOperation(operation))
			.push(Command.parseVariableNumber(threat))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeThreat') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		target = { type: 'trigger' },
		operation = 'increase',
		threat = 0
	}) {
		const write = getElementWriter('changeThreat')
		write('actor', actor)
		write('target', target)
		write('operation', operation)
		write('threat', threat)
		$('#changeThreat-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeThreat')
		const actor = read('actor')
		const target = read('target')
		const operation = read('operation')
		const threat = read('threat')
		Command.save({ actor, target, operation, threat })
	}
}

// 设置体重
Command.cases.setWeight = {
	initialize: function () {
		$('#setWeight-confirm').on('click', this.save)
	},
	parse: function ({ actor, weight }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseVariableNumber(weight))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setWeight') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ actor = { type: 'trigger' }, weight = 0 }) {
		const write = getElementWriter('setWeight')
		write('actor', actor)
		write('weight', weight)
		$('#setWeight-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setWeight')
		const actor = read('actor')
		const weight = read('weight')
		Command.save({ actor, weight })
	}
}

// 设置移动速度
Command.cases.setMovementSpeed = {
	initialize: function () {
		$('#setMovementSpeed-confirm').on('click', this.save)

		// 创建属性选项
		$('#setMovementSpeed-property').loadItems([
			{ name: 'Base Speed', value: 'base' },
			{ name: 'Speed Factor', value: 'factor' },
			{ name: 'Speed Factor (Temp)', value: 'factor-temp' }
		])

		// 设置属性关联元素
		$('#setMovementSpeed-property')
			.enableHiddenMode()
			.relate([
				{ case: 'base', targets: [$('#setMovementSpeed-base')] },
				{
					case: ['factor', 'factor-temp'],
					targets: [$('#setMovementSpeed-factor')]
				}
			])
	},
	parse: function ({ actor, property, base, factor }) {
		const label = Local.get('command.setMovementSpeed.' + property)
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(label.replace('(', Token('(')).replace(')', Token(')')))
		switch (property) {
			case 'base':
				words.push(Command.parseVariableNumber(base, 't/s'))
				break
			case 'factor':
			case 'factor-temp':
				words.push(Command.parseVariableNumber(factor))
				break
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setMovementSpeed') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		property = 'base',
		base = 0,
		factor = 0
	}) {
		const write = getElementWriter('setMovementSpeed')
		write('actor', actor)
		write('property', property)
		write('base', base)
		write('factor', factor)
		$('#setMovementSpeed-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setMovementSpeed')
		const actor = read('actor')
		const property = read('property')
		switch (property) {
			case 'base': {
				const base = read('base')
				Command.save({ actor, property, base })
				break
			}
			case 'factor':
			case 'factor-temp': {
				const factor = read('factor')
				Command.save({ actor, property, factor })
				break
			}
		}
	}
}

// 设置角度
Command.cases.setAngle = {
	initialize: function () {
		$('#setAngle-confirm').on('click', this.save)

		// 创建等待结束选项
		$('#setAngle-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setAngle').on('open', function (event) {
			$('#setAngle-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#setAngle').on('closed', function (event) {
			$('#setAngle-easingId').clear()
		})
	},
	parse: function ({ actor, angle, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseAngle(angle))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setAngle') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		angle = { type: 'absolute', degrees: 0 },
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setAngle')
		write('actor', actor)
		write('angle', angle)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setAngle-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setAngle')
		const actor = read('actor')
		const angle = read('angle')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ actor, angle, easingId, duration, wait })
	}
}

// 固定角度
Command.cases.fixAngle = {
	initialize: function () {
		$('#fixAngle-confirm').on('click', this.save)

		// 创建操作选项
		$('#fixAngle-fixed').loadItems([
			{ name: 'Fixed', value: true },
			{ name: 'Unfixed', value: false }
		])
	},
	parse: function ({ actor, fixed }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.fixAngle.fixed.' + fixed))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.fixAngle') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ actor = { type: 'trigger' }, fixed = true }) {
		const write = getElementWriter('fixAngle')
		write('actor', actor)
		write('fixed', fixed)
		$('#fixAngle-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('fixAngle')
		const actor = read('actor')
		const fixed = read('fixed')
		Command.save({ actor, fixed })
	}
}

// 设置激活状态
Command.cases.setActive = {
	initialize: function () {
		$('#setActive-confirm').on('click', this.save)

		// 创建激活状态选项
		$('#setActive-active').loadItems([
			{ name: 'Active', value: true },
			{ name: 'Inactive', value: false }
		])
	},
	parse: function ({ actor, active }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.setActive.active.' + active))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setActive') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ actor = { type: 'trigger' }, active = false }) {
		const write = getElementWriter('setActive')
		write('actor', actor)
		write('active', active)
		$('#setActive-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setActive')
		const actor = read('actor')
		const active = read('active')
		Command.save({ actor, active })
	}
}

// 获取角色
Command.cases.getActor = {
	initialize: function () {
		$('#getActor-confirm').on('click', this.save)

		// 创建区域选项
		$('#getActor-area').loadItems([
			{ name: 'Square', value: 'square' },
			{ name: 'Circle', value: 'circle' }
		])

		// 设置区域关联元素
		$('#getActor-area')
			.enableHiddenMode()
			.relate([
				{ case: 'square', targets: [$('#getActor-size')] },
				{ case: 'circle', targets: [$('#getActor-radius')] }
			])

		// 创建选择器选项
		$('#getActor-selector').loadItems([
			{ name: 'Team Enemy', value: 'enemy' },
			{ name: 'Team Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Any', value: 'any' }
		])

		// 设置选择器关联元素
		$('#getActor-selector')
			.enableHiddenMode()
			.relate([
				{
					case: ['enemy', 'friend', 'team'],
					targets: [$('#getActor-teamId')]
				}
			])

		// 创建条件选项
		$('#getActor-condition').loadItems([
			{ name: 'Nearest', value: 'nearest' },
			{ name: 'Farthest', value: 'farthest' },
			{ name: 'Min Attribute Value', value: 'min-attribute-value' },
			{ name: 'Max Attribute Value', value: 'max-attribute-value' },
			{ name: 'Min Attribute Ratio', value: 'min-attribute-ratio' },
			{ name: 'Max Attribute Ratio', value: 'max-attribute-ratio' },
			{ name: 'Random', value: 'random' }
		])

		// 设置条件关联元素
		$('#getActor-condition')
			.enableHiddenMode()
			.relate([
				{
					case: ['min-attribute-value', 'max-attribute-value'],
					targets: [$('#getActor-attribute')]
				},
				{
					case: ['min-attribute-ratio', 'max-attribute-ratio'],
					targets: [$('#getActor-attribute'), $('#getActor-divisor')]
				}
			])

		// 创建激活状态选项
		$('#getActor-activation').loadItems([
			{ name: 'Active', value: 'active' },
			{ name: 'Inactive', value: 'inactive' },
			{ name: 'Either', value: 'either' }
		])

		// 创建排除模式选项
		$('#getActor-exclusion').loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Exclude an Actor', value: 'actor' },
			{ name: 'Exclude a Team', value: 'team' }
		])

		// 设置排除模式关联元素
		$('#getActor-exclusion')
			.enableHiddenMode()
			.relate([
				{ case: 'actor', targets: [$('#getActor-exclusionActor')] },
				{ case: 'team', targets: [$('#getActor-exclusionTeamId')] }
			])

		// 侦听窗口打开事件
		$('#getActor').on('open', function (event) {
			const items = Data.createTeamItems()
			$('#getActor-teamId').loadItems(items)
			$('#getActor-exclusionTeamId').loadItems(items)
		})

		// 侦听窗口已关闭事件
		$('#getActor').on('closed', function (event) {
			$('#getActor-teamId').clear()
			$('#getActor-exclusionTeamId').clear()
		})
	},
	remapSelectorPatch: function (selector) {
		switch (selector) {
			case 'team-enemy':
				return 'enemy'
			case 'team-friend':
				return 'friend'
			case 'team-member':
				return 'team'
			default:
				return selector
		}
	},
	remapActivationPatch: function (activation, active) {
		switch (active) {
			case true:
				return 'active'
			case false:
				return 'either'
			default:
				return activation
		}
	},
	parseCondition: function (condition, attribute, divisor) {
		const label = Local.get('command.getActor.condition.' + condition)
		switch (condition) {
			case 'nearest':
			case 'farthest':
			case 'random':
				return label
			case 'min-attribute-value':
			case 'max-attribute-value':
				return (
					label +
					Token('(') +
					Command.parseAttributeKey('actor', attribute) +
					Token(')')
				)
			case 'min-attribute-ratio':
			case 'max-attribute-ratio':
				return (
					label +
					Token('(') +
					Command.parseAttributeKey('actor', attribute) +
					Token(' / ') +
					Command.parseAttributeKey('actor', divisor) +
					Token(')')
				)
		}
	},
	parse: function ({
		variable,
		position,
		area,
		size,
		radius,
		selector,
		teamId,
		condition,
		attribute,
		divisor,
		activation,
		exclusion,
		exclusionActor,
		exclusionTeamId,
		active
	}) {
		// 补丁：2023-1-7
		selector = this.remapSelectorPatch(selector)
		activation = this.remapActivationPatch(activation, active)
		condition = condition ?? 'nearest'
		exclusion = exclusion ?? 'none'
		const actor = Command.parseVariable(variable, 'object', true)
		const words = Command.words
			.push(Command.parsePosition(position))
			.push(Local.get('command.getActor.' + area))
			.push(Command.parseVariableNumber(size ?? radius, 't'))
		const selectorLabel = Command.parseActorSelector(selector)
		switch (selector) {
			case 'enemy':
			case 'friend':
			case 'team':
				words.push(
					selectorLabel +
						Token('(') +
						Command.parseVariableTeam(teamId) +
						Token(')')
				)
				break
			case 'any':
				words.push(selectorLabel)
				break
		}
		words.push(this.parseCondition(condition, attribute, divisor))
		words.push(Local.get('command.getActor.' + activation))
		switch (exclusion) {
			case 'actor': {
				const label = Local.get('command.getActor.exclude')
				words.push(
					label +
						Token('(') +
						Command.parseActor(exclusionActor) +
						Token(')')
				)
				break
			}
			case 'team': {
				const label = Local.get('command.getActor.exclude')
				words.push(
					label +
						Token('(') +
						Command.parseVariableTeam(exclusionTeamId) +
						Token(')')
				)
				break
			}
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.getActor') + Token(': ') },
			{ text: actor + Token(' = ') + words.join() }
		]
	},
	load: function ({
		variable = { type: 'local', key: '' },
		position = { type: 'absolute', x: 0, y: 0 },
		area = 'square',
		size = 1,
		radius = 0.5,
		selector = 'enemy',
		teamId = Data.teams.list[0].id,
		condition = 'nearest',
		attribute = Attribute.getDefAttributeId('actor', 'number'),
		divisor = Attribute.getDefAttributeId('actor', 'number'),
		activation = 'active',
		exclusion = 'none',
		exclusionActor = { type: 'trigger' },
		exclusionTeamId = Data.teams.list[0].id,
		active
	}) {
		// 补丁：2023-1-7
		selector = this.remapSelectorPatch(selector)
		activation = this.remapActivationPatch(activation, active)
		// 加载角色数值属性选项
		const attrItems = Attribute.getAttributeItems('actor', 'number')
		$('#getActor-attribute').loadItems(attrItems)
		$('#getActor-divisor').loadItems(attrItems)
		const write = getElementWriter('getActor')
		write('variable', variable)
		write('position', position)
		write('area', area)
		write('size', size)
		write('radius', radius)
		write('selector', selector)
		write('teamId', teamId)
		write('condition', condition)
		write('attribute', attribute)
		write('divisor', divisor)
		write('activation', activation)
		write('exclusion', exclusion)
		write('exclusionActor', exclusionActor)
		write('exclusionTeamId', exclusionTeamId)
		$('#getActor-variable').getFocus()
	},
	save: function () {
		const read = getElementReader('getActor')
		const variable = read('variable')
		if (VariableGetter.isNone(variable)) {
			return $('#getActor-variable').getFocus()
		}
		const position = read('position')
		const area = read('area')
		const size = read('size')
		const radius = read('radius')
		const selector = read('selector')
		const teamId = read('teamId')
		const condition = read('condition')
		const attribute = read('attribute')
		const divisor = read('divisor')
		const activation = read('activation')
		const exclusion = read('exclusion')
		const exclusionActor = read('exclusionActor')
		const exclusionTeamId = read('exclusionTeamId')
		let params1
		let params2
		let params3
		let params4
		switch (area) {
			case 'square':
				params1 = { variable, position, area, size }
				break
			case 'circle':
				params1 = { variable, position, area, radius }
				break
		}
		switch (selector) {
			case 'enemy':
			case 'friend':
			case 'team':
				params2 = { selector, teamId }
				break
			case 'any':
				params2 = { selector }
				break
		}
		switch (condition) {
			case 'nearest':
			case 'farthest':
			case 'random':
				params3 = { condition }
				break
			case 'min-attribute-value':
			case 'max-attribute-value':
				if (attribute === '') {
					return $('#getActor-attribute').getFocus()
				}
				params3 = { condition, attribute }
				break
			case 'min-attribute-ratio':
			case 'max-attribute-ratio':
				if (attribute === '') {
					return $('#getActor-attribute').getFocus()
				}
				if (divisor === '' || attribute === divisor) {
					return $('#getActor-divisor').getFocus()
				}
				params3 = { condition, attribute, divisor }
				break
		}
		switch (exclusion) {
			case 'none':
				params4 = { activation, exclusion }
				break
			case 'actor':
				params4 = { activation, exclusion, exclusionActor }
				break
			case 'team':
				params4 = { activation, exclusion, exclusionTeamId }
				break
		}
		Command.save({ ...params1, ...params2, ...params3, ...params4 })
	}
}

// 获取多个角色
Command.cases.getMultipleActors = {
	initialize: function () {
		$('#getMultipleActors-confirm').on('click', this.save)

		// 创建区域选项
		$('#getMultipleActors-area').loadItems([
			{ name: 'Rectangle', value: 'rectangle' },
			{ name: 'Circle', value: 'circle' }
		])

		// 设置区域关联元素
		$('#getMultipleActors-area')
			.enableHiddenMode()
			.relate([
				{
					case: 'rectangle',
					targets: [
						$('#getMultipleActors-width'),
						$('#getMultipleActors-height')
					]
				},
				{ case: 'circle', targets: [$('#getMultipleActors-radius')] }
			])

		// 创建选择器选项
		$('#getMultipleActors-selector').loadItems([
			{ name: 'Team Enemy', value: 'enemy' },
			{ name: 'Team Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Any', value: 'any' }
		])

		// 设置选择器关联元素
		$('#getMultipleActors-selector')
			.enableHiddenMode()
			.relate([
				{
					case: ['enemy', 'friend', 'team'],
					targets: [$('#getMultipleActors-teamId')]
				}
			])

		// 创建激活状态选项
		$('#getMultipleActors-activation').loadItems([
			{ name: 'Active', value: 'active' },
			{ name: 'Inactive', value: 'inactive' },
			{ name: 'Either', value: 'either' }
		])

		// 侦听窗口打开事件
		$('#getMultipleActors').on('open', function (event) {
			const items = Data.createTeamItems()
			$('#getMultipleActors-teamId').loadItems(items)
		})

		// 侦听窗口已关闭事件
		$('#getMultipleActors').on('closed', function (event) {
			$('#getMultipleActors-teamId').clear()
		})
	},
	parse: function ({
		variable,
		position,
		area,
		width,
		height,
		radius,
		selector,
		teamId,
		activation
	}) {
		const actors = Command.parseVariable(variable, 'object', true)
		const words = Command.words
			.push(Command.parsePosition(position))
			.push(Local.get('command.getMultipleActors.' + area))
		switch (area) {
			case 'rectangle':
				words.push(Command.parseVariableNumber(width, 't'))
				words.push(Command.parseVariableNumber(height, 't'))
				break
			case 'circle':
				words.push(Command.parseVariableNumber(radius, 't'))
				break
		}
		const selectorLabel = Command.parseActorSelector(selector)
		switch (selector) {
			case 'enemy':
			case 'friend':
			case 'team':
				words.push(
					selectorLabel +
						Token('(') +
						Command.parseVariableTeam(teamId) +
						Token(')')
				)
				break
			case 'any':
				words.push(selectorLabel)
				break
		}
		words.push(Local.get('command.getMultipleActors.' + activation))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.getMultipleActors') + Token(': ') },
			{ text: actors + Token(' = ') + words.join() }
		]
	},
	load: function ({
		variable = { type: 'local', key: '' },
		position = { type: 'absolute', x: 0, y: 0 },
		area = 'rectangle',
		width = 1,
		height = 1,
		radius = 0.5,
		selector = 'enemy',
		teamId = Data.teams.list[0].id,
		activation = 'active'
	}) {
		const write = getElementWriter('getMultipleActors')
		write('variable', variable)
		write('position', position)
		write('area', area)
		write('width', width)
		write('height', height)
		write('radius', radius)
		write('selector', selector)
		write('teamId', teamId)
		write('activation', activation)
		$('#getMultipleActors-variable').getFocus()
	},
	save: function () {
		const read = getElementReader('getMultipleActors')
		const variable = read('variable')
		if (VariableGetter.isNone(variable)) {
			return $('#getMultipleActors-variable').getFocus()
		}
		const position = read('position')
		const area = read('area')
		const width = read('width')
		const height = read('height')
		const radius = read('radius')
		const selector = read('selector')
		const teamId = read('teamId')
		const activation = read('activation')
		let params1
		let params2
		switch (area) {
			case 'rectangle':
				params1 = { variable, position, area, width, height }
				break
			case 'circle':
				params1 = { variable, position, area, radius }
				break
		}
		switch (selector) {
			case 'enemy':
			case 'friend':
			case 'team':
				params2 = { selector, teamId }
				break
			case 'any':
				params2 = { selector }
				break
		}
		Command.save({ ...params1, ...params2, activation })
	}
}

// 删除角色
Command.cases.deleteActor = {
	initialize: function () {
		$('#deleteActor-confirm').on('click', this.save)
	},
	parse: function ({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.deleteActor') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	load: function ({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('deleteActor')
		write('actor', actor)
		$('#deleteActor-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('deleteActor')
		const actor = read('actor')
		Command.save({ actor })
	}
}

// 设置玩家角色
Command.cases.setPlayerActor = {
	initialize: function () {
		$('#setPlayerActor-confirm').on('click', this.save)
	},
	parse: function ({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setPlayerActor') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	load: function ({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('setPlayerActor')
		write('actor', actor)
		$('#setPlayerActor-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setPlayerActor')
		const actor = read('actor')
		Command.save({ actor })
	}
}

// 设置队伍成员
Command.cases.setPartyMember = {
	initialize: function () {
		$('#setPartyMember-confirm').on('click', this.save)

		// 创建操作选项
		$('#setPartyMember-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' }
		])
	},
	parse: function ({ operation, actor }) {
		const words = Command.words
			.push(Local.get('command.setPartyMember.' + operation))
			.push(Command.parseActor(actor))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setPartyMember') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ operation = 'add', actor = { type: 'trigger' } }) {
		const write = getElementWriter('setPartyMember')
		write('operation', operation)
		write('actor', actor)
		$('#setPartyMember-operation').getFocus()
	},
	save: function () {
		const read = getElementReader('setPartyMember')
		const operation = read('operation')
		const actor = read('actor')
		Command.save({ operation, actor })
	}
}

// 改变通行区域
Command.cases.changePassableTerrain = {
	initialize: function () {
		$('#changePassableTerrain-confirm').on('click', this.save)
		$('#changePassableTerrain-passage').loadItems([
			{ name: 'Land', value: 'land' },
			{ name: 'Water', value: 'water' },
			{ name: 'Unrestricted', value: 'unrestricted' }
		])
	},
	parse: function ({ actor, passage }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.changePassableTerrain.' + passage))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changePassableTerrain') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ actor = { type: 'trigger' }, passage = 'land' }) {
		const write = getElementWriter('changePassableTerrain')
		write('actor', actor)
		write('passage', passage)
		$('#changePassableTerrain-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changePassableTerrain')
		const actor = read('actor')
		const passage = read('passage')
		Command.save({ actor, passage })
	}
}

// 改变角色队伍
Command.cases.changeActorTeam = {
	initialize: function () {
		$('#changeActorTeam-confirm').on('click', this.save)

		// 创建队伍选项 - 窗口打开事件
		$('#changeActorTeam').on('open', function (event) {
			$('#changeActorTeam-teamId').loadItems(Data.createTeamItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#changeActorTeam').on('closed', function (event) {
			$('#changeActorTeam-teamId').clear()
		})
	},
	parse: function ({ actor, teamId }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseTeam(teamId))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorTeam') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		teamId = Data.teams.list[0].id
	}) {
		const write = getElementWriter('changeActorTeam')
		write('actor', actor)
		write('teamId', teamId)
		$('#changeActorTeam-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeActorTeam')
		const actor = read('actor')
		const teamId = read('teamId')
		Command.save({ actor, teamId })
	}
}

// 改变角色状态
Command.cases.changeActorState = {
	initialize: function () {
		$('#changeActorState-confirm').on('click', this.save)

		// 创建操作选项
		$('#changeActorState-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Remove Instance', value: 'remove-instance' }
		])

		// 设置操作关联元素
		$('#changeActorState-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['add', 'remove'],
					targets: [$('#changeActorState-stateId')]
				},
				{
					case: 'remove-instance',
					targets: [$('#changeActorState-state')]
				}
			])
	},
	parseOperation: function (operation) {
		return Local.get('command.changeActorState.' + operation)
	},
	parse: function ({ actor, operation, stateId, state }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(this.parseOperation(operation))
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseFileName(stateId))
				break
			case 'remove-instance':
				words.push(Command.parseState(state))
				break
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorState') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		operation = 'add',
		stateId = '',
		state = { type: 'trigger' }
	}) {
		const write = getElementWriter('changeActorState')
		write('actor', actor)
		write('operation', operation)
		write('stateId', stateId)
		write('state', state)
		$('#changeActorState-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeActorState')
		const actor = read('actor')
		const operation = read('operation')
		switch (operation) {
			case 'add':
			case 'remove': {
				const stateId = read('stateId')
				if (stateId === '') {
					return $('#changeActorState-stateId').getFocus()
				}
				Command.save({ actor, operation, stateId })
				break
			}
			case 'remove-instance': {
				const state = read('state')
				Command.save({ actor, operation, state })
				break
			}
		}
	}
}

// 改变角色装备
Command.cases.changeActorEquipment = {
	initialize: function () {
		$('#changeActorEquipment-confirm').on('click', this.save)

		// 创建操作选项
		$('#changeActorEquipment-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Add Instance', value: 'add-instance' },
			{ name: 'Remove Instance', value: 'remove-instance' },
			{ name: 'Remove Slot', value: 'remove-slot' }
		])

		// 设置关联元素
		$('#changeActorEquipment-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'add',
					targets: [
						$('#changeActorEquipment-slot'),
						$('#changeActorEquipment-equipmentId')
					]
				},
				{
					case: 'remove',
					targets: [$('#changeActorEquipment-equipmentId')]
				},
				{
					case: 'add-instance',
					targets: [
						$('#changeActorEquipment-slot'),
						$('#changeActorEquipment-equipment')
					]
				},
				{
					case: 'remove-instance',
					targets: [$('#changeActorEquipment-equipment')]
				},
				{
					case: 'remove-slot',
					targets: [$('#changeActorEquipment-slot')]
				}
			])
	},
	parse: function ({ actor, operation, slot, equipmentId, equipment }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.changeActorEquipment.' + operation))
		switch (operation) {
			case 'add': {
				const equipSlot = Command.parseVariableEnum(
					'equipment-slot',
					slot
				)
				const equipName = Command.parseFileName(equipmentId)
				words.push(equipSlot + Token(' = ') + equipName)
				break
			}
			case 'remove':
				words.push(Command.parseFileName(equipmentId))
				break
			case 'add-instance': {
				const equipSlot = Command.parseVariableEnum(
					'equipment-slot',
					slot
				)
				const equipName = Command.parseEquipment(equipment)
				words.push(equipSlot + Token(' = ') + equipName)
				break
			}
			case 'remove-instance':
				words.push(Command.parseEquipment(equipment))
				break
			case 'remove-slot':
				words.push(Command.parseVariableEnum('equipment-slot', slot))
				break
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorEquipment') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		operation = 'add',
		slot = Enum.getDefStringId('equipment-slot'),
		equipmentId = '',
		equipment = { type: 'trigger' }
	}) {
		// 加载装备选项
		$('#changeActorEquipment-slot').loadItems(
			Enum.getStringItems('equipment-slot')
		)
		const write = getElementWriter('changeActorEquipment')
		write('actor', actor)
		write('operation', operation)
		write('slot', slot)
		write('equipmentId', equipmentId)
		write('equipment', equipment)
		$('#changeActorEquipment-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeActorEquipment')
		const actor = read('actor')
		const operation = read('operation')
		switch (operation) {
			case 'add': {
				const slot = read('slot')
				if (slot === '') {
					return $('#changeActorEquipment-slot').getFocus()
				}
				const equipmentId = read('equipmentId')
				if (equipmentId === '') {
					return $('#changeActorEquipment-equipmentId').getFocus()
				}
				Command.save({ actor, operation, slot, equipmentId })
				break
			}
			case 'remove': {
				const equipmentId = read('equipmentId')
				if (equipmentId === '') {
					return $('#changeActorEquipment-equipmentId').getFocus()
				}
				Command.save({ actor, operation, equipmentId })
				break
			}
			case 'add-instance': {
				const slot = read('slot')
				if (slot === '') {
					return $('#changeActorEquipment-slot').getFocus()
				}
				const equipment = read('equipment')
				Command.save({ actor, operation, slot, equipment })
				break
			}
			case 'remove-instance': {
				const equipment = read('equipment')
				Command.save({ actor, operation, equipment })
				break
			}
			case 'remove-slot':
				const slot = read('slot')
				if (slot === '') {
					return $('#changeActorEquipment-slot').getFocus()
				}
				Command.save({ actor, operation, slot })
				break
		}
	}
}

// 改变角色技能
Command.cases.changeActorSkill = {
	initialize: function () {
		$('#changeActorSkill-confirm').on('click', this.save)

		// 创建操作选项
		$('#changeActorSkill-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Remove Instance', value: 'remove-instance' },
			{ name: 'Sort by Filename', value: 'sort-by-order' }
		])

		// 设置关联元素
		$('#changeActorSkill-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['add', 'remove'],
					targets: [$('#changeActorSkill-skillId')]
				},
				{
					case: 'remove-instance',
					targets: [$('#changeActorSkill-skill')]
				}
			])
	},
	parseOperation: function (operation) {
		return Local.get('command.changeActorSkill.' + operation)
	},
	parse: function ({ actor, operation, skill, skillId }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(this.parseOperation(operation))
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseVariableFile(skillId))
				break
			case 'remove-instance':
				words.push(Command.parseSkill(skill))
				break
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorSkill') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		operation = 'add',
		skillId = '',
		skill = { type: 'trigger' }
	}) {
		const write = getElementWriter('changeActorSkill')
		write('actor', actor)
		write('operation', operation)
		write('skillId', skillId)
		write('skill', skill)
		$('#changeActorSkill-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeActorSkill')
		const actor = read('actor')
		const operation = read('operation')
		switch (operation) {
			case 'add':
			case 'remove': {
				const skillId = read('skillId')
				if (skillId === '') {
					return $('#changeActorSkill-skillId').getFocus()
				}
				Command.save({ actor, operation, skillId })
				break
			}
			case 'remove-instance': {
				const skill = read('skill')
				Command.save({ actor, operation, skill })
				break
			}
			case 'sort-by-order':
				Command.save({ actor, operation })
				break
		}
	}
}

// 改变角色头像
Command.cases.changeActorPortrait = {
	initialize: function () {
		$('#changeActorPortrait-confirm').on('click', this.save)

		// 创建模式选项
		$('#changeActorPortrait-mode').loadItems([
			{ name: 'Full Mode', value: 'full' },
			{ name: 'Image Mode', value: 'portrait' },
			{ name: 'Clip Mode', value: 'clip' }
		])

		// 设置模式关联元素
		$('#changeActorPortrait-mode')
			.enableHiddenMode()
			.relate([
				{
					case: 'full',
					targets: [
						$('#changeActorPortrait-portrait'),
						$('#changeActorPortrait-clip')
					]
				},
				{
					case: 'portrait',
					targets: [$('#changeActorPortrait-portrait')]
				},
				{ case: 'clip', targets: [$('#changeActorPortrait-clip')] }
			])
	},
	parsePortraitClip: function (clip) {
		const label = Local.get('command.changeActorPortrait.clip')
		const x = Command.setNumberColor(clip[0])
		const y = Command.setNumberColor(clip[1])
		const width = Command.setNumberColor(clip[2])
		const height = Command.setNumberColor(clip[3])
		return (
			label +
			Token('(') +
			x +
			Token(', ') +
			y +
			Token(', ') +
			width +
			Token(', ') +
			height +
			Token(')')
		)
	},
	parse: function ({ actor, mode, portrait, clip }) {
		const words = Command.words.push(Command.parseActor(actor))
		switch (mode) {
			case 'full':
				words
					.push(Command.parseFileName(portrait))
					.push(this.parsePortraitClip(clip))
				break
			case 'portrait':
				words.push(Command.parseFileName(portrait))
				break
			case 'clip':
				words.push(this.parsePortraitClip(clip))
				break
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorPortrait') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		mode = 'full',
		portrait = '',
		clip = [0, 0, 64, 64]
	}) {
		const write = getElementWriter('changeActorPortrait')
		write('actor', actor)
		write('mode', mode)
		write('portrait', portrait)
		write('clip', clip)
		$('#changeActorPortrait-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeActorPortrait')
		const actor = read('actor')
		const mode = read('mode')
		const portrait = read('portrait')
		const clip = read('clip')
		switch (mode) {
			case 'full':
				return Command.save({ actor, mode, portrait, clip })
			case 'portrait':
				return Command.save({ actor, mode, portrait })
			case 'clip':
				return Command.save({ actor, mode, clip })
		}
	}
}

// 改变角色动画
Command.cases.changeActorAnimation = {
	initialize: function () {
		$('#changeActorAnimation-confirm').on('click', this.save)
	},
	parse: function ({ actor, animationId }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorAnimation') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ actor = { type: 'trigger' }, animationId = '' }) {
		const write = getElementWriter('changeActorAnimation')
		write('actor', actor)
		write('animationId', animationId)
		$('#changeActorAnimation-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeActorAnimation')
		const actor = read('actor')
		const animationId = read('animationId')
		if (animationId === '') {
			return $('#changeActorAnimation-animationId').getFocus()
		}
		Command.save({ actor, animationId })
	}
}

// 改变角色精灵图
Command.cases.changeActorSprite = {
	initialize: function () {
		$('#changeActorSprite-confirm').on('click', this.save)

		// 侦听事件
		$('#changeActorSprite-animationId').on('write', (event) => {
			const items = Animation.getSpriteListItems(event.value)
			const elSpriteId = $('#changeActorSprite-spriteId')
			elSpriteId.loadItems(items)
			elSpriteId.write(elSpriteId.read())
		})
	},
	parse: function ({ actor, animationId, spriteId, image }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId))
			.push(Command.parseSpriteName(animationId, spriteId))
			.push(Command.parseFileName(image))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorSprite') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		animationId = '',
		spriteId = '',
		image = ''
	}) {
		const write = getElementWriter('changeActorSprite')
		write('actor', actor)
		write('animationId', animationId)
		write('spriteId', spriteId)
		write('image', image)
		$('#changeActorSprite-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeActorSprite')
		const actor = read('actor')
		const animationId = read('animationId')
		if (animationId === '') {
			return $('#changeActorSprite-animationId').getFocus()
		}
		const spriteId = read('spriteId')
		if (spriteId === '') {
			return $('#changeActorSprite-spriteId').getFocus()
		}
		const image = read('image')
		Command.save({ actor, animationId, spriteId, image })
	}
}

// 改变角色动作
Command.cases.changeActorMotion = {
	initialize: function () {
		$('#changeActorMotion-confirm').on('click', this.save)

		// 创建动作类型选项
		$('#changeActorMotion-type').loadItems([
			{ name: 'Idle', value: 'idle' },
			{ name: 'Move', value: 'move' }
		])
	},
	parseMapping: function (type, motion) {
		const motionType = Local.get('command.changeActorMotion.type.' + type)
		const motionName = Command.parseEnumString(motion)
		return motionType + Token(' -> ') + motionName
	},
	parse: function ({ actor, type, motion }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(this.parseMapping(type, motion))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorMotion') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		type = 'move',
		motion = ''
	}) {
		const write = getElementWriter('changeActorMotion')
		write('actor', actor)
		write('type', type)
		write('motion', motion)
		$('#changeActorMotion-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeActorMotion')
		const actor = read('actor')
		const type = read('type')
		const motion = read('motion')
		if (motion === '') {
			return $('#changeActorMotion-motion').getFocus()
		}
		Command.save({ actor, type, motion })
	}
}

// 播放角色动画
Command.cases.playActorAnimation = {
	initialize: function () {
		$('#playActorAnimation-confirm').on('click', this.save)

		// 创建等待结束选项
		$('#playActorAnimation-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
	},
	parseSpeed: function (speed) {
		if (speed === 1) return ''
		return Command.parseVariableNumber(speed)
	},
	parse: function ({ actor, motion, speed, wait }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseEnumString(motion))
			.push(this.parseSpeed(speed))
			.push(Command.parseWait(wait))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.playActorAnimation') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		motion = '',
		speed = 1,
		wait = false
	}) {
		const write = getElementWriter('playActorAnimation')
		write('actor', actor)
		write('motion', motion)
		write('speed', speed)
		write('wait', wait)
		$('#playActorAnimation-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('playActorAnimation')
		const actor = read('actor')
		const motion = read('motion').trim()
		const speed = read('speed')
		const wait = read('wait')
		if (!motion) {
			return $('#playActorAnimation-motion').getFocus()
		}
		Command.save({ actor, motion, speed, wait })
	}
}

// 停止角色动画
Command.cases.stopActorAnimation = {
	initialize: function () {
		$('#stopActorAnimation-confirm').on('click', this.save)
	},
	parse: function ({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.stopActorAnimation') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	load: function ({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('stopActorAnimation')
		write('actor', actor)
		$('#stopActorAnimation-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('stopActorAnimation')
		const actor = read('actor')
		Command.save({ actor })
	}
}

// 添加动画组件
Command.cases.addAnimationComponent = {
	initialize: function () {
		$('#addAnimationComponent-confirm').on('click', this.save)

		// 创建可旋转选项
		$('#addAnimationComponent-rotatable').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建同步角度选项
		$('#addAnimationComponent-syncAngle').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 侦听动画ID写入事件
		$('#addAnimationComponent-animationId').on('write', (event) => {
			const elMotion = $('#addAnimationComponent-motion')
			elMotion.loadItems(Animation.getMotionListItems(event.value))
			elMotion.write2(elMotion.read())
		})
	},
	parseRotatable: function (rotatable) {
		return rotatable
			? Local.get('command.addAnimationComponent.rotatable')
			: ''
	},
	parseSyncAngle: function (syncAngle) {
		return syncAngle
			? Local.get('command.addAnimationComponent.syncAngle')
			: ''
	},
	parsePriority: function (priority) {
		if (priority === 0) return ''
		const abs = Command.setNumberColor(Math.abs(priority))
		return priority > 0 ? Token('+') + abs : Token('-') + abs
	},
	parseOffsetY: function (offsetY) {
		if (offsetY === 0) return ''
		const abs = Command.setNumberColor(Math.abs(offsetY)) + 'px'
		return offsetY > 0 ? abs : Token('-') + abs
	},
	parse: function ({
		actor,
		animationId,
		motion,
		rotatable,
		syncAngle,
		priority,
		offsetY
	}) {
		syncAngle = syncAngle ?? false // 补丁
		offsetY = offsetY ?? 0 // 补丁
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId))
			.push(Command.parseEnumString(motion))
			.push(this.parseRotatable(rotatable))
			.push(this.parseSyncAngle(syncAngle))
			.push(this.parsePriority(priority))
			.push(this.parseOffsetY(offsetY))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.addAnimationComponent') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		animationId = '',
		motion = '',
		rotatable = false,
		syncAngle = false,
		priority = 0,
		offsetY = 0
	}) {
		const write = getElementWriter('addAnimationComponent')
		write('actor', actor)
		write('animationId', animationId)
		write('motion', motion)
		write('rotatable', rotatable)
		write('syncAngle', syncAngle)
		write('priority', priority)
		write('offsetY', offsetY)
		$('#addAnimationComponent-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('addAnimationComponent')
		const actor = read('actor')
		const animationId = read('animationId')
		if (animationId === '') {
			return $('#addAnimationComponent-animationId').getFocus()
		}
		const motion = read('motion')
		if (motion === '') {
			return $('#addAnimationComponent-motion').getFocus()
		}
		const rotatable = read('rotatable')
		const syncAngle = read('syncAngle')
		const priority = read('priority')
		const offsetY = read('offsetY')
		Command.save({
			actor,
			animationId,
			motion,
			rotatable,
			syncAngle,
			priority,
			offsetY
		})
	}
}

// 设置动画组件
Command.cases.setAnimationComponent = {
	initialize: function () {
		$('#setAnimationComponent-confirm').on('click', this.save)

		// 创建操作选项
		;($('#setAnimationComponent-operation').loadItems([
			{ name: 'Set Angle', value: 'set-angle' },
			{ name: 'Set Scale', value: 'set-scale' },
			{ name: 'Set Speed', value: 'set-speed' },
			{ name: 'Set Opacity', value: 'set-opacity' },
			{ name: 'Set Priority', value: 'set-priority' },
			{ name: 'Set Offset Y', value: 'set-offsetY' },
			{ name: 'Set Sprite', value: 'set-sprite' },
			{ name: 'Play Motion', value: 'play-motion' },
			{ name: 'Stop Motion', value: 'stop-motion' }
		]),
			// 关联操作相关元素
			$('#setAnimationComponent-operation')
				.enableHiddenMode()
				.relate([
					{
						case: 'set-angle',
						targets: [$('#setAnimationComponent-angle')]
					},
					{
						case: 'set-scale',
						targets: [$('#setAnimationComponent-scale')]
					},
					{
						case: 'set-speed',
						targets: [$('#setAnimationComponent-speed')]
					},
					{
						case: 'set-opacity',
						targets: [$('#setAnimationComponent-opacity')]
					},
					{
						case: 'set-priority',
						targets: [$('#setAnimationComponent-priority')]
					},
					{
						case: 'set-offsetY',
						targets: [$('#setAnimationComponent-offsetY')]
					},
					{
						case: 'set-sprite',
						targets: [
							$('#setAnimationComponent-spriteId'),
							$('#setAnimationComponent-image')
						]
					},
					{
						case: 'play-motion',
						targets: [
							$('#setAnimationComponent-playMotion'),
							$('#setAnimationComponent-wait')
						]
					}
				]))

		// 创建等待选项
		$('#setAnimationComponent-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 侦听动画ID写入事件
		$('#setAnimationComponent-animationId').on('write', (event) => {
			const elMotion = $('#setAnimationComponent-motion')
			const elPlayMotion = $('#setAnimationComponent-playMotion')
			const elSpriteId = $('#setAnimationComponent-spriteId')
			const motionItems = Animation.getMotionListItems(event.value)
			const spriteItems = Animation.getSpriteListItems(event.value)
			elMotion.loadItems(motionItems)
			elPlayMotion.loadItems(motionItems)
			elSpriteId.loadItems(spriteItems)
			elMotion.write2(elMotion.read())
			elPlayMotion.write2(elPlayMotion.read())
			elSpriteId.write2(elSpriteId.read())
		})
	},
	parsePriority: function (priority) {
		const abs = Command.setNumberColor(Math.abs(priority))
		return priority === 0
			? abs
			: priority > 0
				? Token('+') + abs
				: Token('-') + abs
	},
	parseOffsetY: function (offsetY) {
		const abs = Command.setNumberColor(Math.abs(offsetY)) + 'px'
		return offsetY >= 0 ? abs : Token('-') + abs
	},
	parse: function ({
		actor,
		animationId,
		motion,
		operation,
		angle,
		scale,
		speed,
		opacity,
		priority,
		offsetY,
		spriteId,
		image,
		playMotion,
		wait
	}) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId))
			.push(Command.parseEnumString(motion))
			.push(Local.get('command.setAnimationComponent.' + operation))
		switch (operation) {
			case 'set-angle':
				words.push(Command.parseAngle(angle))
				break
			case 'set-scale':
				words.push(Command.parseVariableNumber(scale))
				break
			case 'set-speed':
				words.push(Command.parseVariableNumber(speed))
				break
			case 'set-opacity':
				words.push(Command.parseVariableNumber(opacity))
				break
			case 'set-priority':
				words.push(this.parsePriority(priority))
				break
			case 'set-offsetY':
				words.push(this.parseOffsetY(offsetY))
				break
			case 'set-sprite':
				words.push(Command.parseSpriteName(animationId, spriteId))
				words.push(Command.parseFileName(image))
				break
			case 'play-motion':
				words.push(Command.parseEnumString(playMotion))
				words.push(Command.parseWait(wait))
				break
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setAnimationComponent') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		animationId = '',
		motion = '',
		operation = 'set-angle',
		angle = { type: 'absolute', degrees: 0 },
		scale = 1,
		speed = 1,
		opacity = 1,
		priority = 0,
		offsetY = 0,
		spriteId = '',
		image = '',
		playMotion = '',
		wait = false
	}) {
		var write = getElementWriter('setAnimationComponent')
		write('actor', actor)
		write('animationId', animationId)
		write('motion', motion)
		write('operation', operation)
		write('angle', angle)
		write('scale', scale)
		write('speed', speed)
		write('opacity', opacity)
		write('priority', priority)
		write('offsetY', offsetY)
		write('spriteId', spriteId)
		write('image', image)
		write('wait', wait)
		if (playMotion) write('playMotion', playMotion)
		$('#setAnimationComponent-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setAnimationComponent')
		const actor = read('actor')
		const animationId = read('animationId')
		if (animationId === '') {
			return $('#setAnimationComponent-animationId').getFocus()
		}
		const motion = read('motion')
		if (motion === '') {
			return $('#setAnimationComponent-motion').getFocus()
		}
		const operation = read('operation')
		switch (operation) {
			case 'set-angle': {
				const angle = read('angle')
				Command.save({ actor, animationId, motion, operation, angle })
				break
			}
			case 'set-scale': {
				const scale = read('scale')
				Command.save({ actor, animationId, motion, operation, scale })
				break
			}
			case 'set-speed': {
				const speed = read('speed')
				Command.save({ actor, animationId, motion, operation, speed })
				break
			}
			case 'set-opacity': {
				const opacity = read('opacity')
				Command.save({ actor, animationId, motion, operation, opacity })
				break
			}
			case 'set-priority': {
				const priority = read('priority')
				Command.save({
					actor,
					animationId,
					motion,
					operation,
					priority
				})
				break
			}
			case 'set-offsetY':
				const offsetY = read('offsetY')
				Command.save({ actor, animationId, motion, operation, offsetY })
				break
			case 'set-sprite': {
				const spriteId = read('spriteId')
				const image = read('image')
				if (spriteId === '') {
					return $('#setAnimationComponent-spriteId').getFocus()
				}
				Command.save({
					actor,
					animationId,
					motion,
					operation,
					spriteId,
					image
				})
				break
			}
			case 'play-motion': {
				const playMotion = read('playMotion')
				if (playMotion === '') {
					return $('#setAnimationComponent-playMotion').getFocus()
				}
				const wait = read('wait')
				Command.save({
					actor,
					animationId,
					motion,
					operation,
					playMotion,
					wait
				})
				break
			}
			case 'stop-motion':
				Command.save({ actor, animationId, motion, operation })
				break
		}
	}
}

// 移除动画组件
Command.cases.removeAnimationComponent = {
	initialize: function () {
		$('#removeAnimationComponent-confirm').on('click', this.save)

		// 侦听动画ID写入事件
		$('#removeAnimationComponent-animationId').on('write', (event) => {
			const elMotion = $('#removeAnimationComponent-motion')
			elMotion.loadItems(Animation.getMotionListItems(event.value))
			elMotion.write2(elMotion.read())
		})
	},
	parse: function ({ actor, animationId, motion }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId))
			.push(Command.parseEnumString(motion))
		return [
			{ color: 'actor' },
			{
				text:
					Local.get('command.removeAnimationComponent') + Token(': ')
			},
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		animationId = '',
		motion = ''
	}) {
		var write = getElementWriter('removeAnimationComponent')
		write('actor', actor)
		write('animationId', animationId)
		write('motion', motion)
		$('#removeAnimationComponent-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('removeAnimationComponent')
		const actor = read('actor')
		const animationId = read('animationId')
		const motion = read('motion')
		if (animationId === '') {
			return $('#removeAnimationComponent-animationId').getFocus()
		}
		if (motion === '') {
			return $('#removeAnimationComponent-motion').getFocus()
		}
		Command.save({ actor, animationId, motion })
	}
}

// 创建全局角色
Command.cases.createGlobalActor = {
	initialize: function () {
		$('#createGlobalActor-confirm').on('click', this.save)

		// 创建队伍选项 - 窗口打开事件
		$('#createGlobalActor').on('open', function (event) {
			$('#createGlobalActor-teamId').loadItems(Data.createTeamItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#createGlobalActor').on('closed', function (event) {
			$('#createGlobalActor-teamId').clear()
		})
	},
	parse: function ({ actorId, teamId }) {
		const words = Command.words
			.push(Command.parseFileName(actorId))
			.push(Command.parseTeam(teamId))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.createGlobalActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ actorId = '', teamId = Data.teams.list[0].id }) {
		const write = getElementWriter('createGlobalActor')
		write('actorId', actorId)
		write('teamId', teamId)
		$('#createGlobalActor-actorId').getFocus()
	},
	save: function () {
		const read = getElementReader('createGlobalActor')
		const actorId = read('actorId')
		if (actorId === '') {
			return $('#createGlobalActor-actorId').getFocus()
		}
		const teamId = read('teamId')
		Command.save({ actorId, teamId })
	}
}

// 转移全局角色
Command.cases.transferGlobalActor = {
	initialize: function () {
		$('#transferGlobalActor-confirm').on('click', this.save)
	},
	parse: function ({ actor, position }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parsePosition(position))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.transferGlobalActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		position = { type: 'absolute', x: 0, y: 0 }
	}) {
		const write = getElementWriter('transferGlobalActor')
		write('actor', actor)
		write('position', position)
		$('#transferGlobalActor-actor').getFocus('all')
	},
	save: function () {
		const read = getElementReader('transferGlobalActor')
		const actor = read('actor')
		const position = read('position')
		Command.save({ actor, position })
	}
}

// 删除全局角色
Command.cases.deleteGlobalActor = {
	initialize: function () {
		$('#deleteGlobalActor-confirm').on('click', this.save)
	},
	parse: function ({ actorId }) {
		const words = Command.words.push(Command.parseFileName(actorId))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.deleteGlobalActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ actorId = '' }) {
		const write = getElementWriter('deleteGlobalActor')
		write('actorId', actorId)
		$('#deleteGlobalActor-actorId').getFocus()
	},
	save: function () {
		const read = getElementReader('deleteGlobalActor')
		const actorId = read('actorId')
		if (actorId === '') {
			return $('#deleteGlobalActor-actorId').getFocus()
		}
		Command.save({ actorId })
	}
}

// 设置目标
Command.cases.setTarget = {
	initialize: function () {
		$('#setTarget-confirm').on('click', this.save)
	},
	parse: function ({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setTarget') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	load: function ({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('setTarget')
		write('actor', actor)
		$('#setTarget-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setTarget')
		const actor = read('actor')
		Command.save({ actor })
	}
}

// 获取目标
Command.cases.getTarget = {
	initialize: function () {
		$('#getTarget-confirm').on('click', this.save)

		// 创建选择器选项
		$('#getTarget-selector').loadItems([
			{ name: 'Enemy', value: 'enemy' },
			{ name: 'Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Team Member Except Self', value: 'team-except-self' },
			{ name: 'Any Except Self', value: 'any-except-self' },
			{ name: 'Any', value: 'any' }
		])

		// 创建条件选项
		$('#getTarget-condition').loadItems([
			{ name: 'Max Threat', value: 'max-threat' },
			{ name: 'Nearest', value: 'nearest' },
			{ name: 'Farthest', value: 'farthest' },
			{ name: 'Min Attribute Value', value: 'min-attribute-value' },
			{ name: 'Max Attribute Value', value: 'max-attribute-value' },
			{ name: 'Min Attribute Ratio', value: 'min-attribute-ratio' },
			{ name: 'Max Attribute Ratio', value: 'max-attribute-ratio' },
			{ name: 'Random', value: 'random' }
		])

		// 设置条件关联元素
		$('#getTarget-condition')
			.enableHiddenMode()
			.relate([
				{
					case: ['min-attribute-value', 'max-attribute-value'],
					targets: [$('#getTarget-attribute')]
				},
				{
					case: ['min-attribute-ratio', 'max-attribute-ratio'],
					targets: [
						$('#getTarget-attribute'),
						$('#getTarget-divisor')
					]
				}
			])
	},
	parseCondition: function (condition, attribute, divisor) {
		const label = Local.get('command.getTarget.condition.' + condition)
		switch (condition) {
			case 'max-threat':
			case 'nearest':
			case 'farthest':
			case 'random':
				return label
			case 'min-attribute-value':
			case 'max-attribute-value':
				return (
					label +
					Token('(') +
					Command.parseAttributeKey('actor', attribute) +
					Token(')')
				)
			case 'min-attribute-ratio':
			case 'max-attribute-ratio':
				return (
					label +
					Token('(') +
					Command.parseAttributeKey('actor', attribute) +
					Token(' / ') +
					Command.parseAttributeKey('actor', divisor) +
					Token(')')
				)
		}
	},
	parse: function ({ actor, selector, condition, attribute, divisor }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActorSelector(selector))
			.push(this.parseCondition(condition, attribute, divisor))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.getTarget') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		selector = 'enemy',
		condition = 'max-threat',
		attribute = Attribute.getDefAttributeId('actor', 'number'),
		divisor = Attribute.getDefAttributeId('actor', 'number')
	}) {
		// 加载角色数值属性选项
		const attrItems = Attribute.getAttributeItems('actor', 'number')
		$('#getTarget-attribute').loadItems(attrItems)
		$('#getTarget-divisor').loadItems(attrItems)
		const write = getElementWriter('getTarget')
		write('actor', actor)
		write('selector', selector)
		write('condition', condition)
		write('attribute', attribute)
		write('divisor', divisor)
		$('#getTarget-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('getTarget')
		const actor = read('actor')
		const selector = read('selector')
		const condition = read('condition')
		switch (condition) {
			case 'max-threat':
			case 'nearest':
			case 'farthest':
			case 'random':
				Command.save({ actor, selector, condition })
				break
			case 'min-attribute-value':
			case 'max-attribute-value': {
				const attribute = read('attribute')
				if (attribute === '') {
					return $('#getTarget-attribute').getFocus()
				}
				Command.save({ actor, selector, condition, attribute })
				break
			}
			case 'min-attribute-ratio':
			case 'max-attribute-ratio': {
				const attribute = read('attribute')
				const divisor = read('divisor')
				if (attribute === '') {
					return $('#getTarget-attribute').getFocus()
				}
				if (divisor === '') {
					return $('#getTarget-divisor').getFocus()
				}
				Command.save({ actor, selector, condition, attribute, divisor })
				break
			}
		}
	}
}

// 添加目标
Command.cases.appendTarget = {
	initialize: function () {
		$('#appendTarget-confirm').on('click', this.save)
	},
	parse: function ({ actor, target }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActor(target))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.appendTarget') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		target = { type: 'trigger' }
	}) {
		const write = getElementWriter('appendTarget')
		write('actor', actor)
		write('target', target)
		$('#appendTarget-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('appendTarget')
		const actor = read('actor')
		const target = read('target')
		Command.save({ actor, target })
	}
}

// 移除目标
Command.cases.removeTarget = {
	initialize: function () {
		$('#removeTarget-confirm').on('click', this.save)
	},
	parse: function ({ actor, target }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActor(target))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.removeTarget') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		target = { type: 'trigger' }
	}) {
		const write = getElementWriter('removeTarget')
		write('actor', actor)
		write('target', target)
		$('#removeTarget-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('removeTarget')
		const actor = read('actor')
		const target = read('target')
		Command.save({ actor, target })
	}
}

// 探测目标
Command.cases.detectTargets = {
	initialize: function () {
		$('#detectTargets-confirm').on('click', this.save)

		// 创建选择器选项
		$('#detectTargets-selector').loadItems([
			{ name: 'Enemy', value: 'enemy' },
			{ name: 'Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Team Member Except Self', value: 'team-except-self' },
			{ name: 'Any Except Self', value: 'any-except-self' },
			{ name: 'Any', value: 'any' }
		])

		// 创建视线判断选项
		$('#detectTargets-inSight').loadItems([
			{ name: 'Enabled', value: true },
			{ name: 'Disabled', value: false }
		])
	},
	parseInSight: function (inSight) {
		switch (inSight) {
			case true:
				return Local.get('command.detectTargets.inSight')
			case false:
				return ''
		}
	},
	parse: function ({ actor, distance, selector, inSight }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Token('≤') + Command.parseVariableNumber(distance, 't'))
			.push(Command.parseActorSelector(selector))
			.push(this.parseInSight(inSight))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.detectTargets') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		distance = 0,
		selector = 'enemy',
		inSight = false
	}) {
		const write = getElementWriter('detectTargets')
		write('actor', actor)
		write('distance', distance)
		write('selector', selector)
		write('inSight', inSight)
		$('#detectTargets-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('detectTargets')
		const actor = read('actor')
		const distance = read('distance')
		const selector = read('selector')
		const inSight = read('inSight')
		if (distance === 0) {
			return $('#detectTargets-distance').getFocus('all')
		}
		Command.save({ actor, distance, selector, inSight })
	}
}

// 放弃目标
Command.cases.discardTargets = {
	initialize: function () {
		$('#discardTargets-confirm').on('click', this.save)

		// 创建选择器选项
		$('#discardTargets-selector').loadItems([
			{ name: 'Enemy', value: 'enemy' },
			{ name: 'Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Team Member Except Self', value: 'team-except-self' },
			{ name: 'Any Except Self', value: 'any-except-self' },
			{ name: 'Any', value: 'any' }
		])
	},
	parse: function ({ actor, selector, distance }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActorSelector(selector))
		if (distance !== 0) {
			words.push(Token('>=') + Command.parseVariableNumber(distance, 't'))
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.discardTargets') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		selector = 'any',
		distance = 0
	}) {
		const write = getElementWriter('discardTargets')
		write('actor', actor)
		write('selector', selector)
		write('distance', distance)
		$('#discardTargets-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('discardTargets')
		const actor = read('actor')
		const selector = read('selector')
		const distance = read('distance')
		Command.save({ actor, selector, distance })
	}
}

// 重置目标列表
Command.cases.resetTargets = {
	initialize: function () {
		$('#resetTargets-confirm').on('click', this.save)
	},
	parse: function ({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.resetTargets') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	load: function ({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('resetTargets')
		write('actor', actor)
		$('#resetTargets-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('resetTargets')
		const actor = read('actor')
		Command.save({ actor })
	}
}

// 渲染轮廓
Command.cases.renderOutline = {
	initialize: function () {
		$('#renderOutline-confirm').on('click', this.save)

		// 创建操作选项
		$('#renderOutline-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Reset', value: 'reset' }
		])

		// 设置操作关联元素
		$('#renderOutline-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'add',
					targets: [
						$('#renderOutline-actor'),
						$('#renderOutline-color')
					]
				},
				{ case: 'remove', targets: [$('#renderOutline-actor')] }
			])
	},
	parse: function ({ operation, actor, color }) {
		const label = Local.get('command.renderOutline.' + operation)
		const words = Command.words
		switch (operation) {
			case 'add':
				words
					.push(label)
					.push(Command.parseActor(actor))
					.push(Command.parseHexColor(Color.simplifyHexColor(color)))
				break
			case 'remove':
				words.push(label).push(Command.parseActor(actor))
				break
			case 'reset':
				words.push(label)
				break
		}
		return [
			{ color: 'flow' },
			{ text: Local.get('command.renderOutline') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		operation = 'add',
		actor = { type: 'trigger' },
		color = 'ffffffff'
	}) {
		$('#renderOutline-operation').write(operation)
		$('#renderOutline-actor').write(actor)
		$('#renderOutline-color').write(color)
		$('#renderOutline-operation').getFocus()
	},
	save: function () {
		const operation = $('#renderOutline-operation').read()
		switch (operation) {
			case 'add': {
				const actor = $('#renderOutline-actor').read()
				const color = $('#renderOutline-color').read()
				Command.save({ operation, actor, color })
				break
			}
			case 'remove': {
				const actor = $('#renderOutline-actor').read()
				Command.save({ operation, actor })
				break
			}
			case 'reset':
				Command.save({ operation })
				break
		}
	}
}

// 施放技能
Command.cases.castSkill = {
	initialize: function () {
		$('#castSkill-confirm').on('click', this.save)

		// 创建模式选项
		$('#castSkill-mode').loadItems([
			{ name: 'By Shortcut Key', value: 'by-key' },
			{ name: 'By Skill ID', value: 'by-id' },
			{ name: 'By Skill Instance', value: 'by-skill' }
		])

		// 设置模式关联元素
		$('#castSkill-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'by-key', targets: [$('#castSkill-key')] },
				{ case: 'by-id', targets: [$('#castSkill-skillId')] },
				{ case: 'by-skill', targets: [$('#castSkill-skill')] }
			])

		// 创建等待结束选项
		$('#castSkill-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
	},
	parse: function ({ actor, mode, key, skillId, skill, wait }) {
		const words = Command.words.push(Command.parseActor(actor))
		switch (mode) {
			case 'by-key':
				words.push(Command.parseGroupEnumString('shortcut-key', key))
				break
			case 'by-id':
				words.push(Command.parseFileName(skillId))
				break
			case 'by-skill':
				words.push(Command.parseSkill(skill))
				break
		}
		words.push(Command.parseWait(wait))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.castSkill') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		mode = 'by-key',
		key = Enum.getDefStringId('shortcut-key'),
		skillId = '',
		skill = { type: 'trigger' },
		wait = false
	}) {
		// 加载快捷键选项
		$('#castSkill-key').loadItems(Enum.getStringItems('shortcut-key'))
		const write = getElementWriter('castSkill')
		write('actor', actor)
		write('mode', mode)
		write('key', key)
		write('skillId', skillId)
		write('skill', skill)
		write('wait', wait)
		$('#castSkill-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('castSkill')
		const actor = read('actor')
		const mode = read('mode')
		const wait = read('wait')
		switch (mode) {
			case 'by-key': {
				const key = read('key')
				if (key === '') {
					return $('#castSkill-key').getFocus()
				}
				Command.save({ actor, mode, key, wait })
				break
			}
			case 'by-id': {
				const skillId = read('skillId')
				if (skillId === '') {
					return $('#castSkill-skillId').getFocus()
				}
				Command.save({ actor, mode, skillId, wait })
				break
			}
			case 'by-skill': {
				const skill = read('skill')
				Command.save({ actor, mode, skill, wait })
				break
			}
		}
	}
}

// 设置技能
Command.cases.setSkill = {
	initialize: function () {
		$('#setSkill-confirm').on('click', this.save)

		// 创建操作选项
		$('#setSkill-operation').loadItems([
			{ name: 'Set Cooldown Time', value: 'set-cooldown' },
			{ name: 'Increase Cooldown Time', value: 'increase-cooldown' },
			{ name: 'Decrease Cooldown Time', value: 'decrease-cooldown' }
		])
	},
	parse: function ({ skill, operation, cooldown }) {
		const words = Command.words
			.push(Command.parseSkill(skill))
			.push(Local.get('command.setSkill.' + operation))
		switch (operation) {
			case 'set-cooldown':
			case 'increase-cooldown':
			case 'decrease-cooldown':
				words.push(Command.parseVariableNumber(cooldown, 'ms'))
				break
		}
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setSkill') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		skill = { type: 'trigger' },
		operation = 'set-cooldown',
		cooldown = 0
	}) {
		const write = getElementWriter('setSkill')
		write('skill', skill)
		write('operation', operation)
		write('cooldown', cooldown)
		$('#setSkill-skill').getFocus()
	},
	save: function () {
		const read = getElementReader('setSkill')
		const skill = read('skill')
		const operation = read('operation')
		switch (operation) {
			case 'set-cooldown':
			case 'increase-cooldown':
			case 'decrease-cooldown': {
				const cooldown = read('cooldown')
				Command.save({ skill, operation, cooldown })
				break
			}
		}
	}
}

// 创建触发器
Command.cases.createTrigger = {
	initialize: function () {
		$('#createTrigger-confirm').on('click', this.save)
	},
	parse: function ({
		triggerId,
		caster,
		origin,
		angle,
		distance,
		scale,
		timeScale
	}) {
		const casterName = Command.parseActor(caster)
		const originName = Command.parsePosition(origin)
		const words = Command.words
			.push(Command.parseVariableFile(triggerId))
			.push(casterName)
			.push(originName.indexOf(casterName) === -1 ? originName : '')
			.push(Command.parseAngle(angle))
			.push(Command.parseVariableNumber(distance, 't'))
			.push(Command.parseVariableNumber(scale))
			.push(Command.parseVariableNumber(timeScale))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.createTrigger') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		triggerId = '',
		caster = { type: 'trigger' },
		origin = { type: 'actor', actor: { type: 'trigger' } },
		angle = { type: 'direction', degrees: 0 },
		distance = 0,
		scale = 1,
		timeScale = 1
	}) {
		const write = getElementWriter('createTrigger')
		write('triggerId', triggerId)
		write('caster', caster)
		write('origin', origin)
		write('angle', angle)
		write('distance', distance)
		write('scale', scale)
		write('timeScale', timeScale)
		$('#createTrigger-triggerId').getFocus()
	},
	save: function () {
		const read = getElementReader('createTrigger')
		const triggerId = read('triggerId')
		if (triggerId === '') {
			return $('#createTrigger-triggerId').getFocus()
		}
		const caster = read('caster')
		const origin = read('origin')
		const angle = read('angle')
		const distance = read('distance')
		const scale = read('scale')
		const timeScale = read('timeScale')
		Command.save({
			triggerId,
			caster,
			origin,
			angle,
			distance,
			scale,
			timeScale
		})
	}
}

// 设置触发器速度
Command.cases.setTriggerSpeed = {
	initialize: function () {
		$('#setTriggerSpeed-confirm').on('click', this.save)
	},
	parse: function ({ trigger, speed }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseVariableNumber(speed, 't/s'))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerSpeed') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ trigger = { type: 'trigger' }, speed = 0 }) {
		const write = getElementWriter('setTriggerSpeed')
		write('trigger', trigger)
		write('speed', speed)
		$('#setTriggerSpeed-trigger').getFocus()
	},
	save: function () {
		const read = getElementReader('setTriggerSpeed')
		const trigger = read('trigger')
		const speed = read('speed')
		Command.save({ trigger, speed })
	}
}

// 设置触发器角度
Command.cases.setTriggerAngle = {
	initialize: function () {
		$('#setTriggerAngle-confirm').on('click', this.save)
	},
	parse: function ({ trigger, angle }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseAngle(angle))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerAngle') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		trigger = { type: 'trigger' },
		angle = { type: 'absolute', degrees: 0 }
	}) {
		const write = getElementWriter('setTriggerAngle')
		write('trigger', trigger)
		write('angle', angle)
		$('#setTriggerAngle-trigger').getFocus()
	},
	save: function () {
		const read = getElementReader('setTriggerAngle')
		const trigger = read('trigger')
		const angle = read('angle')
		Command.save({ trigger, angle })
	}
}

// 设置触发器持续时间
Command.cases.setTriggerDuration = {
	initialize: function () {
		$('#setTriggerDuration-confirm').on('click', this.save)

		// 创建操作选项
		$('#setTriggerDuration-operation').loadItems([
			{ name: 'Set', value: 'set' },
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		])
	},
	parse: function ({ trigger, operation, duration }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Local.get('command.setTriggerDuration.' + operation))
			.push(Command.parseVariableNumber(duration, 'ms'))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerDuration') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		trigger = { type: 'trigger' },
		operation = 'set',
		duration = 0
	}) {
		const write = getElementWriter('setTriggerDuration')
		write('trigger', trigger)
		write('operation', operation)
		write('duration', duration)
		$('#setTriggerDuration-trigger').getFocus()
	},
	save: function () {
		const read = getElementReader('setTriggerDuration')
		const trigger = read('trigger')
		const operation = read('operation')
		const duration = read('duration')
		Command.save({ trigger, operation, duration })
	}
}

// 设置触发器动作
Command.cases.setTriggerMotion = {
	initialize: function () {
		$('#setTriggerMotion-confirm').on('click', this.save)
	},
	parse: function ({ trigger, motion }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseEnumString(motion))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerMotion') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ trigger = { type: 'trigger' }, motion = '' }) {
		const write = getElementWriter('setTriggerMotion')
		write('trigger', trigger)
		write('motion', motion)
		$('#setTriggerMotion-trigger').getFocus()
	},
	save: function () {
		const read = getElementReader('setTriggerMotion')
		const trigger = read('trigger')
		const motion = read('motion')
		if (motion === '') {
			return $('#setTriggerMotion-motion').getFocus()
		}
		Command.save({ trigger, motion })
	}
}

// 设置库存
Command.cases.setInventory = {
	initialize: function () {
		$('#setInventory-confirm').on('click', this.save)

		// 创建操作选项
		$('#setInventory-operation').loadItems([
			{ name: 'Increase Money', value: 'increase-money' },
			{ name: 'Decrease Money', value: 'decrease-money' },
			{ name: 'Increase Items', value: 'increase-items' },
			{ name: 'Decrease Items', value: 'decrease-items' },
			{ name: 'Gain Equipment', value: 'gain-equipment' },
			{ name: 'Lose Equipment', value: 'lose-equipment' },
			{ name: 'Gain Equipment', value: 'gain-equipment-instance' },
			{ name: 'Lose Equipment', value: 'lose-equipment-instance' },
			{ name: 'Swap Order of Items', value: 'swap' },
			{ name: 'Sort Simply', value: 'sort' },
			{ name: 'Sort by Filename', value: 'sort-by-order' },
			{ name: "Use Global Actor's Inventory", value: 'reference' },
			{ name: 'Restore Inventory', value: 'dereference' },
			{ name: 'Reset', value: 'reset' }
		])

		// 设置关联元素
		$('#setInventory-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['increase-money', 'decrease-money'],
					targets: [$('#setInventory-money')]
				},
				{
					case: ['increase-items', 'decrease-items'],
					targets: [
						$('#setInventory-itemId'),
						$('#setInventory-quantity')
					]
				},
				{
					case: ['gain-equipment', 'lose-equipment'],
					targets: [$('#setInventory-equipmentId')]
				},
				{
					case: [
						'gain-equipment-instance',
						'lose-equipment-instance'
					],
					targets: [$('#setInventory-equipment')]
				},
				{
					case: 'swap',
					targets: [
						$('#setInventory-order1'),
						$('#setInventory-order2')
					]
				},
				{ case: 'reference', targets: [$('#setInventory-refActor')] }
			])
	},
	parse: function ({
		actor,
		operation,
		money,
		itemId,
		quantity,
		equipmentId,
		equipment,
		order1,
		order2,
		refActor
	}) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.setInventory.' + operation))
		switch (operation) {
			case 'increase-money':
			case 'decrease-money':
				words.push(Command.parseVariableNumber(money))
				break
			case 'increase-items':
			case 'decrease-items':
				words.push(Command.parseVariableFile(itemId))
				words.push(Command.parseVariableNumber(quantity))
				break
			case 'gain-equipment':
			case 'lose-equipment':
				words.push(Command.parseVariableFile(equipmentId))
				break
			case 'gain-equipment-instance':
			case 'lose-equipment-instance':
				words.push(Command.parseEquipment(equipment))
				break
			case 'swap': {
				const a = Command.parseVariableNumber(order1)
				const b = Command.parseVariableNumber(order2)
				words.push(a + Token(' <-> ') + b)
				break
			}
			case 'reference':
				words.push(Command.parseActor(refActor))
				break
		}
		return [
			{ color: 'inventory' },
			{ text: Local.get('command.setInventory') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		operation = 'increase-money',
		money = 1,
		itemId = '',
		quantity = 1,
		equipmentId = '',
		equipment = { type: 'trigger' },
		order1 = 0,
		order2 = 1,
		refActor = { type: 'player' }
	}) {
		const write = getElementWriter('setInventory')
		write('actor', actor)
		write('operation', operation)
		write('money', money)
		write('itemId', itemId)
		write('quantity', quantity)
		write('equipmentId', equipmentId)
		write('equipment', equipment)
		write('order1', order1)
		write('order2', order2)
		write('refActor', refActor)
		$('#setInventory-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setInventory')
		const actor = read('actor')
		const operation = read('operation')
		switch (operation) {
			case 'increase-money':
			case 'decrease-money': {
				const money = read('money')
				Command.save({ actor, operation, money })
				break
			}
			case 'increase-items':
			case 'decrease-items': {
				const itemId = read('itemId')
				const quantity = read('quantity')
				if (itemId === '') {
					return $('#setInventory-itemId').getFocus()
				}
				Command.save({ actor, operation, itemId, quantity })
				break
			}
			case 'gain-equipment':
			case 'lose-equipment': {
				const equipmentId = read('equipmentId')
				if (equipmentId === '') {
					return $('#setInventory-equipmentId').getFocus()
				}
				Command.save({ actor, operation, equipmentId })
				break
			}
			case 'gain-equipment-instance':
			case 'lose-equipment-instance': {
				const equipment = read('equipment')
				Command.save({ actor, operation, equipment })
				break
			}
			case 'swap': {
				const order1 = read('order1')
				const order2 = read('order2')
				Command.save({ actor, operation, order1, order2 })
				break
			}
			case 'sort':
			case 'sort-by-order':
			case 'reset':
			case 'dereference':
				Command.save({ actor, operation })
				break
			case 'reference': {
				const refActor = read('refActor')
				Command.save({ actor, operation, refActor })
				break
			}
		}
	}
}

// 使用物品
Command.cases.useItem = {
	initialize: function () {
		$('#useItem-confirm').on('click', this.save)

		// 创建模式选项
		$('#useItem-mode').loadItems([
			{ name: 'By Shortcut Key', value: 'by-key' },
			{ name: 'By Item ID', value: 'by-id' },
			{ name: 'By Item Instance', value: 'by-item' }
		])

		// 设置模式关联元素
		$('#useItem-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'by-key', targets: [$('#useItem-key')] },
				{ case: 'by-id', targets: [$('#useItem-itemId')] },
				{ case: 'by-item', targets: [$('#useItem-item')] }
			])

		// 创建等待结束选项
		$('#useItem-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
	},
	parse: function ({ actor, mode, key, itemId, item, wait }) {
		const words = Command.words.push(Command.parseActor(actor))
		switch (mode) {
			case 'by-key':
				words.push(Command.parseGroupEnumString('shortcut-key', key))
				break
			case 'by-id':
				words.push(Command.parseFileName(itemId))
				break
			case 'by-item':
				words.push(Command.parseItem(item))
				break
		}
		words.push(Command.parseWait(wait))
		return [
			{ color: 'inventory' },
			{ text: Local.get('command.useItem') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		mode = 'by-key',
		key = Enum.getDefStringId('shortcut-key'),
		itemId = '',
		item = { type: 'trigger' },
		wait = false
	}) {
		// 加载快捷键选项
		$('#useItem-key').loadItems(Enum.getStringItems('shortcut-key'))
		const write = getElementWriter('useItem')
		write('actor', actor)
		write('mode', mode)
		write('key', key)
		write('itemId', itemId)
		write('item', item)
		write('wait', wait)
		$('#useItem-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('useItem')
		const actor = read('actor')
		const mode = read('mode')
		const wait = read('wait')
		switch (mode) {
			case 'by-key': {
				const key = read('key')
				if (key === '') {
					return $('#useItem-key').getFocus()
				}
				Command.save({ actor, mode, key, wait })
				break
			}
			case 'by-id': {
				const itemId = read('itemId')
				if (itemId === '') {
					return $('#useItem-itemId').getFocus()
				}
				Command.save({ actor, mode, itemId, wait })
				break
			}
			case 'by-item': {
				const item = read('item')
				Command.save({ actor, mode, item, wait })
				break
			}
		}
	}
}

// 设置物品
Command.cases.setItem = {
	initialize: function () {
		$('#setItem-confirm').on('click', this.save)

		// 创建操作选项
		$('#setItem-operation').loadItems([
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		])
	},
	parse: function ({ item, operation, quantity }) {
		const words = Command.words
			.push(Command.parseItem(item))
			.push(Local.get('command.setItem.' + operation))
		switch (operation) {
			case 'increase':
			case 'decrease':
				words.push(Command.parseVariableNumber(quantity))
				break
		}
		return [
			{ color: 'inventory' },
			{ text: Local.get('command.setItem') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		item = { type: 'trigger' },
		operation = 'increase',
		quantity = 1
	}) {
		const write = getElementWriter('setItem')
		write('item', item)
		write('operation', operation)
		write('quantity', quantity)
		$('#setItem-item').getFocus()
	},
	save: function () {
		const read = getElementReader('setItem')
		const item = read('item')
		const operation = read('operation')
		switch (operation) {
			case 'increase':
			case 'decrease': {
				const quantity = read('quantity')
				Command.save({ item, operation, quantity })
				break
			}
		}
	}
}

// 设置冷却时间
Command.cases.setCooldown = {
	initialize: function () {
		$('#setCooldown-confirm').on('click', this.save)

		// 创建操作选项
		$('#setCooldown-operation').loadItems([
			{ name: 'Set', value: 'set' },
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		])
	},
	parse: function ({ actor, operation, key, cooldown }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.setCooldown.' + operation))
			.push(Command.parseVariableEnum('cooldown-key', key))
			.push(Command.parseVariableNumber(cooldown, 'ms'))
		return [
			{ color: 'inventory' },
			{ text: Local.get('command.setCooldown') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		operation = 'set',
		key = Enum.getDefStringId('cooldown-key'),
		cooldown = 0
	}) {
		// 加载冷却键选项
		$('#setCooldown-key').loadItems(Enum.getStringItems('cooldown-key'))
		const write = getElementWriter('setCooldown')
		write('actor', actor)
		write('operation', operation)
		write('key', key)
		write('cooldown', cooldown)
		$('#setCooldown-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setCooldown')
		const actor = read('actor')
		const operation = read('operation')
		const key = read('key')
		if (key === '') {
			return $('#setCooldown-key').getFocus()
		}
		const cooldown = read('cooldown')
		Command.save({ actor, operation, key, cooldown })
	}
}

// 设置快捷键
Command.cases.setShortcut = {
	initialize: function () {
		$('#setShortcut-confirm').on('click', this.save)

		// 创建操作选项
		$('#setShortcut-operation').loadItems([
			{ name: 'Set Item Shortcut', value: 'set-item-shortcut' },
			{ name: 'Set Skill Shortcut', value: 'set-skill-shortcut' },
			{ name: 'Delete Shortcut', value: 'delete-shortcut' },
			{ name: 'Swap Shortcuts', value: 'swap-shortcuts' }
		])

		// 设置操作关联元素
		$('#setShortcut-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'set-item-shortcut',
					targets: [$('#setShortcut-itemId')]
				},
				{
					case: 'set-skill-shortcut',
					targets: [$('#setShortcut-skillId')]
				},
				{ case: 'swap-shortcuts', targets: [$('#setShortcut-key2')] }
			])
	},
	parse: function ({ actor, operation, itemId, skillId, key, key2 }) {
		const shortcutKey = Command.parseVariableEnum('shortcut-key', key)
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.setShortcut.' + operation))
		switch (operation) {
			case 'set-item-shortcut': {
				words.push(
					shortcutKey +
						Token(' = ') +
						Command.parseVariableFile(itemId)
				)
				break
			}
			case 'set-skill-shortcut':
				words.push(
					shortcutKey +
						Token(' = ') +
						Command.parseVariableFile(skillId)
				)
				break
			case 'delete-shortcut':
				words.push(shortcutKey)
				break
			case 'swap-shortcuts':
				words.push(
					shortcutKey +
						Token(' <-> ') +
						Command.parseVariableEnum('shortcut-key', key2)
				)
				break
		}
		return [
			{ color: 'inventory' },
			{ text: Local.get('command.setShortcut') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		operation = 'set-item-shortcut',
		itemId = '',
		skillId = '',
		key = Enum.getDefStringId('shortcut-key'),
		key2 = Enum.getDefStringId('shortcut-key')
	}) {
		// 加载快捷键选项
		const items = Enum.getStringItems('shortcut-key')
		$('#setShortcut-key').loadItems(items)
		$('#setShortcut-key2').loadItems(items)
		const write = getElementWriter('setShortcut')
		write('actor', actor)
		write('operation', operation)
		write('key', key)
		write('key2', key2)
		write('itemId', itemId)
		write('skillId', skillId)
		$('#setShortcut-operation').getFocus()
	},
	save: function () {
		const read = getElementReader('setShortcut')
		const actor = read('actor')
		const operation = read('operation')
		const key = read('key')
		if (key === '') {
			return $('#setShortcut-key').getFocus()
		}
		switch (operation) {
			case 'set-item-shortcut': {
				const itemId = read('itemId')
				if (itemId === '') {
					return $('#setShortcut-itemId').getFocus()
				}
				Command.save({ actor, operation, key, itemId })
				break
			}
			case 'set-skill-shortcut': {
				const skillId = read('skillId')
				if (skillId === '') {
					return $('#setShortcut-skillId').getFocus()
				}
				Command.save({ actor, operation, key, skillId })
				break
			}
			case 'delete-shortcut':
				Command.save({ actor, operation, key })
				break
			case 'swap-shortcuts': {
				const key2 = read('key2')
				Command.save({ actor, operation, key, key2 })
				break
			}
		}
	}
}

// 激活场景
Command.cases.activateScene = {
	initialize: function () {
		$('#activateScene-confirm').on('click', this.save)

		// 创建场景选项
		$('#activateScene-pointer').loadItems([
			{ name: 'Scene A', value: 0 },
			{ name: 'Scene B', value: 1 }
		])
	},
	parsePointer: function (pointer) {
		switch (pointer) {
			case 0:
				return 'A'
			case 1:
				return 'B'
		}
	},
	parse: function ({ pointer }) {
		return [
			{ color: 'scene' },
			{ text: Local.get('command.activateScene') + Token(': ') },
			{ text: this.parsePointer(pointer) }
		]
	},
	load: function ({ pointer = 0 }) {
		const write = getElementWriter('activateScene')
		write('pointer', pointer)
		$('#activateScene-pointer').getFocus()
	},
	save: function () {
		const read = getElementReader('activateScene')
		const pointer = read('pointer')
		Command.save({ pointer })
	}
}

// 加载场景
Command.cases.loadScene = {
	initialize: function () {
		$('#loadScene-confirm').on('click', this.save)

		// 创建转移玩家角色选项
		$('#loadScene-transfer').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 设置转移玩家角色关联元素
		$('#loadScene-transfer')
			.enableHiddenMode()
			.relate([
				{ case: true, targets: [$('#loadScene-x'), $('#loadScene-y')] }
			])
	},
	parse: function ({ sceneId, transfer, x, y }) {
		const words = Command.words.push(Command.parseVariableFile(sceneId))
		if (transfer) {
			words
				.push(Command.parseVariableNumber(x))
				.push(Command.parseVariableNumber(y))
		}
		return [
			{ color: 'scene' },
			{ text: Local.get('command.loadScene') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ sceneId = '', transfer = true, x = 0, y = 0 }) {
		const write = getElementWriter('loadScene')
		write('sceneId', sceneId)
		write('transfer', transfer)
		write('x', x)
		write('y', y)
		$('#loadScene-sceneId').getFocus()
	},
	save: function () {
		const read = getElementReader('loadScene')
		const sceneId = read('sceneId')
		if (sceneId === '') {
			return $('#loadScene-sceneId').getFocus()
		}
		const transfer = read('transfer')
		switch (transfer) {
			case true: {
				const x = read('x')
				const y = read('y')
				Command.save({ sceneId, transfer, x, y })
				break
			}
			case false:
				Command.save({ sceneId, transfer })
				break
		}
	}
}

// 加载子场景
Command.cases.loadSubscene = {
	initialize: function () {
		$('#loadSubscene-confirm').on('click', this.save)
	},
	parse: function ({ sceneId, shiftX, shiftY }) {
		const words = Command.words
			.push(Command.parseVariableFile(sceneId))
			.push(Command.parseVariableNumber(shiftX))
			.push(Command.parseVariableNumber(shiftY))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.loadSubscene') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ sceneId = '', shiftX = 0, shiftY = 0 }) {
		const write = getElementWriter('loadSubscene')
		write('sceneId', sceneId)
		write('shiftX', shiftX)
		write('shiftY', shiftY)
		$('#loadSubscene-sceneId').getFocus()
	},
	save: function () {
		const read = getElementReader('loadSubscene')
		const sceneId = read('sceneId')
		if (sceneId === '') {
			return $('#loadSubscene-sceneId').getFocus()
		}
		const shiftX = read('shiftX')
		const shiftY = read('shiftY')
		Command.save({ sceneId, shiftX, shiftY })
	}
}

// 卸载子场景
Command.cases.unloadSubscene = {
	initialize: function () {
		$('#unloadSubscene-confirm').on('click', this.save)
	},
	parse: function ({ sceneId }) {
		return [
			{ color: 'scene' },
			{ text: Local.get('command.unloadSubscene') + Token(': ') },
			{ text: Command.parseVariableFile(sceneId) }
		]
	},
	load: function ({ sceneId = '' }) {
		const write = getElementWriter('unloadSubscene')
		write('sceneId', sceneId)
		$('#unloadSubscene-sceneId').getFocus()
	},
	save: function () {
		const read = getElementReader('unloadSubscene')
		const sceneId = read('sceneId')
		if (sceneId === '') {
			return $('#unloadSubscene-sceneId').getFocus()
		}
		Command.save({ sceneId })
	}
}

// 删除场景
Command.cases.deleteScene = {
	parse: function () {
		return [{ color: 'scene' }, { text: Local.get('command.deleteScene') }]
	},
	save: function () {
		Command.save({})
	}
}

// 限制摄像机边界
Command.cases.clampCamera = {
	initialize: function () {
		$('#clampCamera-confirm').on('click', this.save)
	},
	parse: function ({ left, top, right, bottom }) {
		const words = Command.words
			.push(
				Local.get('command.clampCamera.left') +
					Token(' = ') +
					Command.parseVariableNumber(left)
			)
			.push(
				Local.get('command.clampCamera.top') +
					Token(' = ') +
					Command.parseVariableNumber(top)
			)
			.push(
				Local.get('command.clampCamera.right') +
					Token(' = ') +
					Command.parseVariableNumber(right)
			)
			.push(
				Local.get('command.clampCamera.bottom') +
					Token(' = ') +
					Command.parseVariableNumber(bottom)
			)
		return [
			{ color: 'scene' },
			{ text: Local.get('command.clampCamera') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ left = 0, top = 0, right = 0, bottom = 0 }) {
		const write = getElementWriter('clampCamera')
		write('left', left)
		write('top', top)
		write('right', right)
		write('bottom', bottom)
		$('#clampCamera-left').getFocus('all')
	},
	save: function () {
		const read = getElementReader('clampCamera')
		const left = read('left')
		const top = read('top')
		const right = read('right')
		const bottom = read('bottom')
		Command.save({ left, top, right, bottom })
	}
}

// 解除摄像机边界
Command.cases.unclampCamera = {
	parse: function () {
		return [
			{ color: 'scene' },
			{ text: Local.get('command.unclampCamera') }
		]
	},
	save: function () {
		Command.save({})
	}
}

// 移动摄像机
Command.cases.moveCamera = {
	initialize: function () {
		$('#moveCamera-confirm').on('click', this.save)

		// 创建模式选项
		$('#moveCamera-mode').loadItems([
			{ name: 'Move to Position', value: 'position' },
			{ name: 'Follow Actor', value: 'actor' }
		])

		// 设置模式关联元素
		$('#moveCamera-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'position', targets: [$('#moveCamera-position')] },
				{ case: 'actor', targets: [$('#moveCamera-actor')] }
			])

		// 创建等待选项
		$('#moveCamera-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#moveCamera').on('open', function (event) {
			$('#moveCamera-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#moveCamera').on('closed', function (event) {
			$('#moveCamera-easingId').clear()
		})
	},
	parse: function ({ mode, position, actor, easingId, duration, wait }) {
		const words = Command.words.push(
			Local.get('command.moveCamera.' + mode)
		)
		switch (mode) {
			case 'position':
				words.push(Command.parsePosition(position))
				break
			case 'actor':
				words.push(Command.parseActor(actor))
				break
		}
		words.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.moveCamera') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		mode = 'position',
		position = { type: 'absolute', x: 0, y: 0 },
		actor = { type: 'trigger' },
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('moveCamera')
		write('mode', mode)
		write('position', position)
		write('actor', actor)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#moveCamera-mode').getFocus()
	},
	save: function () {
		const read = getElementReader('moveCamera')
		const mode = read('mode')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		switch (mode) {
			case 'position': {
				const position = read('position')
				Command.save({ mode, position, easingId, duration, wait })
				break
			}
			case 'actor': {
				const actor = read('actor')
				Command.save({ mode, actor, easingId, duration, wait })
				break
			}
		}
	}
}

// 设置缩放率
Command.cases.setZoomFactor = {
	initialize: function () {
		$('#setZoomFactor-confirm').on('click', this.save)

		// 创建等待选项
		$('#setZoomFactor-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setZoomFactor').on('open', function (event) {
			$('#setZoomFactor-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#setZoomFactor').on('closed', function (event) {
			$('#setZoomFactor-easingId').clear()
		})
	},
	parse: function ({ zoom, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseVariableNumber(zoom))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.setZoomFactor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		zoom = 1,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setZoomFactor')
		write('zoom', zoom)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setZoomFactor-zoom').getFocus('all')
	},
	save: function () {
		const read = getElementReader('setZoomFactor')
		const zoom = read('zoom')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ zoom, easingId, duration, wait })
	}
}

// 设置环境光
Command.cases.setAmbientLight = {
	initialize: function () {
		$('#setAmbientLight-confirm').on('click', this.save)

		// 创建等待结束选项
		$('#setAmbientLight-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setAmbientLight').on('open', function (event) {
			$('#setAmbientLight-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#setAmbientLight').on('closed', function (event) {
			$('#setAmbientLight-easingId').clear()
		})
	},
	parseColor: function (red, green, blue) {
		const r = Command.parseVariableNumber(red)
		const g = Command.parseVariableNumber(green)
		const b = Command.parseVariableNumber(blue)
		return (
			'RGB' +
			Token('(') +
			r +
			Token(', ') +
			g +
			Token(', ') +
			b +
			Token(')')
		)
	},
	parse: function ({ red, green, blue, easingId, duration, wait }) {
		const words = Command.words
			.push(this.parseColor(red, green, blue))
			.push(Command.parseEasing(easingId, duration, wait))
		const contents = [
			{ color: 'scene' },
			{ text: Local.get('command.setAmbientLight') + Token(': ') },
			{ text: words.join() }
		]
		return contents
	},
	load: function ({
		red = 0,
		green = 0,
		blue = 0,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setAmbientLight')
		write('red', red)
		write('green', green)
		write('blue', blue)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setAmbientLight-red').getFocus('all')
	},
	save: function () {
		const read = getElementReader('setAmbientLight')
		const red = read('red')
		const green = read('green')
		const blue = read('blue')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ red, green, blue, easingId, duration, wait })
	}
}

// 改变画面色调
Command.cases.tintScreen = {
	initialize: function () {
		$('#tintScreen-confirm').on('click', this.save)

		// 创建等待结束选项
		$('#tintScreen-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#tintScreen').on('open', function (event) {
			$('#tintScreen-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#tintScreen').on('closed', function (event) {
			$('#tintScreen-easingId').clear()
			$('#tintScreen-filter').clear()
		})

		// 写入滤镜框 - 色调输入框输入事件
		$(
			'#tintScreen-tint-0, #tintScreen-tint-1, #tintScreen-tint-2, #tintScreen-tint-3'
		).on('input', function (event) {
			$('#tintScreen-filter').write([
				$('#tintScreen-tint-0').read(),
				$('#tintScreen-tint-1').read(),
				$('#tintScreen-tint-2').read(),
				$('#tintScreen-tint-3').read()
			])
		})
	},
	parseTint: function ([red, green, blue, gray]) {
		const _red = Command.setNumberColor(red)
		const _green = Command.setNumberColor(green)
		const _blue = Command.setNumberColor(blue)
		const _gray = Command.setNumberColor(gray)
		return (
			Token('(') +
			_red +
			Token(', ') +
			_green +
			Token(', ') +
			_blue +
			Token(', ') +
			_gray +
			Token(')')
		)
	},
	parse: function ({ tint, easingId, duration, wait }) {
		const words = Command.words
			.push(this.parseTint(tint))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.tintScreen') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		tint = [0, 0, 0, 0],
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('tintScreen')
		write('tint-0', tint[0])
		write('tint-1', tint[1])
		write('tint-2', tint[2])
		write('tint-3', tint[3])
		write('filter', tint)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#tintScreen-tint-0').getFocus('all')
	},
	save: function () {
		const read = getElementReader('tintScreen')
		const red = read('tint-0')
		const green = read('tint-1')
		const blue = read('tint-2')
		const gray = read('tint-3')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		const tint = [red, green, blue, gray]
		Command.save({ tint, easingId, duration, wait })
	}
}

// 震动屏幕
Command.cases.shakeScreen = {
	initialize: function () {
		$('#shakeScreen-confirm').on('click', this.save)

		// 创建震动模式选项
		$('#shakeScreen-mode').loadItems([
			{ name: 'Random', value: 'random' },
			{ name: 'Horizontal', value: 'horizontal' },
			{ name: 'Vertical', value: 'vertical' }
		])

		// 创建等待结束选项
		$('#shakeScreen-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#shakeScreen').on('open', function (event) {
			$('#shakeScreen-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#shakeScreen').on('closed', function (event) {
			$('#shakeScreen-easingId').clear()
		})
	},
	parse: function ({ mode, power, speed, easingId, duration, wait }) {
		const words = Command.words
			.push(Local.get('command.shakeScreen.' + mode))
			.push(Command.setNumberColor(power))
			.push(Command.setNumberColor(speed))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.shakeScreen') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		mode = 'random',
		power = 5,
		speed = 10,
		easingId = Data.easings[0].id,
		duration = 200,
		wait = false
	}) {
		const write = getElementWriter('shakeScreen')
		write('mode', mode)
		write('power', power)
		write('speed', speed)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#shakeScreen-mode').getFocus()
	},
	save: function () {
		const read = getElementReader('shakeScreen')
		const mode = read('mode')
		const power = read('power')
		const speed = read('speed')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ mode, power, speed, easingId, duration, wait })
	}
}

// 设置图块
Command.cases.setTile = {
	initialize: function () {
		$('#setTile-confirm').on('click', this.save)
	},
	parse: function ({
		tilemap,
		tilemapX,
		tilemapY,
		tilesetId,
		tilesetX,
		tilesetY
	}) {
		const words = Command.words
			.push(Command.parseTilemap(tilemap))
			.push(Command.parseVariableNumber(tilemapX))
			.push(Command.parseVariableNumber(tilemapY))
			.push(Command.parseFileName(tilesetId))
			.push(Command.parseVariableNumber(tilesetX))
			.push(Command.parseVariableNumber(tilesetY))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.setTile') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		tilemap = { type: 'trigger' },
		tilemapX = 0,
		tilemapY = 0,
		tilesetId = '',
		tilesetX = 0,
		tilesetY = 0
	}) {
		const write = getElementWriter('setTile')
		write('tilemap', tilemap)
		write('tilemapX', tilemapX)
		write('tilemapY', tilemapY)
		write('tilesetId', tilesetId)
		write('tilesetX', tilesetX)
		write('tilesetY', tilesetY)
		$('#setTile-tilemap').getFocus()
	},
	save: function () {
		const read = getElementReader('setTile')
		const tilemap = read('tilemap')
		const tilemapX = read('tilemapX')
		const tilemapY = read('tilemapY')
		const tilesetId = read('tilesetId')
		const tilesetX = read('tilesetX')
		const tilesetY = read('tilesetY')
		if (tilesetId === '') {
			return $('#setTile-tilesetId').getFocus()
		}
		Command.save({
			tilemap,
			tilemapX,
			tilemapY,
			tilesetId,
			tilesetX,
			tilesetY
		})
	}
}

// 删除图块
Command.cases.deleteTile = {
	initialize: function () {
		$('#deleteTile-confirm').on('click', this.save)
	},
	parse: function ({ tilemap, tilemapX, tilemapY }) {
		const words = Command.words
			.push(Command.parseTilemap(tilemap))
			.push(Command.parseVariableNumber(tilemapX))
			.push(Command.parseVariableNumber(tilemapY))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.deleteTile') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		tilemap = { type: 'trigger' },
		tilemapX = 0,
		tilemapY = 0
	}) {
		const write = getElementWriter('deleteTile')
		write('tilemap', tilemap)
		write('tilemapX', tilemapX)
		write('tilemapY', tilemapY)
		$('#deleteTile-tilemap').getFocus()
	},
	save: function () {
		const read = getElementReader('deleteTile')
		const tilemap = read('tilemap')
		const tilemapX = read('tilemapX')
		const tilemapY = read('tilemapY')
		Command.save({ tilemap, tilemapX, tilemapY })
	}
}

// 设置地形
Command.cases.setTerrain = {
	initialize: function () {
		$('#setTerrain-confirm').on('click', this.save)
		$('#setTerrain-terrain').loadItems([
			{ name: 'Land', value: 'land' },
			{ name: 'Water', value: 'water' },
			{ name: 'Wall', value: 'wall' }
		])
	},
	parse: function ({ position, terrain }) {
		const words = Command.words
			.push(Command.parsePosition(position))
			.push(Local.get('command.setTerrain.' + terrain))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.setTerrain') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		position = { type: 'absolute', x: 0, y: 0 },
		terrain = 'land'
	}) {
		const write = getElementWriter('setTerrain')
		write('position', position)
		write('terrain', terrain)
		$('#setTerrain-position').getFocus()
	},
	save: function () {
		const read = getElementReader('setTerrain')
		const position = read('position')
		const terrain = read('terrain')
		Command.save({ position, terrain })
	}
}

// 设置游戏速度
Command.cases.setGameSpeed = {
	initialize: function () {
		$('#setGameSpeed-confirm').on('click', this.save)

		// 创建等待选项
		$('#setGameSpeed-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setGameSpeed').on('open', function (event) {
			$('#setGameSpeed-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#setGameSpeed').on('closed', function (event) {
			$('#setGameSpeed-easingId').clear()
		})
	},
	parse: function ({ speed, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseVariableNumber(speed))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'system' },
			{ text: Local.get('command.setGameSpeed') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		speed = 1,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setGameSpeed')
		write('speed', speed)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setGameSpeed-speed').getFocus('all')
	},
	save: function () {
		const read = getElementReader('setGameSpeed')
		const speed = read('speed')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ speed, easingId, duration, wait })
	}
}

// 设置鼠标指针
Command.cases.setCursor = {
	initialize: function () {
		$('#setCursor-confirm').on('click', this.save)
	},
	parse: function ({ image }) {
		return [
			{ color: 'system' },
			{ text: Local.get('command.setCursor') + Token(': ') },
			{ text: Command.parseFileName(image) }
		]
	},
	load: function ({ image = '' }) {
		const write = getElementWriter('setCursor')
		write('image', image)
		$('#setCursor-image').getFocus()
	},
	save: function () {
		const read = getElementReader('setCursor')
		const image = read('image')
		Command.save({ image })
	}
}

// 设置队伍关系
Command.cases.setTeamRelation = {
	initialize: function () {
		$('#setTeamRelation-confirm').on('click', this.save)

		// 创建关系选项
		$('#setTeamRelation-relation').loadItems([
			{ name: 'Enemy', value: 0 },
			{ name: 'Friend', value: 1 }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setTeamRelation').on('open', function (event) {
			const items = Data.createTeamItems()
			$('#setTeamRelation-teamId1').loadItems(items)
			$('#setTeamRelation-teamId2').loadItems(items)
		})

		// 清理内存 - 窗口已关闭事件
		$('#setTeamRelation').on('closed', function (event) {
			$('#setTeamRelation-teamId1').clear()
			$('#setTeamRelation-teamId2').clear()
		})
	},
	parseRelation: function (relation) {
		return Local.get('command.setTeamRelation.relation.' + relation)
	},
	parse: function ({ teamId1, teamId2, relation }) {
		const words = Command.words
			.push(Command.parseTeam(teamId1))
			.push(Command.parseTeam(teamId2))
			.push(this.parseRelation(relation))
		return [
			{ color: 'system' },
			{ text: Local.get('command.setTeamRelation') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		teamId1 = Data.teams.list[0].id,
		teamId2 = Data.teams.list[0].id,
		relation = 0
	}) {
		const write = getElementWriter('setTeamRelation')
		write('teamId1', teamId1)
		write('teamId2', teamId2)
		write('relation', relation)
		$('#setTeamRelation-teamId1').getFocus()
	},
	save: function () {
		const read = getElementReader('setTeamRelation')
		const teamId1 = read('teamId1')
		const teamId2 = read('teamId2')
		const relation = read('relation')
		Command.save({ teamId1, teamId2, relation })
	}
}

// 开关碰撞系统
Command.cases.switchCollisionSystem = {
	initialize: function () {
		$('#switchCollisionSystem-confirm').on('click', this.save)

		// 创建操作选项
		$('#switchCollisionSystem-operation').loadItems([
			{ name: 'Enable Actor Collision', value: 'enable-actor-collision' },
			{
				name: 'Disable Actor Collision',
				value: 'disable-actor-collision'
			},
			{ name: 'Enable Scene Collision', value: 'enable-scene-collision' },
			{
				name: 'Disable Scene Collision',
				value: 'disable-scene-collision'
			}
		])
	},
	parse: function ({ operation }) {
		return [
			{ color: 'system' },
			{ text: Local.get('command.switchCollisionSystem') + Token(': ') },
			{ text: Local.get('command.switchCollisionSystem.' + operation) }
		]
	},
	load: function ({ operation = 'enable-actor-collision' }) {
		$('#switchCollisionSystem-operation').write(operation)
		$('#switchCollisionSystem-operation').getFocus()
	},
	save: function () {
		const operation = $('#switchCollisionSystem-operation').read()
		Command.save({ operation })
	}
}

// 游戏数据
Command.cases.gameData = {
	initialize: function () {
		$('#gameData-confirm').on('click', this.save)

		// 创建操作选项
		$('#gameData-operation').loadItems([
			{ name: 'Save', value: 'save' },
			{ name: 'Load', value: 'load' },
			{ name: 'Delete', value: 'delete' }
		])

		// 设置操作关联元素
		$('#gameData-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'save',
					targets: [$('#gameData-index'), $('#gameData-variables')]
				},
				{ case: ['load', 'delete'], targets: [$('#gameData-index')] }
			])
	},
	parse: function ({ operation, index, variables }) {
		const words = Command.words
			.push(Local.get('command.gameData.' + operation))
			.push(Command.parseVariableNumber(index))
		switch (operation) {
			case 'save':
				if (variables) {
					const label = Local.get('command.gameData.variables')
					const keys = variables
						.split(/\s*,\s*/)
						.map((key) => Command.setVariableColor(key))
					const string = keys.join(Token(', '))
					words.push(label + ' ' + Token('{') + string + Token('}'))
				}
				break
		}
		return [
			{ color: 'system' },
			{ text: Local.get('command.gameData') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ operation = 'save', index = 0, variables = '' }) {
		$('#gameData-operation').write(operation)
		$('#gameData-index').write(index)
		$('#gameData-variables').write(variables)
		$('#gameData-operation').getFocus()
	},
	save: function () {
		const read = getElementReader('gameData')
		const operation = read('operation')
		switch (operation) {
			case 'save': {
				const index = read('index')
				const variables = read('variables').trim()
				Command.save({ operation, index, variables })
				break
			}
			case 'load':
			case 'delete': {
				const index = read('index')
				Command.save({ operation, index })
				break
			}
		}
	}
}

// 模拟按键
Command.cases.simulateKey = {
	initialize: function () {
		$('#simulateKey-confirm').on('click', this.save)

		// 创建类型选项
		$('#simulateKey-operation').loadItems([
			{ name: 'Click', value: 'click' },
			{ name: 'Press', value: 'press' },
			{ name: 'Release', value: 'release' }
		])
	},
	parse: function ({ operation, keycode }) {
		const words = Command.words
			.push(Local.get('command.simulateKey.' + operation))
			.push(Command.setStringColor(keycode))
		return [
			{ color: 'system' },
			{ text: Local.get('command.simulateKey') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ operation = 'click', keycode = '' }) {
		$('#simulateKey-operation').write(operation)
		$('#simulateKey-keycode').write(keycode)
		$('#simulateKey-operation').getFocus()
	},
	save: function () {
		const read = getElementReader('simulateKey')
		const operation = read('operation')
		const keycode = read('keycode')
		Command.save({ operation, keycode })
	}
}

// 设置语言
Command.cases.setLanguage = {
	initialize: function () {
		$('#setLanguage-confirm').on('click', this.save)
	},
	parse: function ({ language }) {
		return [
			{ color: 'system' },
			{ text: Local.get('command.setLanguage') + Token(': ') },
			{ text: Local.get('languages.' + language) }
		]
	},
	load: function ({ language = 'auto' }) {
		// 创建语言选项
		$('#setLanguage-language').loadItems(this.createLanguageItems())
		$('#setLanguage-language').write(language)
		$('#setLanguage-language').getFocus()
	},
	save: function () {
		const read = getElementReader('setLanguage')
		const language = read('language')
		Command.save({ language })
	},
	createLanguageItems: function () {
		const items = []
		const languages = Local.get('languages')
		if (languages) {
			const langList = Data.config.localization.languages.map(
				(lang) => lang.name
			)
			for (const [value, name] of Object.entries(languages)) {
				if (value === 'auto' || langList.includes(value)) {
					items.push({ name, value })
				}
			}
		}
		return items
	}
}

// 设置分辨率
Command.cases.setResolution = {
	initialize: function () {
		$('#setResolution-confirm').on('click', this.save)
	},
	parse: function ({ width, height, sceneScale, uiScale }) {
		const words = Command.words
			.push(
				Command.parseVariableNumber(width) +
					Token(' x ') +
					Command.parseVariableNumber(height)
			)
			.push(Command.parseVariableNumber(sceneScale))
			.push(Command.parseVariableNumber(uiScale))
		return [
			{ color: 'system' },
			{ text: Local.get('command.setResolution') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		width = 1920,
		height = 1080,
		sceneScale = 1,
		uiScale = 1
	}) {
		const write = getElementWriter('setResolution')
		write('width', width)
		write('height', height)
		write('sceneScale', sceneScale)
		write('uiScale', uiScale)
		$('#setResolution-width').getFocus('all')
	},
	save: function () {
		const read = getElementReader('setResolution')
		const width = read('width')
		const height = read('height')
		const sceneScale = read('sceneScale')
		const uiScale = read('uiScale')
		Command.save({ width, height, sceneScale, uiScale })
	}
}

// 重置游戏
Command.cases.reset = {
	parse: function () {
		return [{ color: 'system' }, { text: Local.get('command.reset') }]
	},
	save: function () {
		Command.save({})
	}
}

// 暂停游戏
Command.cases.pauseGame = {
	parse: function () {
		return [{ color: 'system' }, { text: Local.get('command.pauseGame') }]
	},
	save: function () {
		Command.save({})
	}
}

// 继续游戏
Command.cases.continueGame = {
	parse: function () {
		return [
			{ color: 'system' },
			{ text: Local.get('command.continueGame') }
		]
	},
	save: function () {
		Command.save({})
	}
}

// 阻止场景输入事件
Command.cases.preventSceneInput = {
	parse: function () {
		return [
			{ color: 'system' },
			{ text: Local.get('command.preventSceneInput') }
		]
	},
	save: function () {
		Command.save({})
	}
}

// 恢复场景输入事件
Command.cases.restoreSceneInput = {
	parse: function () {
		return [
			{ color: 'system' },
			{ text: Local.get('command.restoreSceneInput') }
		]
	},
	save: function () {
		Command.save({})
	}
}

// 执行脚本
Command.cases.script = {
	editor: null,
	model: null,
	versionId: null,
	changed: false,
	fontSize: 14,
	lineHeight: 14,
	mark: $('#script-mark'),
	colorOptions: {
		mimeType: 'javascript',
		tabSize: 2,
		theme: ''
	},
	typesDispose: [],
	isMaximized: function () {
		return $('#script').hasClass('maximized')
	},
	resize: function () {
		const content = $('#script-script')
		const parent = content.parentElement
		if (!this.isMaximized()) {
			content.style.width = ''
			content.style.height = ''
			const boundingRect = content.getBoundingClientRect()
			this.editor.layout({
				width: boundingRect.width,
				height: parent.clientHeight - 60
			})
		} else {
			const boundingRect = content.getBoundingClientRect()
			// 保持content左右间距相同
			content.style.width =
				parent.clientWidth - boundingRect.left * 2 + 'px'
			content.style.height = parent.clientHeight - 60 + 'px'
			this.editor.layout({
				width: parseFloat(content.style.width),
				height: parseFloat(content.style.height)
			})
		}
	},
	initialize: function () {
		$('#script-confirm').on('click', this.save.bind(this))

		// 窗口关闭事件
		$('#script').on('close', (event) => {
			if (this.changed) {
				event.preventDefault()
				const get = Local.createGetter('confirmation')
				Window.confirm(
					{
						message: get('closeUnsavedScript'),
						close: () => {
							this.editor.getFocus()
						}
					},
					[
						{
							label: get('yes'),
							click: () => {
								this.setChangeState(false)
								Window.close('script')
							}
						},
						{
							label: get('no')
						}
					]
				)
			}
		})

		$('#script').on('resize', () => {
			this.resize()
		})

		// 窗口已关闭事件
		$('#script').on('closed', (event) => {
			this.model.setValue('')
		})

		// 键盘按下事件
		$('#script').on('keydown', (event) => {
			if (event.target.hasClass('inputarea')) {
				switch (event.code) {
					case 'Enter':
						event.stopPropagation()
						break
				}
			}
		})
	},

	parse: function ({ script }) {
		const contents = [{ script: script }]
		if (script.includes('\n')) {
			contents.unshift({ fold: true })
		}
		return contents
	},
	load: function ({ script = '' }) {
		this.createEditor()
		this.model.setValue(script)
		this.versionId = this.model.getAlternativeVersionId()
		this.editor.setPosition(new monaco.Position(9999, 9999))
		this.editor.setScrollTop(0)
		this.editor.revealLine(9999)
		this.editor.getFocus()
		// 加载类型定义文件
		if (!this.typesDispose) {
			this.typesDispose.forEach((item) => item())
		}
		const projectDir = path.dirname(Editor.config.project)
		this.typesDispose = loadDtsFolder(
			path.join(projectDir, 'Script'),
			monaco,
			true
		)
	},
	save: async function () {
		let script = this.model.getValue()
		if (script === '') {
			return this.editor.getFocus()
		}
		try {
			const currentLanguage = this.editor.getModel().getLanguageId()
			if (currentLanguage === 'javascript') {
				new Function(script)
			} else {
				script = await require('electron').ipcRenderer.invoke(
					'tsc-file',
					script
				)
				if (script.error) {
					throw script.error
				}
				script = script.res
			}
		} catch (error) {
			const get = Local.createGetter('confirmation')
			let continued = false
			return Window.confirm(
				{
					message: `${error.message}\n${get('compileError')}`,
					close: () => {
						if (!continued) {
							this.editor.getFocus()
						}
					}
				},
				[
					{
						label: get('yes'),
						click: () => {
							continued = true
							this.setChangeState(false)
							Command.save({ script })
						}
					},
					{
						label: get('no')
					}
				]
			)
		}
		this.setChangeState(false)
		Command.save({ script })
	},
	setChangeState: function (changed) {
		if (this.changed !== changed) {
			this.changed = changed
			if (changed) {
				this.mark.show()
			} else {
				this.mark.hide()
			}
		}
	},
	createEditor: function () {
		const { theme } = Title
		this.createTheme(theme)
		// 假设monaco对象已加载完毕
		this.editor = monaco.editor.create($('#script-script'), {
			language: 'javascript',
			theme: theme,
			tabSize: 2,
			fontSize: this.fontSize,
			lineHeight: this.lineHeight,
			mouseWheelScrollSensitivity: (this.lineHeight * 3) / 50,
			fastScrollSensitivity: 5,
			wordWrap: 'on',
			matchBrackets: 'never',
			folding: true,
			formatOnType: false,
			showDeprecated: false,
			selectionHighlight: true,
			detectIndentation: false,
			insertSpaces: true,
			roundedSelection: false,
			overviewRulerBorder: false,
			hideCursorInOverviewRuler: true,
			automaticLayout: false,
			hover: true,
			lightbulb: {
				enabled: false
			},
			minimap: {
				enabled: false
			},
			scrollbar: {
				useShadows: false,
				horizontalScrollbarSize: 12,
				verticalScrollbarSize: 12
			}
		})
		this.model = this.editor.getModel()

		$('#script-change').on('click', () => {
			const currentLanguage = this.editor.getModel().getLanguageId()
			let languageId =
				currentLanguage === 'javascript' ? 'typescript' : 'javascript'
			const get = Local.createGetter('confirmation')
			$('#script-change').name =
				currentLanguage === 'javascript'
					? 'script-change-ts'
					: 'script-change-js'
			$('#script-change').textContent = get(
				currentLanguage === 'javascript'
					? 'script-change-js'
					: 'script-change-ts'
			)
			monaco.editor.setModelLanguage(this.model, languageId)
		})

		// 编辑器 - 获得焦点
		this.editor.getFocus = function () {
			setTimeout(() => this.focus())
		}

		// 侦听键盘按下事件
		this.editor.onKeyDown((event) => {
			event = event.browserEvent
			if (event.ctrlKey) {
				switch (event.code) {
					case 'Enter':
						event.preventDefault()
						event.stopPropagation()
						this.save()
						break
				}
			}
		})

		// 侦听内容改变事件
		this.editor.onDidChangeModelContent((event) => {
			if (event.isFlush) return
			if (event.isUndoing || event.isRedoing) {
				const versionId = this.model.getAlternativeVersionId()
				const changed = this.versionId !== versionId
				if (this.changed !== changed) {
					this.setChangeState(changed)
				}
			} else if (!this.changed) {
				this.setChangeState(true)
			}
		})

		// 设置为空函数
		this.createEditor = Function.empty
	},
	// 给代码行元素着色
	colorizeCodeLines: function (items, code) {
		const text = document.createElement('text')
		const options = this.colorOptions
		text.textContent = code
		options.theme = Title.theme
		this.createTheme(Title.theme)
		monaco.editor.colorizeElement(text, options)
		let index = setInterval(() => {
			if (text.children.length !== 0) {
				clearInterval(index)
				const nodes = text.childNodes
				const nLength = nodes.length
				const sLength = nLength >> 1
				const spans = new Array(sLength)
				for (let i = 0; i < nLength; i += 2) {
					spans[i >> 1] = nodes[i]
				}
				for (let i = 0; i < sLength; i++) {
					items[i].appendChild(spans[i])
				}
			}
		})
	},
	// 创建主题
	createTheme: (function IIFE() {
		const themeData = {
			light: {
				base: 'vs',
				inherit: true,
				rules: [
					{ token: '', foreground: '#000000' },
					{ token: 'comment', foreground: '#008e00' },
					{ token: 'string', foreground: '#d01515' },
					{ token: 'string-bracket', foreground: '#0000c0' },
					{ token: 'string-escape', foreground: '#a000e6' },
					{ token: 'string-invalid', foreground: '#ff0000' },
					{ token: 'number', foreground: '#f06000' },
					{ token: 'property', foreground: '#000000' },
					{ token: 'function', foreground: '#ff0080' },
					{ token: 'class', foreground: '#000000' },
					{ token: 'regexp', foreground: '#d01515' },
					{ token: 'regexp-bracket', foreground: '#0000c0' },
					{ token: 'regexp-escape', foreground: '#a000e6' },
					{ token: 'regexp-escape-control', foreground: '#585cf6' },
					{ token: 'regexp-escape-end', foreground: '#ff8000' },
					{ token: 'regexp-range', foreground: '#0060a0' },
					{ token: 'regexp-invalid', foreground: '#ff0000' },
					{ token: 'regexp-flag', foreground: '#40a0ff' },
					{ token: 'keyword', foreground: '#c800a4' },
					{ token: 'keyword-declaration', foreground: '#c800a4' },
					{ token: 'keyword-operation', foreground: '#c800a4' },
					{ token: 'keyword-constant', foreground: '#0020e0' },
					{ token: 'keyword-builtin', foreground: '#0020e0' },
					{ token: 'keyword-highlight', foreground: '#000000' },
					{ token: 'identifier', foreground: '#1818c0' },
					{ token: 'identifier-global', foreground: '#000000' },
					{ token: 'flag', foreground: '#585cf6' },
					{ token: 'operator', foreground: '#c800a4' },
					{ token: 'delimiter', foreground: '#000000' },
					{ token: 'delimiter-bracket', foreground: '#000000' },
					{
						token: 'delimiter-bracket-invalid',
						foreground: '#ff0000'
					}
				],
				colors: {
					'editor.background': '#ffffff',
					'editorWidget.background': '#f0f0f0',
					'editorWidget.border': '#00000000',
					'editorHoverWidget.background': '#f0f0f0',
					'editorHoverWidget.border': '#c0c0c0',
					'editorCursor.foreground': '#000000',
					'editor.wordHighlightStrongBackground': '#c0ffe080',
					'editor.lineHighlightBorder': '#00000000',
					'editor.selectionBackground': '#add6ff',
					'editor.inactiveSelectionBackground': '#e5ebf1',
					'editor.findMatchBackground': '#80ff80',
					'editor.findMatchHighlightBackground': '#00000000',
					'editorSuggestWidget.background': '#f0f0f0',
					'editorSuggestWidget.border': '#c0c0c0',
					'editorIndentGuide.background': '#f0f0f0',
					'editorIndentGuide.activeBackground': '#e0e0e0',
					'editorLineNumber.foreground': '#a0a0a0',
					'editorLineNumber.activeForeground': '#404040',
					'dropdown.background': '#ffffff',
					'menu.border': '#c0c0c0',
					'input.background': '#ffffff',
					'input.foreground': '#000000',
					'input.border': '#c0c0c0',
					'widget.shadow': '#00000000',
					focusBorder: '#0050a0',
					contrastBorder: '#c0c0c0',
					'list.activeSelectionBackground': '#e6f3ff',
					'list.activeSelectionForeground': '#000000',
					'list.highlightForeground': '#b00080',
					'list.focusHighlightForeground': '#b00080'
				}
			},
			dark: {
				base: 'vs-dark',
				inherit: true,
				rules: [
					{ token: '', foreground: '#dad6cd' },
					{ token: 'comment', foreground: '#608b4e' },
					{ token: 'string', foreground: '#a9d157' },
					{ token: 'string-bracket', foreground: '#e882b2' },
					{ token: 'string-escape', foreground: '#797be6' },
					{ token: 'string-invalid', foreground: '#f44747' },
					{ token: 'number', foreground: '#99cc66' },
					{ token: 'property', foreground: '#dad6cd' },
					{ token: 'function', foreground: '#e8dcaa' },
					{ token: 'class', foreground: '#4ec9b0' },
					{ token: 'regexp', foreground: '#a9d157' },
					{ token: 'regexp-bracket', foreground: '#e882b2' },
					{ token: 'regexp-escape', foreground: '#797be6' },
					{ token: 'regexp-escape-control', foreground: '#5bdbb1' },
					{ token: 'regexp-escape-end', foreground: '#cb6a27' },
					{ token: 'regexp-range', foreground: '#37aae4' },
					{ token: 'regexp-invalid', foreground: '#f44747' },
					{ token: 'regexp-flag', foreground: '#00d2e5' },
					{ token: 'keyword', foreground: '#569cd6' },
					{ token: 'keyword-declaration', foreground: '#569cd6' },
					{ token: 'keyword-operation', foreground: '#3e8f9a' },
					{ token: 'keyword-constant', foreground: '#3299cc' },
					{ token: 'keyword-builtin', foreground: '#6d9cbe' },
					{ token: 'keyword-highlight', foreground: '#7aca3c' },
					{ token: 'identifier', foreground: '#b0e0e6' },
					{ token: 'identifier-global', foreground: '#9ed34e' },
					{ token: 'flag', foreground: '#00d2e5' },
					{ token: 'operator', foreground: '#3e8f9a' },
					{ token: 'delimiter', foreground: '#dad6cd' },
					{ token: 'delimiter-bracket', foreground: '#dad6cd' },
					{
						token: 'delimiter-bracket-invalid',
						foreground: '#f44747'
					}
				],
				colors: {
					'editor.background': '#18191a',
					'editorWidget.background': '#242628',
					'editorWidget.border': '#00000000',
					'editorHoverWidget.background': '#1c1e20',
					'editorHoverWidget.border': '#101010',
					'editorCursor.foreground': '#ffffff',
					'editor.wordHighlightStrongBackground': '#0060a080',
					'editor.lineHighlightBorder': '#00000000',
					'editor.selectionBackground': '#5a286f',
					'editor.inactiveSelectionBackground': '#7e668a',
					'editor.findMatchBackground': '#4030c0',
					'editor.findMatchHighlightBackground': '#00000000',
					'editorSuggestWidget.background': '#1c1e20',
					'editorSuggestWidget.border': '#101010',
					'editorIndentGuide.background': '#2c2c2c',
					'editorIndentGuide.activeBackground': '#3c3c3c',
					'editorLineNumber.foreground': '#7d7b77',
					'editorLineNumber.activeForeground': '#bebcb8',
					'dropdown.background': '#1c1e20',
					'dropdown.foreground': '#d8d8d8',
					'menu.border': '#101010',
					'input.background': '#161718',
					'input.foreground': '#d8d8d8',
					'input.border': '#000000',
					'widget.shadow': '#00000000',
					focusBorder: '#0080ff',
					contrastBorder: '#101010',
					'list.activeSelectionBackground': '#303234',
					'list.activeSelectionForeground': '#d4d4d4',
					'list.highlightForeground': '#80e0e0',
					'list.focusHighlightForeground': '#80e0e0'
				}
			}
		}
		return function (theme) {
			const options = themeData[theme]
			if (options instanceof Object && window.monaco instanceof Object) {
				monaco.editor.defineTheme(theme, options)
				themeData[theme] = null
			}
		}
	})()
}

// 自定义指令
Command.custom = {
	customFolder: null,
	commandNameMap: null,
	windowX: null,
	windowY: null,
	parsingScript: { id: '', parameters: null },
	loadedScript: { id: '', parameters: null },
	windowFrame: $('#scriptCommand'),
	parameterPane: $('#scriptCommand-parameter-pane'),
	parameterGrid: $('#scriptCommand-parameter-grid'),

	// 初始化
	initialize: function () {
		window.on('localize', this.windowLocalize)
		$('#scriptCommand-confirm').on('click', this.save)

		// 参数面板 - 设置获取数据方法
		const scriptList = [this.loadedScript]
		this.parameterPane.getData = () => scriptList

		// 参数面板 - 调整大小时回调
		this.parameterPane.onResize = () => {
			const height = grid.clientHeight
			this.windowFrame.style.height = `${height + 78}px`
			// 如果窗口被拖动过会重置位置，不过影响不大
			this.windowFrame.absolute(this.windowX, this.windowY)
		}

		// 参数面板 - 重新创建细节框方法
		const box = $('#scriptCommand-parameter-detail')
		const grid = this.parameterGrid
		const wrap = { box, grid, children: [] }
		box.wrap = wrap
		this.parameterPane.createDetailBox = function () {
			return wrap
		}

		// 参数面板 - 重写清除内容方法
		this.parameterPane.clear = function () {
			this.metas = []
			const { wraps } = this
			if (wraps.length !== 0) {
				const { children, box } = wraps[0]
				let i = children.length
				while (--i >= 0) {
					this.recycle(children[i])
				}
				box.meta = null
				box.data = null
				children.length = 0
				wraps.length = 0
			}
			window.off('script-change', this.scriptChange)
		}

		// 窗口 - 已关闭事件
		this.windowFrame.on('closed', (event) => {
			this.loadedScript.parameters = null
			this.parameterPane.clear()
		})
	},

	// 解析自定义指令
	parse: function (id, parameters) {
		// 如果不存在脚本，则返回ID名称
		const meta = Data.scripts[id]
		const name = this.commandNameMap[id]
		if (meta === undefined || name === undefined) {
			const label = Local.get('command.invalidCommand')
			const cmdId = Command.parseUnlinkedId(id)
			return [{ color: 'invalid' }, { text: `${label}: ${cmdId}` }]
		}
		// 重构脚本参数
		const script = this.parsingScript
		script.id = id
		script.parameters = parameters
		PluginManager.reconstruct(script)
		// 获取重构后的参数
		parameters = script.parameters
		script.parameters = null
		// 如果不带参数，直接返回指令名称
		const mParameters = meta.parameters
		if (mParameters.length === 0) {
			return [{ color: 'custom' }, { text: name }]
		}
		// 获取指令参数
		const words = Command.words
		const states = meta.manager.states
		for (const parameter of mParameters) {
			const { type, key } = parameter
			const value = parameters[key]
			if (states[key] === false) {
				continue
			}
			switch (type) {
				case 'boolean':
					words.push(Command.setBooleanColor(value))
					continue
				case 'number':
					words.push(Command.setNumberColor(value))
					continue
				case 'variable-number':
					words.push(Command.parseVariableNumber(value))
					continue
				case 'string':
					words.push(Command.setStringColor(`"${value}"`))
					continue
				case 'option': {
					const index = parameter.options.indexOf(value)
					if (index !== -1) {
						const { name } = parameter.dataItems[index]
						words.push(meta.langMap.update().get(name))
					}
					continue
				}
				case 'easing':
					words.push(Data.easings.map[value].name)
					continue
				case 'team':
					words.push(Data.teams.map[value].name)
					continue
				case 'variable':
					words.push(
						value
							? Command.parseVariable(
									{ type: 'global', key: value },
									'any'
								)
							: Token('none')
					)
					continue
				case 'attribute':
					words.push(Command.parseAttributeKey('', value, 'object'))
					continue
				case 'attribute-key':
					words.push(Command.parseAttributeKey('', value, 'string'))
					continue
				case 'attribute-group':
					words.push(Command.parseAttributeGroup(value))
					continue
				case 'enum':
				case 'enum-value':
					words.push(Command.parseEnumString(value))
					continue
				case 'enum-group':
					words.push(Command.parseEnumGroup(value))
					continue
				case 'file':
				case 'image':
				case 'audio':
					words.push(Command.parseFileName(value))
					continue
				case 'variable-getter':
				case 'variable-setter':
					words.push(Command.parseVariable(value, 'any'))
					continue
				case 'actor-getter':
					words.push(Command.parseActor(value))
					continue
				case 'skill-getter':
					words.push(Command.parseSkill(value))
					continue
				case 'state-getter':
					words.push(Command.parseState(value))
					continue
				case 'equipment-getter':
					words.push(Command.parseEquipment(value))
					continue
				case 'item-getter':
					words.push(Command.parseItem(value))
					continue
				case 'element-getter':
					words.push(Command.parseElement(value))
					continue
				case 'position-getter':
					words.push(Command.parsePosition(value))
					continue
				case 'number[]': {
					const numbers = value.slice(0, 5)
					for (let i = 0; i < numbers.length; i++) {
						numbers[i] = Command.setNumberColor(numbers[i])
					}
					if (value.length > 5) {
						numbers.push(Token('...'))
					}
					words.push(
						Token('[') + numbers.join(Token(', ')) + Token(']')
					)
					continue
				}
				case 'string[]': {
					const strings = value.slice(0, 5)
					for (let i = 0; i < strings.length; i++) {
						strings[i] = Command.setStringColor(
							`"${Command.parseMultiLineString(strings[i])}"`
						)
					}
					if (value.length > 5) {
						numbers.push(Token('...'))
					}
					words.push(
						Token('[') + strings.join(Token(', ')) + Token(']')
					)
					continue
				}
				case 'keycode':
					words.push(
						value ? Command.setStringColor(value) : Token('null')
					)
					continue
				case 'color':
					words.push(Command.parseHexColor(value))
					continue
			}
		}
		return [
			{ color: 'custom' },
			{ text: name + Token(': ') },
			{ text: words.join() }
		]
	},

	// 加载自定义指令
	load: function (id, parameters) {
		this.loadedScript.id = id
		this.loadedScript.parameters = Object.clone(parameters)
		this.windowX = Window.absolutePos.x
		this.windowY = Window.absolutePos.y
		this.parameterPane.update()
		const selector = Layout.focusableSelector
		this.parameterPane.querySelector(selector)?.getFocus()
		this.windowFrame.setTitle(this.commandNameMap[id])
	},

	// 保存参数
	save: function () {
		Command.save(Command.custom.loadedScript.parameters ?? {})
	},

	// 加载指令列表
	loadCommandList: async function () {
		if (!Data.commands) return
		const { list } = CommandSuggestion
		if (!this.customFolder) {
			if (list.data instanceof Promise) {
				await list.data
			}
			list.data.push(
				(this.customFolder = {
					class: 'folder',
					value: 'custom',
					expanded: true,
					children: null
				})
			)
		}
		const commands = []
		const commandNameMap = {}
		for (const command of Data.commands) {
			const id = command.id
			let meta = Data.scripts[id]
			// 可能出现脚本未加载完毕的情况
			if (meta instanceof Promise) {
				meta = await meta
			}
			if (!meta || id in commandNameMap) {
				continue
			}
			const map = meta.langMap.update()
			const name =
				command.alias ||
				map.get(meta.overview.plugin) ||
				Command.parseFileName(id)
			commandNameMap[id] = name
			commands.push({
				class: 'custom',
				value: id,
				name: name,
				desc: map.get(meta.overview.desc),
				keywords: command.keywords,
				unspacedName: String.compress(name)
			})
		}
		this.customFolder.children = commands
		this.commandNameMap = commandNameMap
		CommandSuggestion.windowLocalize()
		// 重新构建指令项目的父对象引用
		TreeList.createParents(commands, this.customFolder)
	},

	// 窗口 - 本地化事件
	windowLocalize: function (event) {
		if (Command.custom.commandNameMap) {
			Command.custom.loadCommandList()
		}
	}
}
