'use strict'

Command.cases.setPartyMember = {
	initialize: function () {
		$('#setPartyMember-confirm').on('click', this.save)

		// 创建操作选项
		$('#setPartyMember-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' }
		])
	},
	parse: function ({ operation, actor }) {
		const words = Command.words
			.push(Local.get('command.setPartyMember.' + operation))
			.push(Command.parseActor(actor))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setPartyMember') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ operation = 'add', actor = { type: 'trigger' } }) {
		const write = getElementWriter('setPartyMember')
		write('operation', operation)
		write('actor', actor)
		$('#setPartyMember-operation').getFocus()
	},
	save: function () {
		const read = getElementReader('setPartyMember')
		const operation = read('operation')
		const actor = read('actor')
		Command.save({ operation, actor })
	}
}
