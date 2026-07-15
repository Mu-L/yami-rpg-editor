'use strict'

Command.cases.gameData = {
	initialize: function () {
		$('#gameData-confirm').on('click', this.save)

		// 创建操作选项
		$('#gameData-operation').loadItems([
			{ name: 'Save', value: 'save' },
			{ name: 'Load', value: 'load' },
			{ name: 'Delete', value: 'delete' }
		])

		// 设置操作关联元素
		$('#gameData-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'save',
					targets: [$('#gameData-index'), $('#gameData-variables')]
				},
				{ case: ['load', 'delete'], targets: [$('#gameData-index')] }
			])
	},
	parse: function ({ operation, index, variables }) {
		const words = Command.words
			.push(Local.get('command.gameData.' + operation))
			.push(Command.parseVariableNumber(index))
		switch (operation) {
			case 'save':
				if (variables) {
					const label = Local.get('command.gameData.variables')
					const keys = variables
						.split(/\s*,\s*/)
						.map((key) => Command.setVariableColor(key))
					const string = keys.join(Token(', '))
					words.push(label + ' ' + Token('{') + string + Token('}'))
				}
				break
		}
		return [
			{ color: 'system' },
			{ text: Local.get('command.gameData') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ operation = 'save', index = 0, variables = '' }) {
		$('#gameData-operation').write(operation)
		$('#gameData-index').write(index)
		$('#gameData-variables').write(variables)
		$('#gameData-operation').getFocus()
	},
	save: function () {
		const read = getElementReader('gameData')
		const operation = read('operation')
		switch (operation) {
			case 'save': {
				const index = read('index')
				const variables = read('variables').trim()
				Command.save({ operation, index, variables })
				break
			}
			case 'load':
			case 'delete': {
				const index = read('index')
				Command.save({ operation, index })
				break
			}
		}
	}
}
