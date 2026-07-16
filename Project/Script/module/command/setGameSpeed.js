'use strict'

Command.cases.setGameSpeed = new CommandSchema({
	name: 'setGameSpeed',
	onInitialize() {
		$('#setGameSpeed-confirm').on('click', () => this.save())
		$('#setGameSpeed-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#setGameSpeed').on('open', function (event) {
			$('#setGameSpeed-easingId').loadItems(Data.createEasingItems())
		})
		$('#setGameSpeed').on('closed', function (event) {
			$('#setGameSpeed-easingId').clear()
		})
	},
	customParse({ speed, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseVariableNumber(speed))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'system' },
			{ text: Local.get('command.setGameSpeed') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		speed = 1,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setGameSpeed')
		write('speed', speed)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setGameSpeed-speed').getFocus('all')
	},
	customSave() {
		const read = getElementReader('setGameSpeed')
		Command.save({
			speed: read('speed'),
			easingId: read('easingId'),
			duration: read('duration'),
			wait: read('wait')
		})
	}
})
