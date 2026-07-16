'use strict'

Command.cases.nestElement = new CommandSchema({
	name: 'nestElement',
	customParse({ parent, child }) {
		const pElement = Command.parseElement(parent)
		const cElement = Command.parseElement(child)
		return [
			{ color: 'element' },
			{ text: Local.get('command.nestElement') + Token(': ') },
			{ text: pElement + Token(' -> ') + cElement }
		]
	},
	customLoad({ parent = { type: 'trigger' }, child = { type: 'latest' } }) {
		$('#nestElement-parent').write(parent)
		$('#nestElement-child').write(child)
		$('#nestElement-parent').getFocus()
	},
	customSave() {
		Command.save({
			parent: $('#nestElement-parent').read(),
			child: $('#nestElement-child').read()
		})
	}
})
