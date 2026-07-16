'use strict'

Command.cases.setResolution = new CommandSchema({
	name: 'setResolution',
	customParse({ width, height, sceneScale, uiScale }) {
		const words = Command.words
			.push(
				Command.parseVariableNumber(width) +
					Token(' x ') +
					Command.parseVariableNumber(height)
			)
			.push(Command.parseVariableNumber(sceneScale))
			.push(Command.parseVariableNumber(uiScale))
		return [
			{ color: 'system' },
			{ text: Local.get('command.setResolution') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ width = 1920, height = 1080, sceneScale = 1, uiScale = 1 }) {
		const write = getElementWriter('setResolution')
		write('width', width)
		write('height', height)
		write('sceneScale', sceneScale)
		write('uiScale', uiScale)
		$('#setResolution-width').getFocus('all')
	},
	customSave() {
		const read = getElementReader('setResolution')
		Command.save({
			width: read('width'),
			height: read('height'),
			sceneScale: read('sceneScale'),
			uiScale: read('uiScale')
		})
	}
})
