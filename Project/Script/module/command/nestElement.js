'use strict'

Command.cases.nestElement = {
	initialize: function () {
		$('#nestElement-confirm').on('click', this.save)
	},
	parse: function ({ parent, child }) {
		const pElement = Command.parseElement(parent)
		const cElement = Command.parseElement(child)
		return [
			{ color: 'element' },
			{ text: Local.get('command.nestElement') + Token(': ') },
			{ text: pElement + Token(' -> ') + cElement }
		]
	},
	load: function ({
		parent = { type: 'trigger' },
		child = { type: 'latest' }
	}) {
		$('#nestElement-parent').write(parent)
		$('#nestElement-child').write(child)
		$('#nestElement-parent').getFocus()
	},
	save: function () {
		const parent = $('#nestElement-parent').read()
		const child = $('#nestElement-child').read()
		Command.save({ parent, child })
	}
}
