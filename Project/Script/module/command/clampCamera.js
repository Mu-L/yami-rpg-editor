'use strict'

Command.cases.clampCamera = new CommandSchema({
	name: 'clampCamera',
	customParse({ left, top, right, bottom }) {
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
	customLoad({ left = 0, top = 0, right = 0, bottom = 0 }) {
		const write = getElementWriter('clampCamera')
		write('left', left)
		write('top', top)
		write('right', right)
		write('bottom', bottom)
		$('#clampCamera-left').getFocus('all')
	},
	customSave() {
		const read = getElementReader('clampCamera')
		Command.save({
			left: read('left'),
			top: read('top'),
			right: read('right'),
			bottom: read('bottom')
		})
	}
})
