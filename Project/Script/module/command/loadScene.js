'use strict'

Command.cases.loadScene = new CommandSchema({
	name: 'loadScene',
	onInitialize() {
		$('#loadScene-confirm').on('click', () => this.save())
		$('#loadScene-transfer').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#loadScene-transfer')
			.enableHiddenMode()
			.relate([
				{ case: true, targets: [$('#loadScene-x'), $('#loadScene-y')] }
			])
	},
	customParse({ sceneId, transfer, x, y }) {
		const words = Command.words.push(Command.parseVariableFile(sceneId))
		if (transfer) {
			words
				.push(Command.parseVariableNumber(x))
				.push(Command.parseVariableNumber(y))
		}
		return [
			{ color: 'scene' },
			{ text: Local.get('command.loadScene') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ sceneId = '', transfer = true, x = 0, y = 0 }) {
		const write = getElementWriter('loadScene')
		write('sceneId', sceneId)
		write('transfer', transfer)
		write('x', x)
		write('y', y)
		$('#loadScene-sceneId').getFocus()
	},
	customSave() {
		const read = getElementReader('loadScene')
		const sceneId = read('sceneId')
		if (sceneId === '') {
			return $('#loadScene-sceneId').getFocus()
		}
		const transfer = read('transfer')
		switch (transfer) {
			case true:
				Command.save({
					sceneId,
					transfer,
					x: read('x'),
					y: read('y')
				})
				break
			case false:
				Command.save({ sceneId, transfer })
				break
		}
	}
})
