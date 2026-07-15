'use strict'

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
