import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { EventEditor } from '../../command/event-editor.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { Enum } from '../../enum/enum-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.stopEvent = new CommandSchema({
	name: 'stopEvent',
	onInitialize() {
		$('#stopEvent-confirm').on('click', () => this.save());
		$('#stopEvent-type').loadItems([
			{ name: 'Current', value: 'current' },
			{ name: 'Global', value: 'global' },
			{ name: 'Scene', value: 'scene' },
			{ name: 'Actor', value: 'actor' },
			{ name: 'Skill', value: 'skill' },
			{ name: 'State', value: 'state' },
			{ name: 'Equipment', value: 'equipment' },
			{ name: 'Item', value: 'item' },
			{ name: 'Light', value: 'light' },
			{ name: 'Element', value: 'element' }
		]);
		$('#stopEvent-type')
			.enableHiddenMode()
			.relate([
				{ case: 'global', targets: [$('#stopEvent-eventId')] },
				{ case: 'scene', targets: [$('#stopEvent-eventType')] },
				{
					case: 'actor',
					targets: [$('#stopEvent-actor'), $('#stopEvent-eventType')]
				},
				{
					case: 'skill',
					targets: [$('#stopEvent-skill'), $('#stopEvent-eventType')]
				},
				{
					case: 'state',
					targets: [$('#stopEvent-state'), $('#stopEvent-eventType')]
				},
				{
					case: 'equipment',
					targets: [$('#stopEvent-equipment'), $('#stopEvent-eventType')]
				},
				{
					case: 'item',
					targets: [$('#stopEvent-item'), $('#stopEvent-eventType')]
				},
				{
					case: 'light',
					targets: [$('#stopEvent-light'), $('#stopEvent-eventType')]
				},
				{
					case: 'element',
					targets: [$('#stopEvent-element'), $('#stopEvent-eventType')]
				}
			]);
		$('#stopEvent-type').on('write', (event) => {
			const type = event.value;
			if (type !== 'current') {
				const elEventType = $('#stopEvent-eventType');
				const eventTypes = Enum.getMergedItems(EventEditor.types[type], type + '-event');
				elEventType.loadItems(eventTypes);
				elEventType.createTooltip();
				elEventType.write(eventTypes[0].value);
			}
		});
	},
	customParse({
		type,
		actor,
		skill,
		state,
		equipment,
		item,
		light,
		element,
		eventId,
		eventType
	}) {
		if (type === undefined) {
			type = 'current';
		}
		const words = Command.words;
		switch (type) {
			case 'current':
				words.push(Local.get('command.stopEvent.current'));
				break;
			case 'global':
				words.push(Command.parseFileName(eventId));
				break;
			case 'scene':
				words.push(Local.get('command.stopEvent.scene'));
				break;
			case 'actor':
				words.push(Command.parseActor(actor));
				break;
			case 'skill':
				words.push(Command.parseSkill(skill));
				break;
			case 'state':
				words.push(Command.parseState(state));
				break;
			case 'equipment':
				words.push(Command.parseEquipment(equipment));
				break;
			case 'item':
				words.push(Command.parseItem(item));
				break;
			case 'light':
				words.push(Command.parseLight(light));
				break;
			case 'element':
				words.push(Command.parseElement(element));
				break;
		}
		if (eventType) {
			words.push(Command.parseEventType(type + '-event', eventType));
		}
		return [
			{ color: 'flow' },
			{ text: Local.get('command.stopEvent.alias') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		type = 'current',
		actor = { type: 'trigger' },
		skill = { type: 'trigger' },
		state = { type: 'trigger' },
		equipment = { type: 'trigger' },
		item = { type: 'trigger' },
		light = { type: 'trigger' },
		element = { type: 'trigger' },
		eventId = '',
		eventType = ''
	}) {
		const write = getElementWriter('stopEvent');
		write('type', type);
		write('actor', actor);
		write('skill', skill);
		write('state', state);
		write('equipment', equipment);
		write('item', item);
		write('light', light);
		write('element', element);
		write('eventId', eventId);
		write('eventType', eventType);
		$('#stopEvent-type').getFocus();
	},
	customSave() {
		const read = getElementReader('stopEvent');
		const type = read('type');
		switch (type) {
			case 'current':
				Command.save({ type });
				break;
			case 'global': {
				const eventId = read('eventId');
				if (eventId === '') {
					return $('#stopEvent-eventId').getFocus();
				}
				Command.save({ type, eventId });
				break;
			}
			case 'scene': {
				const eventType = read('eventType');
				if (eventType === '') {
					return $('#stopEvent-eventType').getFocus();
				}
				Command.save({ type, eventType });
				break;
			}
			default: {
				const target = read(type);
				const eventType = read('eventType');
				if (eventType === '') {
					return $('#stopEvent-eventType').getFocus();
				}
				Command.save({
					type: type,
					[type]: target,
					eventType: eventType
				});
				break;
			}
		}
	}
});
