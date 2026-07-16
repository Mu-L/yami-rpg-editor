'use strict'

Command.cases.setCursor = new CommandSchema({
	name: 'setCursor',
	customParse({ image }) {
		return [
			{ color: 'system' },
			{ text: Local.get('command.setCursor') + Token(': ') },
			{ text: Command.parseFileName(image) }
		]
	},
	customLoad({ image = '' }) {
		const write = getElementWriter('setCursor')
		write('image', image)
		$('#setCursor-image').getFocus()
	},
	customSave() {
		Command.save({ image: getElementReader('setCursor')('image') })
	}
})
