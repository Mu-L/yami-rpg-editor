'use strict'

Command.cases.moveLight = new CommandSchema({
	name: 'moveLight',
	onInitialize() {
		$('#moveLight-confirm').on('click', () => this.save())
		$('#moveLight-properties').bind(LightProperty)
		$('#moveLight-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#moveLight').on('open', function (event) {
			$('#moveLight-easingId').loadItems(Data.createEasingItems())
		})
		$('#moveLight').on('closed', function (event) {
			$('#moveLight-properties').clear()
			$('#moveLight-easingId').clear()
		})
	},
	customParse({ light, properties, easingId, duration, wait }) {
		const words = Command.words.push(Command.parseLight(light))
		for (const property of properties) {
			words.push(LightProperty.parse(property))
		}
		words.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'object' },
			{ text: Local.get('command.moveLight') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		light = { type: 'trigger' },
		properties = [],
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('moveLight')
		write('light', light)
		write('properties', properties.slice())
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#moveLight-light').getFocus()
	},
	customSave() {
		const read = getElementReader('moveLight')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#moveLight-properties').getFocus()
		}
		Command.save({
			light: read('light'),
			properties,
			easingId: read('easingId'),
			duration: read('duration'),
			wait: read('wait')
		})
	}
})
