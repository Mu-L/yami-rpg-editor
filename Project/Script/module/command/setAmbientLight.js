'use strict'

Command.cases.setAmbientLight = {
	initialize: function () {
		$('#setAmbientLight-confirm').on('click', this.save)

		// 创建等待结束选项
		$('#setAmbientLight-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setAmbientLight').on('open', function (event) {
			$('#setAmbientLight-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#setAmbientLight').on('closed', function (event) {
			$('#setAmbientLight-easingId').clear()
		})
	},
	parseColor: function (red, green, blue) {
		const r = Command.parseVariableNumber(red)
		const g = Command.parseVariableNumber(green)
		const b = Command.parseVariableNumber(blue)
		return (
			'RGB' +
			Token('(') +
			r +
			Token(', ') +
			g +
			Token(', ') +
			b +
			Token(')')
		)
	},
	parse: function ({ red, green, blue, easingId, duration, wait }) {
		const words = Command.words
			.push(this.parseColor(red, green, blue))
			.push(Command.parseEasing(easingId, duration, wait))
		const contents = [
			{ color: 'scene' },
			{ text: Local.get('command.setAmbientLight') + Token(': ') },
			{ text: words.join() }
		]
		return contents
	},
	load: function ({
		red = 0,
		green = 0,
		blue = 0,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setAmbientLight')
		write('red', red)
		write('green', green)
		write('blue', blue)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setAmbientLight-red').getFocus('all')
	},
	save: function () {
		const read = getElementReader('setAmbientLight')
		const red = read('red')
		const green = read('green')
		const blue = read('blue')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ red, green, blue, easingId, duration, wait })
	}
}
