'use strict'

Command.cases.setVolume = new CommandSchema({
	name: 'setVolume',
	onInitialize() {
		$('#setVolume-confirm').on('click', () => this.save())
		$('#setVolume-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' }
		])
		$('#setVolume-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#setVolume').on('open', function (event) {
			$('#setVolume-easingId').loadItems(Data.createEasingItems())
		})
		$('#setVolume').on('closed', function (event) {
			$('#setVolume-easingId').clear()
		})
	},
	customParse({ type, volume, easingId, duration, wait }) {
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
	customLoad({
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
	customSave() {
		const read = getElementReader('setVolume')
		Command.save({
			type: read('type'),
			volume: read('volume'),
			easingId: read('easingId'),
			duration: read('duration'),
			wait: read('wait')
		})
	}
})
