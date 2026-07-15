'use strict'

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
