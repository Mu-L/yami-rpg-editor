'use strict'

Command.cases.setDialogBox = {
	initialize: function () {
		$('#setDialogBox-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setDialogBox-properties').bind(DialogBoxProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setDialogBox').on('closed', (event) => {
			$('#setDialogBox-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(DialogBoxProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setDialogBox') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setDialogBox')
		write('element', element)
		write('properties', properties.slice())
		$('#setDialogBox-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setDialogBox')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setDialogBox-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}
