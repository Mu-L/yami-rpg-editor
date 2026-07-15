'use strict'

Command.cases.setButton = {
	initialize: function () {
		$('#setButton-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setButton-properties').bind(ButtonProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setButton').on('closed', (event) => {
			$('#setButton-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(ButtonProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setButton') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setButton')
		write('element', element)
		write('properties', properties.slice())
		$('#setButton-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setButton')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setButton-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}
