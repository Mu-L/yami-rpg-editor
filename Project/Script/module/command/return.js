import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { VariableGetter } from '../../command/variable-accessor-window.js'
import { CommandSchema } from './schema.js'
import { Light } from '../../scene/light.js'
import { Local } from '../../tools/localization.js'

Command.cases.return = new CommandSchema({
	name: 'return',
	typeItems: {
		none: { name: 'None', value: 'none' },
		boolean: { name: 'Boolean', value: 'boolean' },
		number: { name: 'Number', value: 'number' },
		string: { name: 'String', value: 'string' },
		object: { name: 'Object', value: 'object' },
		actor: { name: 'Actor', value: 'actor' },
		skill: { name: 'Skill', value: 'skill' },
		state: { name: 'State', value: 'state' },
		equipment: { name: 'Equipment', value: 'equipment' },
		item: { name: 'Item', value: 'item' },
		trigger: { name: 'Trigger', value: 'trigger' },
		light: { name: 'Light', value: 'light' },
		element: { name: 'Element', value: 'element' }
	},
	onInitialize() {
		$('#return-confirm').on('click', () => this.save())
		$('#return-type').loadItems(Object.values(this.typeItems))
		$('#return-boolean').loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		])
		$('#return-type')
			.enableHiddenMode()
			.relate([
				{ case: 'boolean', targets: [$('#return-boolean')] },
				{ case: 'number', targets: [$('#return-number')] },
				{ case: 'string', targets: [$('#return-string')] },
				{ case: 'object', targets: [$('#return-object')] },
				{ case: 'actor', targets: [$('#return-actor')] },
				{ case: 'skill', targets: [$('#return-skill')] },
				{ case: 'state', targets: [$('#return-state')] },
				{ case: 'equipment', targets: [$('#return-equipment')] },
				{ case: 'item', targets: [$('#return-item')] },
				{ case: 'trigger', targets: [$('#return-trigger')] },
				{ case: 'light', targets: [$('#return-light')] },
				{ case: 'element', targets: [$('#return-element')] }
			])
	},
	loadTypeItems(type) {
		let items
		switch (type) {
			case 'none':
				items = [this.typeItems.none]
				break
			case 'boolean':
				items = [this.typeItems.boolean]
				break
			case 'number':
				items = [this.typeItems.number]
				break
			case 'string':
				items = [this.typeItems.string]
				break
			case 'object':
				items = [this.typeItems.object]
				break
			case 'actor':
				items = [this.typeItems.actor]
				break
			case 'skill':
				items = [this.typeItems.skill]
				break
			case 'state':
				items = [this.typeItems.state]
				break
			case 'equipment':
				items = [this.typeItems.equipment]
				break
			case 'item':
				items = [this.typeItems.item]
				break
			case 'trigger':
				items = [this.typeItems.trigger]
				break
			case 'light':
				items = [this.typeItems.light]
				break
			case 'element':
				items = [this.typeItems.element]
				break
			default:
				throw new Error('Not implemented')
		}
		$('#return-type').loadItems(items)
	},
	customParse({ type, value }) {
		const words = Command.words
		switch (type) {
			case 'none':
				break
			case 'boolean':
				words.push(Command.setBooleanColor(value.toString()))
				break
			case 'number':
				words.push(Command.parseVariableNumber(value))
				break
			case 'string':
				words.push(Command.parseVariableString(value))
				break
			case 'object':
				words.push(Command.parseVariable(value, 'object'))
				break
			case 'actor':
				words.push(Command.parseActor(value))
				break
			case 'skill':
				words.push(Command.parseSkill(value))
				break
			case 'state':
				words.push(Command.parseState(value))
				break
			case 'equipment':
				words.push(Command.parseEquipment(value))
				break
			case 'item':
				words.push(Command.parseItem(value))
				break
			case 'trigger':
				words.push(Command.parseTrigger(value))
				break
			case 'light':
				words.push(Command.parseLight(value))
				break
			case 'element':
				words.push(Command.parseElement(value))
				break
		}
		let info = words.join()
		if (Command.returnType !== type) {
			info = Command.setClass('error') + (info || '?')
		}
		return [
			{ color: 'flow' },
			{ text: Local.get('command.return') + ' ' },
			{ color: 'restore' },
			{ text: info }
		]
	},
	customLoad({ type = Command.returnType, value = null }) {
		this.loadTypeItems(Command.returnType)
		const write = getElementWriter('return')
		write('type', type)
		write('boolean', type === 'boolean' && value !== null ? value : false)
		write('number', type === 'number' && value !== null ? value : 0)
		write('string', type === 'string' && value !== null ? value : '')
		write(
			'object',
			type === 'object' && value !== null
				? value
				: { type: 'local', key: '' }
		)
		write(
			'actor',
			type === 'actor' && value !== null ? value : { type: 'trigger' }
		)
		write(
			'skill',
			type === 'skill' && value !== null ? value : { type: 'trigger' }
		)
		write(
			'state',
			type === 'state' && value !== null ? value : { type: 'trigger' }
		)
		write(
			'equipment',
			type === 'equipment' && value !== null ? value : { type: 'trigger' }
		)
		write(
			'item',
			type === 'item' && value !== null ? value : { type: 'trigger' }
		)
		write(
			'trigger',
			type === 'trigger' && value !== null ? value : { type: 'trigger' }
		)
		write(
			'light',
			type === 'light' && value !== null ? value : { type: 'trigger' }
		)
		write(
			'element',
			type === 'element' && value !== null ? value : { type: 'trigger' }
		)
		$('#return-type').getFocus()
	},
	customSave() {
		const read = getElementReader('return')
		const type = read('type')
		switch (type) {
			case 'none':
				Command.save({ type })
				break
			case 'boolean':
				Command.save({ type, value: read('boolean') })
				break
			case 'number':
				Command.save({ type, value: read('number') })
				break
			case 'string':
				Command.save({ type, value: read('string') })
				break
			case 'object': {
				const variable = read('object')
				if (VariableGetter.isNone(variable)) {
					return $('#return-object').getFocus()
				}
				Command.save({ type, value: variable })
				break
			}
			case 'actor':
				Command.save({ type, value: read('actor') })
				break
			case 'skill':
				Command.save({ type, value: read('skill') })
				break
			case 'state':
				Command.save({ type, value: read('state') })
				break
			case 'equipment':
				Command.save({ type, value: read('equipment') })
				break
			case 'item':
				Command.save({ type, value: read('item') })
				break
			case 'trigger':
				Command.save({ type, value: read('trigger') })
				break
			case 'light':
				Command.save({ type, value: read('light') })
				break
			case 'element':
				Command.save({ type, value: read('element') })
				break
		}
	}
})
