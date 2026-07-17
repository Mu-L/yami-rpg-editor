'use strict'

Command.cases.setAnimation = new CommandSchema({
	name: 'setAnimation',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'properties', default: [] }
	],
	onInitialize() {
		$('#setAnimation-confirm').on('click', () => this.save())
		$('#setAnimation-properties').bind(AnimationProperty)
		$('#setAnimation').on('closed', (event) => {
			$('#setAnimation-properties').clear()
		})
	},
	customParse({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(AnimationProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setAnimation') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setAnimation-element').getFocus()
	},
	customSave() {
		const read = getElementReader('setAnimation')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setAnimation-properties').getFocus()
		}
		Command.save({ element, properties })
	}
})
