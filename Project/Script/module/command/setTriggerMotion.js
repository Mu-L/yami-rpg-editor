'use strict'

Command.cases.setTriggerMotion = {
	initialize: function () {
		$('#setTriggerMotion-confirm').on('click', this.save)
	},
	parse: function ({ trigger, motion }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseEnumString(motion))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerMotion') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ trigger = { type: 'trigger' }, motion = '' }) {
		const write = getElementWriter('setTriggerMotion')
		write('trigger', trigger)
		write('motion', motion)
		$('#setTriggerMotion-trigger').getFocus()
	},
	save: function () {
		const read = getElementReader('setTriggerMotion')
		const trigger = read('trigger')
		const motion = read('motion')
		if (motion === '') {
			return $('#setTriggerMotion-motion').getFocus()
		}
		Command.save({ trigger, motion })
	}
}
