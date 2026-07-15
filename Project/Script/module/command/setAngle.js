'use strict'

Command.cases.setAngle = {
	initialize: function () {
		$('#setAngle-confirm').on('click', this.save)

		// 创建等待结束选项
		$('#setAngle-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setAngle').on('open', function (event) {
			$('#setAngle-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#setAngle').on('closed', function (event) {
			$('#setAngle-easingId').clear()
		})
	},
	parse: function ({ actor, angle, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseAngle(angle))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setAngle') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		angle = { type: 'absolute', degrees: 0 },
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setAngle')
		write('actor', actor)
		write('angle', angle)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setAngle-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setAngle')
		const actor = read('actor')
		const angle = read('angle')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ actor, angle, easingId, duration, wait })
	}
}
