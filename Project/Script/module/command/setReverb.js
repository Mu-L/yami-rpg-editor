'use strict'

Command.cases.setReverb = new CommandSchema({
	name: 'setReverb',
	onInitialize() {
		$('#setReverb-confirm').on('click', () => this.save())
		$('#setReverb-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' }
		])
		$('#setReverb-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#setReverb').on('open', function (event) {
			$('#setReverb-easingId').loadItems(Data.createEasingItems())
		})
		$('#setReverb').on('closed', function (event) {
			$('#setReverb-easingId').clear()
		})
	},
	customParse({ type, dry, wet, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(Command.parseVariableNumber(dry))
			.push(Command.parseVariableNumber(wet))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setReverb') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		type = 'bgm',
		dry = 1,
		wet = 0,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setReverb')
		write('type', type)
		write('dry', dry)
		write('wet', wet)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setReverb-type').getFocus()
	},
	customSave() {
		const read = getElementReader('setReverb')
		Command.save({
			type: read('type'),
			dry: read('dry'),
			wet: read('wet'),
			easingId: read('easingId'),
			duration: read('duration'),
			wait: read('wait')
		})
	}
})
