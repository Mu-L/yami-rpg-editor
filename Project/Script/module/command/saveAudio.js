'use strict'

Command.cases.saveAudio = new CommandSchema({
	name: 'saveAudio',
	fields: [{ key: 'type', default: 'bgm' }],
	onInitialize() {
		$('#saveAudio-confirm').on('click', () => this.save())
		$('#saveAudio-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' }
		])
	},
	customParse({ type }) {
		return [
			{ color: 'audio' },
			{ text: Local.get('command.saveAudio') + Token(': ') },
			{ text: Command.parseAudioType(type) }
		]
	},
	onLoad() {
		$('#saveAudio-type').getFocus()
	}
})
