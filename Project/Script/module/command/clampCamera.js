'use strict'

Command.cases.clampCamera = {
	initialize: function () {
		$('#clampCamera-confirm').on('click', this.save)
	},
	parse: function ({ left, top, right, bottom }) {
		const words = Command.words
			.push(
				Local.get('command.clampCamera.left') +
					Token(' = ') +
					Command.parseVariableNumber(left)
			)
			.push(
				Local.get('command.clampCamera.top') +
					Token(' = ') +
					Command.parseVariableNumber(top)
			)
			.push(
				Local.get('command.clampCamera.right') +
					Token(' = ') +
					Command.parseVariableNumber(right)
			)
			.push(
				Local.get('command.clampCamera.bottom') +
					Token(' = ') +
					Command.parseVariableNumber(bottom)
			)
		return [
			{ color: 'scene' },
			{ text: Local.get('command.clampCamera') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ left = 0, top = 0, right = 0, bottom = 0 }) {
		const write = getElementWriter('clampCamera')
		write('left', left)
		write('top', top)
		write('right', right)
		write('bottom', bottom)
		$('#clampCamera-left').getFocus('all')
	},
	save: function () {
		const read = getElementReader('clampCamera')
		const left = read('left')
		const top = read('top')
		const right = read('right')
		const bottom = read('bottom')
		Command.save({ left, top, right, bottom })
	}
}
