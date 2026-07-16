'use strict'

Command.cases.setPan = new CommandSchema({
	name: 'setPan',
	onInitialize() {
		$('#setPan-confirm').on('click', () => this.save())
		$('#setPan-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' }
		])
		$('#setPan-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#setPan').on('open', function (event) {
			$('#setPan-easingId').loadItems(Data.createEasingItems())
		})
		$('#setPan').on('closed', function (event) {
			$('#setPan-easingId').clear()
		})
	},
	customParse({ type, pan, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(Command.parseVariableNumber(pan))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setPan') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		type = 'bgm',
		pan = 0,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setPan')
		write('type', type)
		write('pan', pan)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setPan-type').getFocus()
	},
	customSave() {
		const read = getElementReader('setPan')
		Command.save({
			type: read('type'),
			pan: read('pan'),
			easingId: read('easingId'),
			duration: read('duration'),
			wait: read('wait')
		})
	}
})
