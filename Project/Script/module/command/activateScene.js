'use strict'

Command.cases.activateScene = new CommandSchema({
	name: 'activateScene',
	onInitialize() {
		$('#activateScene-confirm').on('click', () => this.save())
		$('#activateScene-pointer').loadItems([
			{ name: 'Scene A', value: 0 },
			{ name: 'Scene B', value: 1 }
		])
	},
	parsePointer(pointer) {
		switch (pointer) {
			case 0:
				return 'A'
			case 1:
				return 'B'
		}
	},
	customParse({ pointer }) {
		return [
			{ color: 'scene' },
			{ text: Local.get('command.activateScene') + Token(': ') },
			{ text: this.parsePointer(pointer) }
		]
	},
	customLoad({ pointer = 0 }) {
		const write = getElementWriter('activateScene')
		write('pointer', pointer)
		$('#activateScene-pointer').getFocus()
	},
	customSave() {
		const read = getElementReader('activateScene')
		Command.save({ pointer: read('pointer') })
	}
})
