'use strict'
import { $, getElementReader } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { ButtonProperty } from '../../command/set-button-property-window.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setButton = new CommandSchema({
	name: 'setButton',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'properties', default: [] }
	],
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
	onLoad() {
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
