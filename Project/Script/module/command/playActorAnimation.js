'use strict'

Command.cases.playActorAnimation = {
	initialize: function () {
		$('#playActorAnimation-confirm').on('click', this.save)

		// 创建等待结束选项
		$('#playActorAnimation-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
	},
	parseSpeed: function (speed) {
		if (speed === 1) return ''
		return Command.parseVariableNumber(speed)
	},
	parse: function ({ actor, motion, speed, wait }) {
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
	load: function ({
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
	save: function () {
		const read = getElementReader('playActorAnimation')
		const actor = read('actor')
		const motion = read('motion').trim()
		const speed = read('speed')
		const wait = read('wait')
		if (!motion) {
			return $('#playActorAnimation-motion').getFocus()
		}
		Command.save({ actor, motion, speed, wait })
	}
}
