'use strict'

Command.cases.changePassableTerrain = new CommandSchema({
	name: 'changePassableTerrain',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'passage', default: 'land' }
	],
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
	onLoad() {
		$('#changePassableTerrain-actor').getFocus()
	}
})
