'use strict'

Command.cases.setLoop = new CommandSchema({
	name: 'setLoop',
	onInitialize() {
		$('#setLoop-confirm').on('click', () => this.save())
		$('#setLoop-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' }
		])
		$('#setLoop-loop').loadItems([
			{ name: 'Once', value: false },
			{ name: 'Loop', value: true }
		])
	},
	parseLoop(loop) {
		switch (loop) {
			case false:
				return Local.get('command.setLoop.once')
			case true:
				return Local.get('command.setLoop.loop')
		}
	},
	customParse({ type, loop }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(this.parseLoop(loop))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setLoop') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ type = 'bgm', loop = false }) {
		const write = getElementWriter('setLoop')
		write('type', type)
		write('loop', loop)
		$('#setLoop-type').getFocus()
	},
	customSave() {
		const read = getElementReader('setLoop')
		Command.save({ type: read('type'), loop: read('loop') })
	}
})
