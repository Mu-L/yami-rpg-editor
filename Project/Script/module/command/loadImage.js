import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { VariableGetter } from '../../command/variable-accessor-window.js'
import { Enum } from '../../enum/enum-window.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.loadImage = new CommandSchema({
	name: 'loadImage',
	onInitialize() {
		$('#loadImage-confirm').on('click', () => this.save())
		$('#loadImage-type').loadItems([
			{ name: 'Actor Portrait', value: 'actor-portrait' },
			{ name: 'Skill Icon', value: 'skill-icon' },
			{ name: 'State Icon', value: 'state-icon' },
			{ name: 'Equipment Icon', value: 'equipment-icon' },
			{ name: 'Item Icon', value: 'item-icon' },
			{ name: 'Shortcut Icon', value: 'shortcut-icon' },
			{ name: 'Base64 Image', value: 'base64' }
		])
		$('#loadImage-type')
			.enableHiddenMode()
			.relate([
				{ case: 'actor-portrait', targets: [$('#loadImage-actor')] },
				{ case: 'skill-icon', targets: [$('#loadImage-skill')] },
				{ case: 'state-icon', targets: [$('#loadImage-state')] },
				{
					case: 'equipment-icon',
					targets: [$('#loadImage-equipment')]
				},
				{ case: 'item-icon', targets: [$('#loadImage-item')] },
				{
					case: 'shortcut-icon',
					targets: [$('#loadImage-actor'), $('#loadImage-key')]
				},
				{ case: 'base64', targets: [$('#loadImage-variable')] }
			])
	},
	customParse({
		element,
		type,
		actor,
		skill,
		state,
		equipment,
		item,
		key,
		variable
	}) {
		const words = Command.words.push(Command.parseElement(element))
		const label = Local.get('command.loadImage.' + type)
		let content
		switch (type) {
			case 'actor-portrait':
				content = Command.parseActor(actor)
				break
			case 'skill-icon':
				content = Command.parseSkill(skill)
				break
			case 'state-icon':
				content = Command.parseState(state)
				break
			case 'equipment-icon':
				content = Command.parseEquipment(equipment)
				break
			case 'item-icon':
				content = Command.parseItem(item)
				break
			case 'shortcut-icon': {
				const actorInfo = Command.parseActor(actor)
				const shortcutKey = Command.parseVariableEnum(
					'shortcut-key',
					key
				)
				content = actorInfo + Token(' -> ') + shortcutKey
				break
			}
			case 'base64':
				content = Command.parseVariable(variable, 'string')
				break
		}
		words.push(label + Token('(') + content + Token(')'))
		return [
			{ color: 'element' },
			{ text: Local.get('command.loadImage') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		element = { type: 'trigger' },
		type = 'actor-portrait',
		actor = { type: 'trigger' },
		skill = { type: 'trigger' },
		state = { type: 'trigger' },
		equipment = { type: 'trigger' },
		item = { type: 'trigger' },
		key = Enum.getDefStringId('shortcut-key'),
		variable = { type: 'local', key: '' }
	}) {
		$('#loadImage-key').loadItems(Enum.getStringItems('shortcut-key'))
		const write = getElementWriter('loadImage')
		write('element', element)
		write('type', type)
		write('actor', actor)
		write('skill', skill)
		write('state', state)
		write('equipment', equipment)
		write('item', item)
		write('key', key)
		write('variable', variable)
		$('#loadImage-element').getFocus()
	},
	customSave() {
		const read = getElementReader('loadImage')
		const element = read('element')
		const type = read('type')
		switch (type) {
			case 'actor-portrait': {
				Command.save({ element, type, actor: read('actor') })
				break
			}
			case 'skill-icon': {
				Command.save({ element, type, skill: read('skill') })
				break
			}
			case 'state-icon': {
				Command.save({ element, type, state: read('state') })
				break
			}
			case 'equipment-icon': {
				Command.save({ element, type, equipment: read('equipment') })
				break
			}
			case 'item-icon': {
				Command.save({ element, type, item: read('item') })
				break
			}
			case 'shortcut-icon': {
				Command.save({
					element,
					type,
					actor: read('actor'),
					key: read('key')
				})
				break
			}
			case 'base64': {
				const variable = read('variable')
				if (VariableGetter.isNone(variable)) {
					return $('#loadImage-variable').getFocus()
				}
				Command.save({ element, type, variable })
				break
			}
		}
	}
})
