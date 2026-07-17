'use strict'

Command.cases.setTextBox = new CommandSchema({
	name: 'setTextBox',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'properties', default: [] }
	],
	onInitialize() {
		$('#setTextBox-confirm').on('click', () => this.save())
		$('#setTextBox-properties').bind(TextBoxProperty)
		$('#setTextBox').on('closed', (event) => {
			$('#setTextBox-properties').clear()
		})
	},
	customParse({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(TextBoxProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setTextBox') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setTextBox-element').getFocus()
	},
	customSave() {
		const read = getElementReader('setTextBox')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setTextBox-properties').getFocus()
		}
		Command.save({ element, properties })
	}
})
