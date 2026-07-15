'use strict'

Command.cases.setZoomFactor = {
	initialize: function () {
		$('#setZoomFactor-confirm').on('click', this.save)

		// 创建等待选项
		$('#setZoomFactor-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setZoomFactor').on('open', function (event) {
			$('#setZoomFactor-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#setZoomFactor').on('closed', function (event) {
			$('#setZoomFactor-easingId').clear()
		})
	},
	parse: function ({ zoom, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseVariableNumber(zoom))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.setZoomFactor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		zoom = 1,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setZoomFactor')
		write('zoom', zoom)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setZoomFactor-zoom').getFocus('all')
	},
	save: function () {
		const read = getElementReader('setZoomFactor')
		const zoom = read('zoom')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ zoom, easingId, duration, wait })
	}
}
