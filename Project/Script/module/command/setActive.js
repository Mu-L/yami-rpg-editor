'use strict'

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
