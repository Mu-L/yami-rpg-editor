'use strict'

Command.cases.setAnimation = {
	initialize: function () {
		$('#setAnimation-confirm').on('click', this.save)

		// 绑定属性列表
		$('#setAnimation-properties').bind(AnimationProperty)

		// 清理内存 - 窗口已关闭事件
		$('#setAnimation').on('closed', (event) => {
			$('#setAnimation-properties').clear()
		})
	},
	parse: function ({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(AnimationProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setAnimation') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setAnimation')
		write('element', element)
		write('properties', properties.slice())
		$('#setAnimation-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setAnimation')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setAnimation-properties').getFocus()
		}
		Command.save({ element, properties })
	}
}
