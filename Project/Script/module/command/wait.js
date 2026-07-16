'use strict'

Command.cases.wait = new CommandSchema({
	name: 'wait',
	fields: [{ key: 'duration', domId: 'duration', default: 1 }],
	customParse({ duration }) {
		return [
			{ color: 'wait' },
			{ text: Local.get('command.wait') + Token(': ') },
			{ text: Command.parseVariableNumber(duration, 'ms') }
		]
	},
	onLoad() {
		$('#wait-duration').getFocus('all')
	}
})
