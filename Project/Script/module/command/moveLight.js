'use strict'

Command.cases.moveLight = {
	initialize: function () {
		$('#moveLight-confirm').on('click', this.save)

		// 绑定属性列表
		$('#moveLight-properties').bind(LightProperty)

		// 创建等待选项
		$('#moveLight-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#moveLight').on('open', function (event) {
			$('#moveLight-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#moveLight').on('closed', function (event) {
			$('#moveLight-properties').clear()
			$('#moveLight-easingId').clear()
		})
	},
	parse: function ({ light, properties, easingId, duration, wait }) {
		const words = Command.words.push(Command.parseLight(light))
		for (const property of properties) {
			words.push(LightProperty.parse(property))
		}
		words.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'object' },
			{ text: Local.get('command.moveLight') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		light = { type: 'trigger' },
		properties = [],
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('moveLight')
		write('light', light)
		write('properties', properties.slice())
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#moveLight-light').getFocus()
	},
	save: function () {
		const read = getElementReader('moveLight')
		const light = read('light')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#moveLight-properties').getFocus()
		}
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ light, properties, easingId, duration, wait })
	}
}
