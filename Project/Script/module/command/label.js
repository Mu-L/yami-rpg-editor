'use strict'

Command.cases.label = {
	initialize: function () {
		$('#label-confirm').on('click', this.save)
	},
	parse: function ({ name }) {
		return [
			{ color: 'flow' },
			{ text: Local.get('command.label') + Token(': ') },
			{ color: 'label' },
			{ text: name }
		]
	},
	load: function ({ name = '' }) {
		$('#label-name').write(name)
		$('#label-name').getFocus('all')
	},
	save: function () {
		const name = $('#label-name').read().trim()
		if (name === '') {
			return $('#label-name').getFocus()
		}
		Command.save({ name })
	}
}
