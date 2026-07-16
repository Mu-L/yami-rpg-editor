'use strict'

Command.cases.saveAudio = new CommandSchema({
	name: 'saveAudio',
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
	customLoad({ type = 'bgm' }) {
		const write = getElementWriter('saveAudio')
		write('type', type)
		$('#saveAudio-type').getFocus()
	},
	customSave() {
		Command.save({ type: getElementReader('saveAudio')('type') })
	}
})
