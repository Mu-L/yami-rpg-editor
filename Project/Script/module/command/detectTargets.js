'use strict'

Command.cases.detectTargets = new CommandSchema({
	name: 'detectTargets',
	onInitialize() {
		$('#detectTargets-confirm').on('click', () => this.save())
		$('#detectTargets-selector').loadItems([
			{ name: 'Enemy', value: 'enemy' },
			{ name: 'Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Team Member Except Self', value: 'team-except-self' },
			{ name: 'Any Except Self', value: 'any-except-self' },
			{ name: 'Any', value: 'any' }
		])
		$('#detectTargets-inSight').loadItems([
			{ name: 'Enabled', value: true },
			{ name: 'Disabled', value: false }
		])
	},
	parseInSight(inSight) {
		switch (inSight) {
			case true:
				return Local.get('command.detectTargets.inSight')
			case false:
				return ''
		}
	},
	customParse({ actor, distance, selector, inSight }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Token('≤') + Command.parseVariableNumber(distance, 't'))
			.push(Command.parseActorSelector(selector))
			.push(this.parseInSight(inSight))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.detectTargets') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		actor = { type: 'trigger' },
		distance = 0,
		selector = 'enemy',
		inSight = false
	}) {
		const write = getElementWriter('detectTargets')
		write('actor', actor)
		write('distance', distance)
		write('selector', selector)
		write('inSight', inSight)
		$('#detectTargets-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('detectTargets')
		const distance = read('distance')
		if (distance === 0) {
			return $('#detectTargets-distance').getFocus('all')
		}
		Command.save({
			actor: read('actor'),
			distance,
			selector: read('selector'),
			inSight: read('inSight')
		})
	}
})
