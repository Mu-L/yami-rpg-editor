'use strict'

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
