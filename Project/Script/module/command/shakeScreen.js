'use strict'

Command.cases.shakeScreen = {
	initialize: function () {
		$('#shakeScreen-confirm').on('click', this.save)

		// 创建震动模式选项
		$('#shakeScreen-mode').loadItems([
			{ name: 'Random', value: 'random' },
			{ name: 'Horizontal', value: 'horizontal' },
			{ name: 'Vertical', value: 'vertical' }
		])

		// 创建等待结束选项
		$('#shakeScreen-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#shakeScreen').on('open', function (event) {
			$('#shakeScreen-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#shakeScreen').on('closed', function (event) {
			$('#shakeScreen-easingId').clear()
		})
	},
	parse: function ({ mode, power, speed, easingId, duration, wait }) {
		const words = Command.words
			.push(Local.get('command.shakeScreen.' + mode))
			.push(Command.setNumberColor(power))
			.push(Command.setNumberColor(speed))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.shakeScreen') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		mode = 'random',
		power = 5,
		speed = 10,
		easingId = Data.easings[0].id,
		duration = 200,
		wait = false
	}) {
		const write = getElementWriter('shakeScreen')
		write('mode', mode)
		write('power', power)
		write('speed', speed)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#shakeScreen-mode').getFocus()
	},
	save: function () {
		const read = getElementReader('shakeScreen')
		const mode = read('mode')
		const power = read('power')
		const speed = read('speed')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ mode, power, speed, easingId, duration, wait })
	}
}
