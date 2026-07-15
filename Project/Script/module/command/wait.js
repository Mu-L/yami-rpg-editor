'use strict'

Command.cases.wait = {
	initialize: function () {
		$('#wait-confirm').on('click', this.save)
	},
	parse: function ({ duration }) {
		return [
			{ color: 'wait' },
			{ text: Local.get('command.wait') + Token(': ') },
			{ text: Command.parseVariableNumber(duration, 'ms') }
		]
	},
	load: function ({ duration = 1 }) {
		$('#wait-duration').write(duration)
		$('#wait-duration').getFocus('all')
	},
	save: function () {
		const duration = $('#wait-duration').read()
		Command.save({ duration })
	}
}
