'use strict'

Command.cases.setTriggerMotion = new CommandSchema({
	name: 'setTriggerMotion',
	customParse({ trigger, motion }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseEnumString(motion))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerMotion') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ trigger = { type: 'trigger' }, motion = '' }) {
		const write = getElementWriter('setTriggerMotion')
		write('trigger', trigger)
		write('motion', motion)
		$('#setTriggerMotion-trigger').getFocus()
	},
	customSave() {
		const read = getElementReader('setTriggerMotion')
		const motion = read('motion')
		if (motion === '') {
			return $('#setTriggerMotion-motion').getFocus()
		}
		Command.save({ trigger: read('trigger'), motion })
	}
})
