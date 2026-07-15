'use strict'

Command.cases.stopAudio = {
	initialize: function () {
		$('#stopAudio-confirm').on('click', this.save)

		// 创建类型选项
		$('#stopAudio-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' },
			{ name: 'ALL', value: 'all' }
		])
	},
	parse: function ({ type }) {
		const words = Command.words.push(Command.parseAudioType(type))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.stopAudio') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ type = 'bgm' }) {
		const write = getElementWriter('stopAudio')
		write('type', type)
		$('#stopAudio-type').getFocus()
	},
	save: function () {
		const read = getElementReader('stopAudio')
		const type = read('type')
		Command.save({ type })
	}
}
