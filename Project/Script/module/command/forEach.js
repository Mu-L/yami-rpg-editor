'use strict'

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
