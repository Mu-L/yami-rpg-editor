'use strict'

Command.cases.moveCamera = {
	initialize: function () {
		$('#moveCamera-confirm').on('click', this.save)

		// 创建模式选项
		$('#moveCamera-mode').loadItems([
			{ name: 'Move to Position', value: 'position' },
			{ name: 'Follow Actor', value: 'actor' }
		])

		// 设置模式关联元素
		$('#moveCamera-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'position', targets: [$('#moveCamera-position')] },
				{ case: 'actor', targets: [$('#moveCamera-actor')] }
			])

		// 创建等待选项
		$('#moveCamera-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#moveCamera').on('open', function (event) {
			$('#moveCamera-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#moveCamera').on('closed', function (event) {
			$('#moveCamera-easingId').clear()
		})
	},
	parse: function ({ mode, position, actor, easingId, duration, wait }) {
		const words = Command.words.push(
			Local.get('command.moveCamera.' + mode)
		)
		switch (mode) {
			case 'position':
				words.push(Command.parsePosition(position))
				break
			case 'actor':
				words.push(Command.parseActor(actor))
				break
		}
		words.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.moveCamera') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		mode = 'position',
		position = { type: 'absolute', x: 0, y: 0 },
		actor = { type: 'trigger' },
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('moveCamera')
		write('mode', mode)
		write('position', position)
		write('actor', actor)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#moveCamera-mode').getFocus()
	},
	save: function () {
		const read = getElementReader('moveCamera')
		const mode = read('mode')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		switch (mode) {
			case 'position': {
				const position = read('position')
				Command.save({ mode, position, easingId, duration, wait })
				break
			}
			case 'actor': {
				const actor = read('actor')
				Command.save({ mode, actor, easingId, duration, wait })
				break
			}
		}
	}
}
