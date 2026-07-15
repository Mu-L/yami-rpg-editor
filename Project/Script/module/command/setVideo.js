'use strict'

Command.cases.setVideo = {
	initialize: function () {
		$('#setVideo-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setVideo-properties').bind(VideoProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setVideo').on('closed', (event) => {
			$('#setVideo-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(VideoProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setVideo') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setVideo')
		write('element', element)
		write('properties', properties.slice())
		$('#setVideo-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setVideo')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setVideo-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}
