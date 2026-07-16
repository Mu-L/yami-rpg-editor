'use strict'

Command.cases.setZoomFactor = new CommandSchema({
	name: 'setZoomFactor',
	onInitialize() {
		$('#setZoomFactor-confirm').on('click', () => this.save())
		$('#setZoomFactor-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#setZoomFactor').on('open', function (event) {
			$('#setZoomFactor-easingId').loadItems(Data.createEasingItems())
		})
		$('#setZoomFactor').on('closed', function (event) {
			$('#setZoomFactor-easingId').clear()
		})
	},
	customParse({ zoom, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseVariableNumber(zoom))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.setZoomFactor') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		zoom = 1,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setZoomFactor')
		write('zoom', zoom)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setZoomFactor-zoom').getFocus('all')
	},
	customSave() {
		const read = getElementReader('setZoomFactor')
		Command.save({
			zoom: read('zoom'),
			easingId: read('easingId'),
			duration: read('duration'),
			wait: read('wait')
		})
	}
})
