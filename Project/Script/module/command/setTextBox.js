'use strict'

Command.cases.setTextBox = new CommandSchema({
	name: 'setTextBox',
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
	customLoad({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setTextBox')
		write('element', element)
		write('properties', properties.slice())
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
