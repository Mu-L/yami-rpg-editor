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
// Command.cases.showText extracted -> module/command/showText.js

// 显示选项
// Command.cases.showChoices extracted -> module/command/showChoices.js

// 注释
// Command.cases.comment extracted -> module/command/comment.js

// 设置布尔值
// Command.cases.setBoolean extracted -> module/command/setBoolean.js

// 设置数值
// Command.cases.setNumber extracted -> module/command/setNumber.js

// 设置字符串
// Command.cases.setString extracted -> module/command/setString.js

// 设置对象
// Command.cases.setObject extracted -> module/command/setObject.js

// 设置列表
// Command.cases.setList extracted -> module/command/setList.js

// 删除变量
// Command.cases.deleteVariable extracted -> module/command/deleteVariable.js

// 分支条件
// Command.cases.if extracted -> module/command/if.js

// 匹配
// Command.cases.switch extracted -> module/command/switch.js

// 循环
// Command.cases.loop extracted -> module/command/loop.js

// 遍历
// Command.cases.forEach extracted -> module/command/forEach.js

// 跳出循环
// Command.cases.break extracted -> module/command/break.js

// 继续循环
// Command.cases.continue extracted -> module/command/continue.js

// 独立执行
// Command.cases.independent extracted -> module/command/independent.js

// 调用事件
// Command.cases.callEvent extracted -> module/command/callEvent.js

// 返回值
// Command.cases.return extracted -> module/command/return.js

// 停止事件
// Command.cases.stopEvent extracted -> module/command/stopEvent.js

// 注册事件
// Command.cases.registerEvent extracted -> module/command/registerEvent.js

// 设置事件
// Command.cases.setEvent extracted -> module/command/setEvent.js

// 过渡
// Command.cases.transition extracted -> module/command/transition.js

// 指令块
// Command.cases.block extracted -> module/command/block.js

// 标签
// Command.cases.label extracted -> module/command/label.js

// 跳转到
// Command.cases.jumpTo extracted -> module/command/jumpTo.js

// 等待
// Command.cases.wait extracted -> module/command/wait.js

// 创建元素
// Command.cases.createElement extracted -> module/command/createElement.js

// 设置图像
// Command.cases.setImage extracted -> module/command/setImage.js

// 加载图像
// Command.cases.loadImage extracted -> module/command/loadImage.js

// 改变图像色调
// Command.cases.tintImage extracted -> module/command/tintImage.js

// 设置文本
// Command.cases.setText extracted -> module/command/setText.js

// 设置文本框
// Command.cases.setTextBox extracted -> module/command/setTextBox.js

// 设置对话框
// Command.cases.setDialogBox extracted -> module/command/setDialogBox.js

// 控制对话框
// Command.cases.controlDialog extracted -> module/command/controlDialog.js

// 设置进度条
// Command.cases.setProgressBar extracted -> module/command/setProgressBar.js

// 设置按钮
// Command.cases.setButton extracted -> module/command/setButton.js

// 控制按钮
// Command.cases.controlButton extracted -> module/command/controlButton.js

// 设置动画
// Command.cases.setAnimation extracted -> module/command/setAnimation.js

// 设置视频
// Command.cases.setVideo extracted -> module/command/setVideo.js

// 设置窗口
// Command.cases.setWindow extracted -> module/command/setWindow.js

// 等待视频结束
// Command.cases.waitForVideo extracted -> module/command/waitForVideo.js

// 设置元素
// Command.cases.setElement extracted -> module/command/setElement.js

// 嵌套元素
// Command.cases.nestElement extracted -> module/command/nestElement.js

// 移动元素
// Command.cases.moveElement extracted -> module/command/moveElement.js

// 删除元素
// Command.cases.deleteElement extracted -> module/command/deleteElement.js

// 设置指针事件根元素
// Command.cases.setPointerEventRoot extracted -> module/command/setPointerEventRoot.js

// 设置焦点
// Command.cases.setFocus extracted -> module/command/setFocus.js

// 创建对象
// Command.cases.createObject extracted -> module/command/createObject.js

// 移动光源
// Command.cases.moveLight extracted -> module/command/moveLight.js

// 删除对象
// Command.cases.deleteObject extracted -> module/command/deleteObject.js

// 设置状态
// Command.cases.setState extracted -> module/command/setState.js

// 播放动画
// Command.cases.playAnimation extracted -> module/command/playAnimation.js

