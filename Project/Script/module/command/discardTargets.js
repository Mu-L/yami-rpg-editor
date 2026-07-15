'use strict'

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
