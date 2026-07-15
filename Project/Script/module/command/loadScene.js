'use strict'

Command.cases.loadScene = {
	initialize: function () {
		$('#loadScene-confirm').on('click', this.save)

		// 创建转移玩家角色选项
		$('#loadScene-transfer').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 设置转移玩家角色关联元素
		$('#loadScene-transfer')
			.enableHiddenMode()
			.relate([
				{ case: true, targets: [$('#loadScene-x'), $('#loadScene-y')] }
			])
	},
	parse: function ({ sceneId, transfer, x, y }) {
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
	load: function ({ sceneId = '', transfer = true, x = 0, y = 0 }) {
		const write = getElementWriter('loadScene')
		write('sceneId', sceneId)
		write('transfer', transfer)
		write('x', x)
		write('y', y)
		$('#loadScene-sceneId').getFocus()
	},
	save: function () {
		const read = getElementReader('loadScene')
		const sceneId = read('sceneId')
		if (sceneId === '') {
			return $('#loadScene-sceneId').getFocus()
		}
		const transfer = read('transfer')
		switch (transfer) {
			case true: {
				const x = read('x')
				const y = read('y')
				Command.save({ sceneId, transfer, x, y })
				break
			}
			case false:
				Command.save({ sceneId, transfer })
				break
		}
	}
}
