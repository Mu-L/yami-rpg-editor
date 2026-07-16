'use strict'

// ******************************** 指令解析函数库 ********************************

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
	const fetchVariables = (commands) => {
		for (const command of commands) {
			const { id, params } = command
			if (id == null || id[0] === '!') continue
			Command.currentCommand = command
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
			const handler = this.cases[id]
			let contents
			try {
				contents = handler
					? handler.parse(params ?? {})
					: this.custom.parse(id, params ?? {})
			} catch (err) {
				reportError(err, `Command.fetchVariables (id=${id})`)
				contents = []
			}
			for (const content of contents) {
				if (content.children) {
					fetchVariables(content.children)
				}
			}
		}
		Command.currentCommand = null
	}
	fetchParameters(eventId)
	fetchVariables(commands)
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

// 解析事件类型
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
					if (end < start) {
						inserts.push({ text: text.slice(end, start) })
					}
					if (match[1] === 'textId') {
						inserts.push({ textId: match[2] })
					} else if (match[1] === 'tooltip') {
						inserts.push({ tooltip: match[2] })
					} else if (match[1] === 'class') {
						inserts.push({ class: match[2] })
					} else if (match[2] === '$_none_$') {
						inserts.push({ color: match[1] })
					} else {
						inserts.push(
							{ color: match[1] },
							{ text: match[2] },
							{ color: 'restore' }
						)
					}
					end = start + match[0].length
				}
				if (inserts.length !== 0) {
					if (end < text.length) {
						inserts.push({ text: text.slice(end) })
					}
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
