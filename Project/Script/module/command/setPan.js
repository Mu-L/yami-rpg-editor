'use strict'

Command.cases.setPan = {
	initialize: function () {
		$('#setPan-confirm').on('click', this.save)

		// 创建类型选项
		$('#setPan-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' }
		])

		// 创建等待选项
		$('#setPan-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setPan').on('open', function (event) {
			$('#setPan-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#setPan').on('closed', function (event) {
			$('#setPan-easingId').clear()
		})
	},
	parse: function ({ type, pan, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(Command.parseVariableNumber(pan))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setPan') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		type = 'bgm',
		pan = 0,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setPan')
		write('type', type)
		write('pan', pan)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setPan-type').getFocus()
	},
	save: function () {
		const read = getElementReader('setPan')
		const type = read('type')
		const pan = read('pan')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ type, pan, easingId, duration, wait })
	}
}
