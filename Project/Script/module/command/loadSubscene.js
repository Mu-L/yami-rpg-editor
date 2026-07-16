'use strict'

Command.cases.loadSubscene = new CommandSchema({
	name: 'loadSubscene',
	customParse({ sceneId, shiftX, shiftY }) {
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
	customLoad({ sceneId = '', shiftX = 0, shiftY = 0 }) {
		const write = getElementWriter('loadSubscene')
		write('sceneId', sceneId)
		write('shiftX', shiftX)
		write('shiftY', shiftY)
		$('#loadSubscene-sceneId').getFocus()
	},
	customSave() {
		const read = getElementReader('loadSubscene')
		const sceneId = read('sceneId')
		if (sceneId === '') {
			return $('#loadSubscene-sceneId').getFocus()
		}
		Command.save({
			sceneId,
			shiftX: read('shiftX'),
			shiftY: read('shiftY')
		})
	}
})
