'use strict'

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