// 设置对象动画
// Command.cases.setObjectAnimation extracted -> module/command/setObjectAnimation.js

// 播放音频
// Command.cases.playAudio extracted -> module/command/playAudio.js

// 停止播放音频
// Command.cases.stopAudio extracted -> module/command/stopAudio.js

// 设置音量
// Command.cases.setVolume extracted -> module/command/setVolume.js

// 设置声像
// Command.cases.setPan extracted -> module/command/setPan.js

// 设置混响
// Command.cases.setReverb extracted -> module/command/setReverb.js

// 设置循环
// Command.cases.setLoop extracted -> module/command/setLoop.js

// 保存音频
// Command.cases.saveAudio extracted -> module/command/saveAudio.js

// 恢复音频
// Command.cases.restoreAudio extracted -> module/command/restoreAudio.js

// 创建角色
// Command.cases.createActor extracted -> module/command/createActor.js

// 移动角色
// Command.cases.moveActor extracted -> module/command/moveActor.js

// 跟随角色
// Command.cases.followActor extracted -> module/command/followActor.js

// 平移角色
// Command.cases.translateActor extracted -> module/command/translateActor.js

// 增减仇恨值
// Command.cases.changeThreat extracted -> module/command/changeThreat.js

// 设置体重
// Command.cases.setWeight extracted -> module/command/setWeight.js

// 设置移动速度
// Command.cases.setMovementSpeed extracted -> module/command/setMovementSpeed.js

// 设置角度
// Command.cases.setAngle extracted -> module/command/setAngle.js

// 固定角度
// Command.cases.fixAngle extracted -> module/command/fixAngle.js

// 设置激活状态
// Command.cases.setActive extracted -> module/command/setActive.js

// 获取角色
// Command.cases.getActor extracted -> module/command/getActor.js

// 获取多个角色
// Command.cases.getMultipleActors extracted -> module/command/getMultipleActors.js

// 删除角色
// Command.cases.deleteActor extracted -> module/command/deleteActor.js

// 设置玩家角色
// Command.cases.setPlayerActor extracted -> module/command/setPlayerActor.js

// 设置队伍成员
// Command.cases.setPartyMember extracted -> module/command/setPartyMember.js

// 改变通行区域
// Command.cases.changePassableTerrain extracted -> module/command/changePassableTerrain.js

// 改变角色队伍
// Command.cases.changeActorTeam extracted -> module/command/changeActorTeam.js

// 改变角色状态
// Command.cases.changeActorState extracted -> module/command/changeActorState.js

// 改变角色装备
// Command.cases.changeActorEquipment extracted -> module/command/changeActorEquipment.js

// 改变角色技能
// Command.cases.changeActorSkill extracted -> module/command/changeActorSkill.js

// 改变角色头像
// Command.cases.changeActorPortrait extracted -> module/command/changeActorPortrait.js

// 改变角色动画
// Command.cases.changeActorAnimation extracted -> module/command/changeActorAnimation.js

// 改变角色精灵图
// Command.cases.changeActorSprite extracted -> module/command/changeActorSprite.js

// 改变角色动作
// Command.cases.changeActorMotion extracted -> module/command/changeActorMotion.js

// 播放角色动画
// Command.cases.playActorAnimation extracted -> module/command/playActorAnimation.js

// 停止角色动画
// Command.cases.stopActorAnimation extracted -> module/command/stopActorAnimation.js

// 添加动画组件
// Command.cases.addAnimationComponent extracted -> module/command/addAnimationComponent.js

// 设置动画组件
// Command.cases.setAnimationComponent extracted -> module/command/setAnimationComponent.js

// 移除动画组件
// Command.cases.removeAnimationComponent extracted -> module/command/removeAnimationComponent.js

// 创建全局角色
// Command.cases.createGlobalActor extracted -> module/command/createGlobalActor.js

// 转移全局角色
// Command.cases.transferGlobalActor extracted -> module/command/transferGlobalActor.js

// 删除全局角色
// Command.cases.deleteGlobalActor extracted -> module/command/deleteGlobalActor.js

// 设置目标
// Command.cases.setTarget extracted -> module/command/setTarget.js

// 获取目标
// Command.cases.getTarget extracted -> module/command/getTarget.js

// 添加目标
// Command.cases.appendTarget extracted -> module/command/appendTarget.js

// 移除目标
// Command.cases.removeTarget extracted -> module/command/removeTarget.js

