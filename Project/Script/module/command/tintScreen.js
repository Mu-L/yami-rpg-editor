'use strict'

Command.cases.tintScreen = {
	initialize: function () {
		$('#tintScreen-confirm').on('click', this.save)

		// 创建等待结束选项
		$('#tintScreen-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#tintScreen').on('open', function (event) {
			$('#tintScreen-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#tintScreen').on('closed', function (event) {
			$('#tintScreen-easingId').clear()
			$('#tintScreen-filter').clear()
		})

		// 写入滤镜框 - 色调输入框输入事件
		$(
			'#tintScreen-tint-0, #tintScreen-tint-1, #tintScreen-tint-2, #tintScreen-tint-3'
		).on('input', function (event) {
			$('#tintScreen-filter').write([
				$('#tintScreen-tint-0').read(),
				$('#tintScreen-tint-1').read(),
				$('#tintScreen-tint-2').read(),
				$('#tintScreen-tint-3').read()
			])
		})
	},
	parseTint: function ([red, green, blue, gray]) {
		const _red = Command.setNumberColor(red)
		const _green = Command.setNumberColor(green)
		const _blue = Command.setNumberColor(blue)
		const _gray = Command.setNumberColor(gray)
		return (
			Token('(') +
			_red +
			Token(', ') +
			_green +
			Token(', ') +
			_blue +
			Token(', ') +
			_gray +
			Token(')')
		)
	},
	parse: function ({ tint, easingId, duration, wait }) {
		const words = Command.words
			.push(this.parseTint(tint))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.tintScreen') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		tint = [0, 0, 0, 0],
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('tintScreen')
		write('tint-0', tint[0])
		write('tint-1', tint[1])
		write('tint-2', tint[2])
		write('tint-3', tint[3])
		write('filter', tint)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#tintScreen-tint-0').getFocus('all')
	},
	save: function () {
		const read = getElementReader('tintScreen')
		const red = read('tint-0')
		const green = read('tint-1')
		const blue = read('tint-2')
		const gray = read('tint-3')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		const tint = [red, green, blue, gray]
		Command.save({ tint, easingId, duration, wait })
	}
}
