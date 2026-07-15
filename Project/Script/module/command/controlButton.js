'use strict'

Command.cases.controlButton = {
	initialize: function () {
		$('#controlButton-confirm').on('click', this.save)

		// 创建操作选项
		$('#controlButton-operation').loadItems([
			{ name: 'Select Default Button', value: 'select-default' },
			{ name: 'Select Button', value: 'select' },
			{ name: 'Display Hover Mode', value: 'hover-mode' },
			{ name: 'Display Active Mode', value: 'active-mode' },
			{ name: 'Restore Display Mode', value: 'normal-mode' }
		])

		// 设置操作关联元素
		$('#controlButton-operation')
			.enableHiddenMode()
			.relate([
				{
					case: [
						'select',
						'hover-mode',
						'active-mode',
						'normal-mode'
					],
					targets: [$('#controlButton-element')]
				}
			])
	},
	parse: function ({ operation, element }) {
		const words = Command.words.push(
			Local.get('command.controlButton.' + operation)
		)
		switch (operation) {
			case 'select':
			case 'hover-mode':
			case 'active-mode':
			case 'normal-mode':
				words.push(Command.parseElement(element))
				break
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.controlButton') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		operation = 'select-default',
		element = { type: 'trigger' }
	}) {
		const write = getElementWriter('controlButton')
		write('operation', operation)
		write('element', element)
		$('#controlButton-operation').getFocus()
	},
	save: function () {
		const read = getElementReader('controlButton')
		const operation = read('operation')
		switch (operation) {
			case 'select-default':
				Command.save({ operation })
				break
			case 'select':
			case 'hover-mode':
			case 'active-mode':
			case 'normal-mode': {
				const element = read('element')
				Command.save({ operation, element })
				break
			}
		}
	}
}
