'use strict'

Command.cases.stopAudio = new CommandSchema({
	name: 'stopAudio',
	onInitialize() {
		$('#stopAudio-confirm').on('click', () => this.save())
		$('#stopAudio-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' },
			{ name: 'ALL', value: 'all' }
		])
	},
	customParse({ type }) {
		const words = Command.words.push(Command.parseAudioType(type))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.stopAudio') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ type = 'bgm' }) {
		const write = getElementWriter('stopAudio')
		write('type', type)
		$('#stopAudio-type').getFocus()
	},
	customSave() {
		Command.save({ type: getElementReader('stopAudio')('type') })
	}
})
