'use strict'

Command.cases.setText = new CommandSchema({
	name: 'setText',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'properties', default: [] }
	],
	onInitialize() {
		$('#setText-confirm').on('click', () => this.save())
		$('#setText-properties').bind(TextProperty)
		$('#setText').on('closed', (event) => {
			$('#setText-properties').clear()
		})
	},
	customParse({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(TextProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setText') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setText-element').getFocus()
	},
	customSave() {
		const read = getElementReader('setText')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setText-properties').getFocus()
		}
		Command.save({ element, properties })
	}
})
