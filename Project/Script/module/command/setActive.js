'use strict'

Command.cases.setActive = new CommandSchema({
	name: 'setActive',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'active', default: false }
	],
	onInitialize() {
		$('#setActive-confirm').on('click', () => this.save())
		$('#setActive-active').loadItems([
			{ name: 'Active', value: true },
			{ name: 'Inactive', value: false }
		])
	},
	customParse({ actor, active }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.setActive.active.' + active))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setActive') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setActive-actor').getFocus()
	}
})
