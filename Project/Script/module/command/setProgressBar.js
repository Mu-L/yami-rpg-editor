'use strict'

Command.cases.setProgressBar = {
	initialize: function () {
		$('#setProgressBar-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setProgressBar-properties').bind(ProgressBarProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setProgressBar').on('closed', (event) => {
			$('#setProgressBar-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(ProgressBarProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setProgressBar') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setProgressBar')
		write('element', element)
		write('properties', properties.slice())
		$('#setProgressBar-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setProgressBar')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setProgressBar-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}
