'use strict'

Command.cases.setReverb = {
	initialize: function () {
		$('#setReverb-confirm').on('click', this.save)

		// 创建类型选项
		$('#setReverb-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' }
		])

		// 创建等待选项
		$('#setReverb-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setReverb').on('open', function (event) {
			$('#setReverb-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#setReverb').on('closed', function (event) {
			$('#setReverb-easingId').clear()
		})
	},
	parse: function ({ type, dry, wet, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(Command.parseVariableNumber(dry))
			.push(Command.parseVariableNumber(wet))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setReverb') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		type = 'bgm',
		dry = 1,
		wet = 0,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setReverb')
		write('type', type)
		write('dry', dry)
		write('wet', wet)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setReverb-type').getFocus()
	},
	save: function () {
		const read = getElementReader('setReverb')
		const type = read('type')
		const dry = read('dry')
		const wet = read('wet')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ type, dry, wet, easingId, duration, wait })
	}
}
