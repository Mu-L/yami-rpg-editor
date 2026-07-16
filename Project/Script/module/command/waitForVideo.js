'use strict'

Command.cases.waitForVideo = new CommandSchema({
	name: 'waitForVideo',
	customParse({ element }) {
		return [
			{ color: 'element' },
			{ text: Local.get('command.waitForVideo') + Token(': ') },
			{ text: Command.parseElement(element) }
		]
	},
	customLoad({ element = { type: 'trigger' } }) {
		$('#waitForVideo-element').write(element)
		$('#waitForVideo-element').getFocus()
	},
	customSave() {
		Command.save({ element: $('#waitForVideo-element').read() })
	}
})
