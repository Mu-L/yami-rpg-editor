'use strict'

Command.cases.translateActor = {
	initialize: function () {
		$('#translateActor-confirm').on('click', this.save)

		// 创建等待结束选项
		$('#translateActor-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#translateActor').on('open', function (event) {
			$('#translateActor-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#translateActor').on('closed', function (event) {
			$('#translateActor-easingId').clear()
		})
	},
	parse: function ({ actor, angle, distance, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseAngle(angle))
			.push(Command.parseVariableNumber(distance, 't'))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.translateActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		angle = { type: 'absolute', degrees: 0 },
		distance = 0,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('translateActor')
		write('actor', actor)
		write('angle', angle)
		write('distance', distance)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#translateActor-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('translateActor')
		const actor = read('actor')
		const angle = read('angle')
		const distance = read('distance')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		if (distance === 0) {
			return $('#translateActor-distance').getFocus('all')
		}
		Command.save({ actor, angle, distance, easingId, duration, wait })
	}
}
