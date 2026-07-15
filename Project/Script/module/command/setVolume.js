'use strict'

Command.cases.setVolume = {
	initialize: function () {
		$('#setVolume-confirm').on('click', this.save)

		// 创建类型选项
		$('#setVolume-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' }
		])

		// 创建等待选项
		$('#setVolume-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setVolume').on('open', function (event) {
			$('#setVolume-easingId').loadItems(Data.createEasingItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#setVolume').on('closed', function (event) {
			$('#setVolume-easingId').clear()
		})
	},
	parse: function ({ type, volume, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(Command.parseVariableNumber(volume))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setVolume') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		type = 'bgm',
		volume = 1,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setVolume')
		write('type', type)
		write('volume', volume)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setVolume-type').getFocus()
	},
	save: function () {
		const read = getElementReader('setVolume')
		const type = read('type')
		const volume = read('volume')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		Command.save({ type, volume, easingId, duration, wait })
	}
}
