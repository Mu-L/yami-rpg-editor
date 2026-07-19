import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { TransformProperty } from '../../command/move-element-property-window.js'
import { Data } from '../../data/data-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.moveElement = new CommandSchema({
	name: 'moveElement',
	onInitialize() {
		$('#moveElement-confirm').on('click', () => this.save())
		$('#moveElement-properties').bind(TransformProperty)
		$('#moveElement-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#moveElement').on('open', function (event) {
			$('#moveElement-easingId').loadItems(Data.createEasingItems())
		})
		$('#moveElement').on('closed', function (event) {
			$('#moveElement-properties').clear()
			$('#moveElement-easingId').clear()
		})
	},
	customParse({ element, properties, easingId, duration, wait }) {
		const words = Command.words.push(Command.parseElement(element))
		for (const property of properties) {
			words.push(TransformProperty.parse(property))
		}
		words.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'element' },
			{ text: Local.get('command.moveElement') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		element = { type: 'trigger' },
		properties = [],
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('moveElement')
		write('element', element)
		write('properties', properties.slice())
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#moveElement-element').getFocus()
	},
	customSave() {
		const read = getElementReader('moveElement')
		const properties = read('properties')
		if (properties.length === 0) {
			return $('#moveElement-properties').getFocus()
		}
		Command.save({
			element: read('element'),
			properties,
			easingId: read('easingId'),
			duration: read('duration'),
			wait: read('wait')
		})
	}
})
