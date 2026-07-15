'use strict'

Command.cases.simulateKey = {
	initialize: function () {
		$('#simulateKey-confirm').on('click', this.save)

		// 创建类型选项
		$('#simulateKey-operation').loadItems([
			{ name: 'Click', value: 'click' },
			{ name: 'Press', value: 'press' },
			{ name: 'Release', value: 'release' }
		])
	},
	parse: function ({ operation, keycode }) {
		const words = Command.words
			.push(Local.get('command.simulateKey.' + operation))
			.push(Command.setStringColor(keycode))
		return [
			{ color: 'system' },
			{ text: Local.get('command.simulateKey') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ operation = 'click', keycode = '' }) {
		$('#simulateKey-operation').write(operation)
		$('#simulateKey-keycode').write(keycode)
		$('#simulateKey-operation').getFocus()
	},
	save: function () {
		const read = getElementReader('simulateKey')
		const operation = read('operation')
		const keycode = read('keycode')
		Command.save({ operation, keycode })
	}
}
