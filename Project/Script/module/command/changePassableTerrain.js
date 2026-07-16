'use strict'

Command.cases.changePassableTerrain = new CommandSchema({
	name: 'changePassableTerrain',
	onInitialize() {
		$('#changePassableTerrain-confirm').on('click', () => this.save())
		$('#changePassableTerrain-passage').loadItems([
			{ name: 'Land', value: 'land' },
			{ name: 'Water', value: 'water' },
			{ name: 'Unrestricted', value: 'unrestricted' }
		])
	},
	customParse({ actor, passage }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.changePassableTerrain.' + passage))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changePassableTerrain') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ actor = { type: 'trigger' }, passage = 'land' }) {
		const write = getElementWriter('changePassableTerrain')
		write('actor', actor)
		write('passage', passage)
		$('#changePassableTerrain-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('changePassableTerrain')
		Command.save({ actor: read('actor'), passage: read('passage') })
	}
})
