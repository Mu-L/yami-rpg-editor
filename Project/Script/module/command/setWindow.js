'use strict'

Command.cases.setWindow = {
	initialize: function () {
		$('#setWindow-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setWindow-properties').bind(WindowProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setWindow').on('closed', (event) => {
			$('#setWindow-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(WindowProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setWindow') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setWindow')
		write('element', element)
		write('properties', properties.slice())
		$('#setWindow-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setWindow')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setWindow-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}
