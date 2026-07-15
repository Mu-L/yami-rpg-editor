'use strict'

Command.cases.restoreAudio = {
	initialize: function () {
		$('#restoreAudio-confirm').on('click', this.save)

		// 创建类型选项
		$('#restoreAudio-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' }
		])
	},
	parse: function ({ type }) {
		return [
			{ color: 'audio' },
			{ text: Local.get('command.restoreAudio') + Token(': ') },
			{ text: Command.parseAudioType(type) }
		]
	},
	load: function ({ type = 'bgm' }) {
		const write = getElementWriter('restoreAudio')
		write('type', type)
		$('#restoreAudio-type').getFocus()
	},
	save: function () {
		const read = getElementReader('restoreAudio')
		const type = read('type')
		Command.save({ type })
	}
}
