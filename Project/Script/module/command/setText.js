'use strict'

Command.cases.setText = {
	initialize: function () {
		$('#setText-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setText-properties').bind(TextProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setText').on('closed', (event) => {
			$('#setText-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(TextProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setText') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setText')
		write('element', element)
		write('properties', properties.slice())
		$('#setText-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setText')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setText-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}
