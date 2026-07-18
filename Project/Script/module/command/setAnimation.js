'use strict'
import { $, getElementReader } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { AnimationProperty } from '../../command/set-animation-property-window.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

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
