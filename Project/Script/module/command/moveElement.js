'use strict'

Command.cases.moveElement = {
	initialize: function () {
		$('#moveElement-confirm').on('click', this.save)

		// 绑定属性列表
		$('#moveElement-properties').bind(TransformProperty)

		// 创建等待结束选项
		$('#moveElement-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#moveElement').on('open', function (event) {
			$('#moveElement-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#moveElement').on('closed', function (event) {
			$('#moveElement-properties').clear()
			$('#moveElement-easingId').clear()
		})
	},
	parse: function ({ element, properties, easingId, duration, wait }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(TransformProperty.parse(property))
		}
		words.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'element' },
			{ text: Local.get('command.moveElement') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		element = { type: 'trigger' },
		properties = [],
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('moveElement')
		write('element', element)
		write('properties', properties.slice())
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#moveElement-element').getFocus()
	},
	save: function () {
		const read = getElementReader('moveElement')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#moveElement-properties').getFocus()
		}
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ element, properties, easingId, duration, wait })
	}
}
