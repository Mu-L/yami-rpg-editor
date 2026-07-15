'use strict'

Command.cases.transition = {
	commands: null,
	initialize: function () {
		$('#transition-confirm').on('click', this.save)

		// 创建过渡方式选项 - 窗口打开事件
		$('#transition').on('open', function (event) {
			$('#transition-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#transition').on('closed', function (event) {
			$('#transition-easingId').clear()
			this.commands = null
		})
	},
	parse: function ({ variable, start, end, easingId, duration, commands }) {
		const varName = Command.parseVariable(variable, 'number', true)
		const from = Command.parseVariableNumber(start)
		const to = Command.parseVariableNumber(end)
		const easing = Command.parseEasing(easingId, duration)
		const expression = varName + Token(' = ') + from + Token(' -> ') + to
		const words = Command.words.push(expression).push(easing)
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.transition') + ' ' },
			{ color: 'restore' },
			{ text: words.join() },
			{ children: commands },
			{ color: 'flow' },
			{ text: Local.get('command.transition.end') }
		]
	},
	load: function ({
		variable = { type: 'local', key: '' },
		start = 0,
		end = 1,
		easingId = Data.easings[0].id,
		duration = 1000,
		commands = []
	}) {
		const write = getElementWriter('transition')
		write('variable', variable)
		write('start', start)
		write('end', end)
		write('easingId', easingId)
		write('duration', duration)
		Command.cases.transition.commands = commands
		$('#transition-variable').getFocus()
	},
	save: function () {
		const read = getElementReader('transition')
		const variable = read('variable')
		if (VariableGetter.isNone(variable)) {
			return $('#transition-variable').getFocus()
		}
		const start = read('start')
		const end = read('end')
		const easingId = read('easingId')
		const duration = read('duration')
		if (duration === 0) {
			return $('#transition-duration').getFocus('all')
		}
		const commands = Command.cases.transition.commands
		Command.save({ variable, start, end, easingId, duration, commands })
	}
}
