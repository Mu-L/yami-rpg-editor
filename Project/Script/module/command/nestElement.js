'use strict'

Command.cases.nestElement = new CommandSchema({
	name: 'nestElement',
	fields: [
		{ key: 'parent', domId: 'parent', default: { type: 'trigger' } },
		{ key: 'child', domId: 'child', default: { type: 'latest' } }
	],
	customParse({ parent, child }) {
		const pElement = Command.parseElement(parent)
		const cElement = Command.parseElement(child)
		return [
			{ color: 'element' },
			{ text: Local.get('command.nestElement') + Token(': ') },
			{ text: pElement + Token(' -> ') + cElement }
		]
	},
	onLoad() {
		$('#nestElement-parent').getFocus()
	}
})
