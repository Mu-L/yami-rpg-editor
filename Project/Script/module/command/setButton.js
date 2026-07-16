'use strict'

Command.cases.setButton = new CommandSchema({
	name: 'setButton',
	onInitialize() {
		$('#setButton-confirm').on('click', () => this.save())
		$('#setButton-properties').bind(ButtonProperty)
		$('#setButton').on('closed', (event) => {
			$('#setButton-properties').clear()
		})
	},
	customParse({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(ButtonProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setButton') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setButton')
		write('element', element)
		write('properties', properties.slice())
		$('#setButton-element').getFocus()
	},
	customSave() {
		const read = getElementReader('setButton')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setButton-properties').getFocus()
		}
		Command.save({ element, properties })
	}
})
