'use strict'

Command.cases.setAngle = new CommandSchema({
	name: 'setAngle',
	onInitialize() {
		$('#setAngle-confirm').on('click', () => this.save())
		$('#setAngle-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#setAngle').on('open', function (event) {
			$('#setAngle-easingId').loadItems(Data.createEasingItems())
		})
		$('#setAngle').on('closed', function (event) {
			$('#setAngle-easingId').clear()
		})
	},
	customParse({ actor, angle, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseAngle(angle))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setAngle') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		actor = { type: 'trigger' },
		angle = { type: 'absolute', degrees: 0 },
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setAngle')
		write('actor', actor)
		write('angle', angle)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setAngle-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('setAngle')
		Command.save({
			actor: read('actor'),
			angle: read('angle'),
			easingId: read('easingId'),
			duration: read('duration'),
			wait: read('wait')
		})
	}
})
