'use strict'

Command.cases.setPartyMember = new CommandSchema({
	name: 'setPartyMember',
	onInitialize() {
		$('#setPartyMember-confirm').on('click', () => this.save())
		$('#setPartyMember-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' }
		])
	},
	customParse({ operation, actor }) {
		const words = Command.words
			.push(Local.get('command.setPartyMember.' + operation))
			.push(Command.parseActor(actor))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setPartyMember') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ operation = 'add', actor = { type: 'trigger' } }) {
		const write = getElementWriter('setPartyMember')
		write('operation', operation)
		write('actor', actor)
		$('#setPartyMember-operation').getFocus()
	},
	customSave() {
		const read = getElementReader('setPartyMember')
		Command.save({ operation: read('operation'), actor: read('actor') })
	}
})
