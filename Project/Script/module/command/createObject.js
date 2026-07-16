'use strict'

Command.cases.createObject = new CommandSchema({
	name: 'createObject',
	customParse({ presetId, position }) {
		const words = Command.words
			.push(Command.parsePresetObject(presetId))
			.push(Command.parsePosition(position))
		return [
			{ color: 'object' },
			{ text: Local.get('command.createObject') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		presetId = '',
		position = { type: 'actor', actor: { type: 'trigger' } }
	}) {
		const write = getElementWriter('createObject')
		write('presetId', presetId)
		write('position', position)
		$('#createObject-presetId').getFocus()
	},
	customSave() {
		const read = getElementReader('createObject')
		const presetId = read('presetId')
		if (presetId === '') {
			return $('#createObject-presetId').getFocus()
		}
		Command.save({ presetId, position: read('position') })
	}
})
