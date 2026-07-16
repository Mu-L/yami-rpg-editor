'use strict'

Command.cases.waitForVideo = new CommandSchema({
	name: 'waitForVideo',
	fields: [
		{ key: 'element', domId: 'element', default: { type: 'trigger' } }
	],
	customParse({ element }) {
		return [
			{ color: 'element' },
			{ text: Local.get('command.waitForVideo') + Token(': ') },
			{ text: Command.parseElement(element) }
		]
	},
	onLoad() {
		$('#waitForVideo-element').getFocus()
	}
})
