'use strict'

Command.cases.activateScene = {
	initialize: function () {
		$('#activateScene-confirm').on('click', this.save)

		// 创建场景选项
		$('#activateScene-pointer').loadItems([
			{ name: 'Scene A', value: 0 },
			{ name: 'Scene B', value: 1 }
		])
	},
	parsePointer: function (pointer) {
		switch (pointer) {
			case 0:
				return 'A'
			case 1:
				return 'B'
		}
	},
	parse: function ({ pointer }) {
		return [
			{ color: 'scene' },
			{ text: Local.get('command.activateScene') + Token(': ') },
			{ text: this.parsePointer(pointer) }
		]
	},
	load: function ({ pointer = 0 }) {
		const write = getElementWriter('activateScene')
		write('pointer', pointer)
		$('#activateScene-pointer').getFocus()
	},
	save: function () {
		const read = getElementReader('activateScene')
		const pointer = read('pointer')
		Command.save({ pointer })
	}
}
