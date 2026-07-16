'use strict'

Command.cases.setWindow = new CommandSchema({
	name: 'setWindow',
	onInitialize() {
		$('#setWindow-confirm').on('click', () => this.save())
		$('#setWindow-properties').bind(WindowProperty)
		$('#setWindow').on('closed', (event) => {
			$('#setWindow-properties').clear()
		})
	},
	customParse({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(WindowProperty.parse(property))
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setWindow') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setWindow')
		write('element', element)
		write('properties', properties.slice())
		$('#setWindow-element').getFocus()
	},
	customSave() {
		const read = getElementReader('setWindow')
		const element = read('element')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#setWindow-properties').getFocus()
		}
		Command.save({ element, properties })
	}
})
