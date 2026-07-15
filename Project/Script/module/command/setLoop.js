'use strict'

Command.cases.setLoop = {
	initialize: function () {
		$('#setLoop-confirm').on('click', this.save)

		// 创建类型选项
		$('#setLoop-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' }
		])

		// 创建循环选项
		$('#setLoop-loop').loadItems([
			{ name: 'Once', value: false },
			{ name: 'Loop', value: true }
		])
	},
	parseLoop: function (loop) {
		switch (loop) {
			case false:
				return Local.get('command.setLoop.once')
			case true:
				return Local.get('command.setLoop.loop')
		}
	},
	parse: function ({ type, loop }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(this.parseLoop(loop))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setLoop') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ type = 'bgm', loop = false }) {
		const write = getElementWriter('setLoop')
		write('type', type)
		write('loop', loop)
		$('#setLoop-type').getFocus()
	},
	save: function () {
		const read = getElementReader('setLoop')
		const type = read('type')
		const loop = read('loop')
		Command.save({ type, loop })
	}
}
