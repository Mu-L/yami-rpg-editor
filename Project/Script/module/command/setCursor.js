'use strict'

Command.cases.setCursor = {
	initialize: function () {
		$('#setCursor-confirm').on('click', this.save)
	},
	parse: function ({ image }) {
		return [
			{ color: 'system' },
			{ text: Local.get('command.setCursor') + Token(': ') },
			{ text: Command.parseFileName(image) }
		]
	},
	load: function ({ image = '' }) {
		const write = getElementWriter('setCursor')
		write('image', image)
		$('#setCursor-image').getFocus()
	},
	save: function () {
		const read = getElementReader('setCursor')
		const image = read('image')
		Command.save({ image })
	}
}
