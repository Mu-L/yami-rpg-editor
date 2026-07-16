'use strict'

Command.cases.setActive = new CommandSchema({
	name: 'setActive',
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
	customLoad({ actor = { type: 'trigger' }, active = false }) {
		const write = getElementWriter('setActive')
		write('actor', actor)
		write('active', active)
		$('#setActive-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('setActive')
		Command.save({ actor: read('actor'), active: read('active') })
	}
})
