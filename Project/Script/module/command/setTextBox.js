'use strict'

Command.cases.setTextBox = {
	initialize: function () {
		$('#setTextBox-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setTextBox-properties').bind(TextBoxProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setTextBox').on('closed', (event) => {
			$('#setTextBox-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(TextBoxProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setTextBox') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setTextBox')
		write('element', element)
		write('properties', properties.slice())
		$('#setTextBox-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setTextBox')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setTextBox-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}
