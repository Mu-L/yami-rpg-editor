'use strict'

Command.cases.setResolution = {
	initialize: function () {
		$('#setResolution-confirm').on('click', this.save)
	},
	parse: function ({ width, height, sceneScale, uiScale }) {
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
	load: function ({
		width = 1920,
		height = 1080,
		sceneScale = 1,
		uiScale = 1
	}) {
		const write = getElementWriter('setResolution')
		write('width', width)
		write('height', height)
		write('sceneScale', sceneScale)
		write('uiScale', uiScale)
		$('#setResolution-width').getFocus('all')
	},
	save: function () {
		const read = getElementReader('setResolution')
		const width = read('width')
		const height = read('height')
		const sceneScale = read('sceneScale')
		const uiScale = read('uiScale')
		Command.save({ width, height, sceneScale, uiScale })
	}
}
