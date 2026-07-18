'use strict'
import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Attribute } from '../../attribute/attribute-window.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Team } from '../../data/team-window.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.getTarget = new CommandSchema({
	name: 'getTarget',
	onInitialize() {
		$('#getTarget-confirm').on('click', () => this.save())
		$('#getTarget-selector').loadItems([
			{ name: 'Enemy', value: 'enemy' },
			{ name: 'Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Team Member Except Self', value: 'team-except-self' },
			{ name: 'Any Except Self', value: 'any-except-self' },
			{ name: 'Any', value: 'any' }
		])
		$('#getTarget-condition').loadItems([
			{ name: 'Max Threat', value: 'max-threat' },
			{ name: 'Nearest', value: 'nearest' },
			{ name: 'Farthest', value: 'farthest' },
			{ name: 'Min Attribute Value', value: 'min-attribute-value' },
			{ name: 'Max Attribute Value', value: 'max-attribute-value' },
			{ name: 'Min Attribute Ratio', value: 'min-attribute-ratio' },
			{ name: 'Max Attribute Ratio', value: 'max-attribute-ratio' },
			{ name: 'Random', value: 'random' }
		])
		$('#getTarget-condition')
			.enableHiddenMode()
			.relate([
				{
					case: ['min-attribute-value', 'max-attribute-value'],
					targets: [$('#getTarget-attribute')]
				},
				{
					case: ['min-attribute-ratio', 'max-attribute-ratio'],
					targets: [
						$('#getTarget-attribute'),
						$('#getTarget-divisor')
					]
				}
			])
	},
	parseCondition(condition, attribute, divisor) {
		const label = Local.get('command.getTarget.condition.' + condition)
		switch (condition) {
			case 'max-threat':
			case 'nearest':
			case 'farthest':
			case 'random':
				return label
			case 'min-attribute-value':
			case 'max-attribute-value':
				return (
					label +
					Token('(') +
					Command.parseAttributeKey('actor', attribute) +
					Token(')')
				)
			case 'min-attribute-ratio':
			case 'max-attribute-ratio':
				return (
					label +
					Token('(') +
					Command.parseAttributeKey('actor', attribute) +
					Token(' / ') +
					Command.parseAttributeKey('actor', divisor) +
					Token(')')
				)
		}
	},
	customParse({ actor, selector, condition, attribute, divisor }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActorSelector(selector))
			.push(this.parseCondition(condition, attribute, divisor))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.getTarget') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		actor = { type: 'trigger' },
		selector = 'enemy',
		condition = 'max-threat',
		attribute = Attribute.getDefAttributeId('actor', 'number'),
		divisor = Attribute.getDefAttributeId('actor', 'number')
	}) {
		const attrItems = Attribute.getAttributeItems('actor', 'number')
		$('#getTarget-attribute').loadItems(attrItems)
		$('#getTarget-divisor').loadItems(attrItems)
		const write = getElementWriter('getTarget')
		write('actor', actor)
		write('selector', selector)
		write('condition', condition)
		write('attribute', attribute)
		write('divisor', divisor)
		$('#getTarget-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('getTarget')
		const actor = read('actor')
		const selector = read('selector')
		const condition = read('condition')
		switch (condition) {
			case 'max-threat':
			case 'nearest':
			case 'farthest':
			case 'random':
				Command.save({ actor, selector, condition })
				break
			case 'min-attribute-value':
			case 'max-attribute-value': {
				const attribute = read('attribute')
				if (attribute === '') {
					return $('#getTarget-attribute').getFocus()
				}
				Command.save({ actor, selector, condition, attribute })
				break
			}
			case 'min-attribute-ratio':
			case 'max-attribute-ratio': {
				const attribute = read('attribute')
				const divisor = read('divisor')
				if (attribute === '') {
					return $('#getTarget-attribute').getFocus()
				}
				if (divisor === '') {
					return $('#getTarget-divisor').getFocus()
				}
				Command.save({ actor, selector, condition, attribute, divisor })
				break
			}
		}
	}
})
