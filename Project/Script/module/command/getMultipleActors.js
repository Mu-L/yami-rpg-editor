'use strict'

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
