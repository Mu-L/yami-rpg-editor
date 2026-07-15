'use strict'

Command.cases.saveAudio = {
	initialize: function () {
		$('#saveAudio-confirm').on('click', this.save)

		// 创建类型选项
		$('#saveAudio-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' }
		])
	},
	parse: function ({ type }) {
		return [
			{ color: 'audio' },
			{ text: Local.get('command.saveAudio') + Token(': ') },
			{ text: Command.parseAudioType(type) }
		]
	},
	load: function ({ type = 'bgm' }) {
		const write = getElementWriter('saveAudio')
		write('type', type)
		$('#saveAudio-type').getFocus()
	},
	save: function () {
		const read = getElementReader('saveAudio')
		const type = read('type')
		Command.save({ type })
	}
}
