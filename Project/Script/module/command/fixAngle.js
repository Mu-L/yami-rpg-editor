'use strict'

Command.cases.fixAngle = new CommandSchema({
	name: 'fixAngle',
	onInitialize() {
		$('#fixAngle-confirm').on('click', () => this.save())
		$('#fixAngle-fixed').loadItems([
			{ name: 'Fixed', value: true },
			{ name: 'Unfixed', value: false }
		])
	},
	customParse({ actor, fixed }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.fixAngle.fixed.' + fixed))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.fixAngle') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ actor = { type: 'trigger' }, fixed = true }) {
		const write = getElementWriter('fixAngle')
		write('actor', actor)
		write('fixed', fixed)
		$('#fixAngle-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('fixAngle')
		Command.save({ actor: read('actor'), fixed: read('fixed') })
	}
})
