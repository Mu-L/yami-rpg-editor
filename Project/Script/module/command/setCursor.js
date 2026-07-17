'use strict'

Command.cases.setCursor = new CommandSchema({
	name: 'setCursor',
	fields: [{ key: 'image', default: '' }],
	customParse({ image }) {
		return [
			{ color: 'system' },
			{ text: Local.get('command.setCursor') + Token(': ') },
			{ text: Command.parseFileName(image) }
		]
	},
	onLoad() {
		$('#setCursor-image').getFocus()
	}
})
