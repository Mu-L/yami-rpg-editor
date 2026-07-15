'use strict'

Command.cases.deleteObject = {
	initialize: function () {
		$('#deleteObject-confirm').on('click', this.save)
	},
	parse: function ({ object }) {
		return [
			{ color: 'object' },
			{ text: Local.get('command.deleteObject') + Token(': ') },
			{ text: Command.parseObject(object) }
		]
	},
	load: function ({ object = { type: 'trigger' } }) {
		$('#deleteObject-object').write(object)
		$('#deleteObject-object').getFocus()
	},
	save: function () {
		const object = $('#deleteObject-object').read()
		Command.save({ object })
	}
}
