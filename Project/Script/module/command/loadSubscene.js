'use strict'

Command.cases.loadSubscene = {
	initialize: function () {
		$('#loadSubscene-confirm').on('click', this.save)
	},
	parse: function ({ sceneId, shiftX, shiftY }) {
		const words = Command.words
			.push(Command.parseVariableFile(sceneId))
			.push(Command.parseVariableNumber(shiftX))
			.push(Command.parseVariableNumber(shiftY))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.loadSubscene') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ sceneId = '', shiftX = 0, shiftY = 0 }) {
		const write = getElementWriter('loadSubscene')
		write('sceneId', sceneId)
		write('shiftX', shiftX)
		write('shiftY', shiftY)
		$('#loadSubscene-sceneId').getFocus()
	},
	save: function () {
		const read = getElementReader('loadSubscene')
		const sceneId = read('sceneId')
		if (sceneId === '') {
			return $('#loadSubscene-sceneId').getFocus()
		}
		const shiftX = read('shiftX')
		const shiftY = read('shiftY')
		Command.save({ sceneId, shiftX, shiftY })
	}
}
