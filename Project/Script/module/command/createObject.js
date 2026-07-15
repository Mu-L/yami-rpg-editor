'use strict'

Command.cases.createObject = {
	initialize: function () {
		$('#createObject-confirm').on('click', this.save)
	},
	parse: function ({ presetId, position }) {
		const words = Command.words
			.push(Command.parsePresetObject(presetId))
			.push(Command.parsePosition(position))
		return [
			{ color: 'object' },
			{ text: Local.get('command.createObject') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		presetId = '',
		position = { type: 'actor', actor: { type: 'trigger' } }
	}) {
		const write = getElementWriter('createObject')
		write('presetId', presetId)
		write('position', position)
		$('#createObject-presetId').getFocus()
	},
	save: function () {
		const read = getElementReader('createObject')
		const presetId = read('presetId')
		if (presetId === '') {
			return $('#createObject-presetId').getFocus()
		}
		const position = read('position')
		Command.save({ presetId, position })
	}
}
