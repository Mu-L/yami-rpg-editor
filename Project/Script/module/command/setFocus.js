'use strict'

Command.cases.setFocus = {
	initialize: function () {
		$('#setFocus-confirm').on('click', this.save)

		// 创建操作选项
		$('#setFocus-operation').loadItems([
			{ name: 'Add Focus', value: 'add' },
			{ name: 'Remove Focus', value: 'remove' },
			{ name: 'Remove The Latest Focus', value: 'remove-latest' },
			{ name: 'Reset', value: 'reset' }
		])

		// 创建模式选项
		$('#setFocus-mode').loadItems([
			{ name: 'Control Child Buttons', value: 'control-child-buttons' },
			{
				name: 'Control Descendant Buttons',
				value: 'control-descendant-buttons'
			}
		])

		// 设置操作关联元素
		$('#setFocus-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'add',
					targets: [
						$('#setFocus-element'),
						$('#setFocus-mode'),
						$('#setFocus-cancelable')
					]
				},
				{ case: 'remove', targets: [$('#setFocus-element')] }
			])
	},
	parse: function ({ operation, element, mode, cancelable }) {
		const words = Command.words.push(
			Local.get('command.setFocus.' + operation)
		)
		switch (operation) {
			case 'add':
				// 补丁：2023-3-21
				if (mode === undefined) {
					mode = 'control-child-buttons'
				}
				words.push(Command.parseElement(element))
				words.push(Local.get('command.setFocus.' + mode))
				if (cancelable) {
					words.push(Local.get('command.setFocus.cancelable'))
				}
				break
			case 'remove':
				words.push(Command.parseElement(element))
				break
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setFocus') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		operation = 'add',
		element = { type: 'trigger' },
		mode = 'control-child-buttons',
		cancelable = true
	}) {
		$('#setFocus-operation').write(operation)
		$('#setFocus-element').write(element)
		$('#setFocus-mode').write(mode)
		$('#setFocus-cancelable').write(cancelable)
		$('#setFocus-operation').getFocus()
	},
	save: function () {
		const read = getElementReader('setFocus')
		const operation = read('operation')
		switch (operation) {
			case 'add': {
				const element = read('element')
				const mode = read('mode')
				const cancelable = read('cancelable')
				Command.save({ operation, element, mode, cancelable })
				break
			}
			case 'remove': {
				const element = read('element')
				Command.save({ operation, element })
				break
			}
			case 'remove-latest':
			case 'reset':
				Command.save({ operation })
				break
		}
	}
}
