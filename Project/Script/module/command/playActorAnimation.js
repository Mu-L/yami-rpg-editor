'use strict'

Command.cases.playActorAnimation = new CommandSchema({
	name: 'playActorAnimation',
	onInitialize() {
		$('#playActorAnimation-confirm').on('click', () => this.save())
		$('#playActorAnimation-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
	},
	parseSpeed(speed) {
		if (speed === 1) return ''
		return Command.parseVariableNumber(speed)
	},
	customParse({ actor, motion, speed, wait }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseEnumString(motion))
			.push(this.parseSpeed(speed))
			.push(Command.parseWait(wait))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.playActorAnimation') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		actor = { type: 'trigger' },
		motion = '',
		speed = 1,
		wait = false
	}) {
		const write = getElementWriter('playActorAnimation')
		write('actor', actor)
		write('motion', motion)
		write('speed', speed)
		write('wait', wait)
		$('#playActorAnimation-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('playActorAnimation')
		const motion = read('motion').trim()
		if (!motion) {
			return $('#playActorAnimation-motion').getFocus()
		}
		Command.save({
			actor: read('actor'),
			motion,
			speed: read('speed'),
			wait: read('wait')
		})
	}
})
