'use strict'

Command.cases.waitForVideo = {
	initialize: function () {
		$('#waitForVideo-confirm').on('click', this.save)
	},
	parse: function ({ element }) {
		return [
			{ color: 'element' },
			{ text: Local.get('command.waitForVideo') + Token(': ') },
			{ text: Command.parseElement(element) }
		]
	},
	load: function ({ element = { type: 'trigger' } }) {
		$('#waitForVideo-element').write(element)
		$('#waitForVideo-element').getFocus()
	},
	save: function () {
		const element = $('#waitForVideo-element').read()
		Command.save({ element })
	}
}