// 探测目标
// Command.cases.detectTargets extracted -> module/command/detectTargets.js

// 放弃目标
// Command.cases.discardTargets extracted -> module/command/discardTargets.js

// 重置目标列表
// Command.cases.resetTargets extracted -> module/command/resetTargets.js

// 渲染轮廓
// Command.cases.renderOutline extracted -> module/command/renderOutline.js

// 施放技能
// Command.cases.castSkill extracted -> module/command/castSkill.js

// 设置技能
// Command.cases.setSkill extracted -> module/command/setSkill.js

// 创建触发器
// Command.cases.createTrigger extracted -> module/command/createTrigger.js

// 设置触发器速度
// Command.cases.setTriggerSpeed extracted -> module/command/setTriggerSpeed.js

// 设置触发器角度
// Command.cases.setTriggerAngle extracted -> module/command/setTriggerAngle.js

// 设置触发器持续时间
// Command.cases.setTriggerDuration extracted -> module/command/setTriggerDuration.js

// 设置触发器动作
// Command.cases.setTriggerMotion extracted -> module/command/setTriggerMotion.js

// 设置库存
// Command.cases.setInventory extracted -> module/command/setInventory.js

// 使用物品
// Command.cases.useItem extracted -> module/command/useItem.js

// 设置物品
// Command.cases.setItem extracted -> module/command/setItem.js

// 设置冷却时间
// Command.cases.setCooldown extracted -> module/command/setCooldown.js

// 设置快捷键
// Command.cases.setShortcut extracted -> module/command/setShortcut.js

// 激活场景
// Command.cases.activateScene extracted -> module/command/activateScene.js

// 加载场景
// Command.cases.loadScene extracted -> module/command/loadScene.js

// 加载子场景
// Command.cases.loadSubscene extracted -> module/command/loadSubscene.js

// 卸载子场景
// Command.cases.unloadSubscene extracted -> module/command/unloadSubscene.js

// 删除场景
// Command.cases.deleteScene extracted -> module/command/deleteScene.js

// 限制摄像机边界
// Command.cases.clampCamera extracted -> module/command/clampCamera.js

// 解除摄像机边界
// Command.cases.unclampCamera extracted -> module/command/unclampCamera.js

// 移动摄像机
// Command.cases.moveCamera extracted -> module/command/moveCamera.js

// 设置缩放率
// Command.cases.setZoomFactor extracted -> module/command/setZoomFactor.js

// 设置环境光
// Command.cases.setAmbientLight extracted -> module/command/setAmbientLight.js

// 改变画面色调
// Command.cases.tintScreen extracted -> module/command/tintScreen.js

// 震动屏幕
// Command.cases.shakeScreen extracted -> module/command/shakeScreen.js

// 设置图块
// Command.cases.setTile extracted -> module/command/setTile.js

// 删除图块
// Command.cases.deleteTile extracted -> module/command/deleteTile.js

// 设置地形
// Command.cases.setTerrain extracted -> module/command/setTerrain.js

// 设置游戏速度
// Command.cases.setGameSpeed extracted -> module/command/setGameSpeed.js

// 设置鼠标指针
// Command.cases.setCursor extracted -> module/command/setCursor.js

// 设置队伍关系
// Command.cases.setTeamRelation extracted -> module/command/setTeamRelation.js

// 开关碰撞系统
// Command.cases.switchCollisionSystem extracted -> module/command/switchCollisionSystem.js

// 游戏数据
// Command.cases.gameData extracted -> module/command/gameData.js

// 模拟按键
// Command.cases.simulateKey extracted -> module/command/simulateKey.js

// 设置语言
// Command.cases.setLanguage extracted -> module/command/setLanguage.js

// 设置分辨率
// Command.cases.setResolution extracted -> module/command/setResolution.js

// 重置游戏
// Command.cases.reset extracted -> module/command/reset.js

// 暂停游戏
// Command.cases.pauseGame extracted -> module/command/pauseGame.js

// 继续游戏
// Command.cases.continueGame extracted -> module/command/continueGame.js

// 阻止场景输入事件
// Command.cases.preventSceneInput extracted -> module/command/preventSceneInput.js

// 恢复场景输入事件
// Command.cases.restoreSceneInput extracted -> module/command/restoreSceneInput.js

// 执行脚本
// Command.cases.script extracted -> module/command/script.js

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

window.Command = Command
