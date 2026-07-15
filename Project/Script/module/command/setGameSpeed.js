'use strict'

Command.cases.setGameSpeed = {
	initialize: function () {
		$('#setGameSpeed-confirm').on('click', this.save)

		// 创建等待选项
		$('#setGameSpeed-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setGameSpeed').on('open', function (event) {
			$('#setGameSpeed-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#setGameSpeed').on('closed', function (event) {
			$('#setGameSpeed-easingId').clear()
		})
	},
	parse: function ({ speed, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseVariableNumber(speed))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'system' },
			{ text: Local.get('command.setGameSpeed') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		speed = 1,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setGameSpeed')
		write('speed', speed)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setGameSpeed-speed').getFocus('all')
	},
	save: function () {
		const read = getElementReader('setGameSpeed')
		const speed = read('speed')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ speed, easingId, duration, wait })
	}
}
