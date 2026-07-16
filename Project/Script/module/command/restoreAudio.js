'use strict'

Command.cases.restoreAudio = new CommandSchema({
	name: 'restoreAudio',
	onInitialize() {
		$('#restoreAudio-confirm').on('click', () => this.save())
		$('#restoreAudio-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' }
		])
	},
	customParse({ type }) {
		return [
			{ color: 'audio' },
			{ text: Local.get('command.restoreAudio') + Token(': ') },
			{ text: Command.parseAudioType(type) }
		]
	},
	customLoad({ type = 'bgm' }) {
		const write = getElementWriter('restoreAudio')
		write('type', type)
		$('#restoreAudio-type').getFocus()
	},
	customSave() {
		Command.save({ type: getElementReader('restoreAudio')('type') })
	}
})
