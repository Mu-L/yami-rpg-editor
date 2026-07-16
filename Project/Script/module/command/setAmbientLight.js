'use strict'

Command.cases.setAmbientLight = new CommandSchema({
	name: 'setAmbientLight',
	onInitialize() {
		$('#setAmbientLight-confirm').on('click', () => this.save())
		$('#setAmbientLight-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#setAmbientLight').on('open', function (event) {
			$('#setAmbientLight-easingId').loadItems(Data.createEasingItems())
		})
		$('#setAmbientLight').on('closed', function (event) {
			$('#setAmbientLight-easingId').clear()
		})
	},
	parseColor(red, green, blue) {
		const r = Command.parseVariableNumber(red)
		const g = Command.parseVariableNumber(green)
		const b = Command.parseVariableNumber(blue)
		return (
			'RGB' +
			Token('(') +
			r +
			Token(', ') +
			g +
			Token(', ') +
			b +
			Token(')')
		)
	},
	customParse({ red, green, blue, easingId, duration, wait }) {
		const words = Command.words
			.push(this.parseColor(red, green, blue))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.setAmbientLight') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		red = 0,
		green = 0,
		blue = 0,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setAmbientLight')
		write('red', red)
		write('green', green)
		write('blue', blue)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setAmbientLight-red').getFocus('all')
	},
	customSave() {
		const read = getElementReader('setAmbientLight')
		Command.save({
			red: read('red'),
			green: read('green'),
			blue: read('blue'),
			easingId: read('easingId'),
			duration: read('duration'),
			wait: read('wait')
		})
	}
})
