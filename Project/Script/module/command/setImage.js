'use strict'

Command.cases.setImage = {
	initialize: function () {
		$('#setImage-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setImage-properties').bind(ImageProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setImage').on('closed', (event) => {
			$('#setImage-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(ImageProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setImage') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setImage')
		write('element', element)
		write('properties', properties.slice())
		$('#setImage-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setImage')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setImage-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}
