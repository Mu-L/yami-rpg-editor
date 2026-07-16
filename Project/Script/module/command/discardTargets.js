'use strict'

Command.cases.discardTargets = new CommandSchema({
	name: 'discardTargets',
	onInitialize() {
		$('#discardTargets-confirm').on('click', () => this.save())
		$('#discardTargets-selector').loadItems([
			{ name: 'Enemy', value: 'enemy' },
			{ name: 'Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Team Member Except Self', value: 'team-except-self' },
			{ name: 'Any Except Self', value: 'any-except-self' },
			{ name: 'Any', value: 'any' }
		])
	},
	customParse({ actor, selector, distance }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActorSelector(selector))
		if (distance !== 0) {
			words.push(Token('>=') + Command.parseVariableNumber(distance, 't'))
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.discardTargets') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		actor = { type: 'trigger' },
		selector = 'any',
		distance = 0
	}) {
		const write = getElementWriter('discardTargets')
		write('actor', actor)
		write('selector', selector)
		write('distance', distance)
		$('#discardTargets-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('discardTargets')
		Command.save({
			actor: read('actor'),
			selector: read('selector'),
			distance: read('distance')
		})
	}
})
