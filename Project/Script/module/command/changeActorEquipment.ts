import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { Enum } from '../../enum/enum-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.changeActorEquipment = new CommandSchema({
	name: 'changeActorEquipment',
	onInitialize() {
		$('#changeActorEquipment-confirm').on('click', () => this.save());
		$('#changeActorEquipment-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Add Instance', value: 'add-instance' },
			{ name: 'Remove Instance', value: 'remove-instance' },
			{ name: 'Remove Slot', value: 'remove-slot' }
		]);
		$('#changeActorEquipment-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'add',
					targets: [
						$('#changeActorEquipment-slot'),
						$('#changeActorEquipment-equipmentId')
					]
				},
				{
					case: 'remove',
					targets: [$('#changeActorEquipment-equipmentId')]
				},
				{
					case: 'add-instance',
					targets: [
						$('#changeActorEquipment-slot'),
						$('#changeActorEquipment-equipment')
					]
				},
				{
					case: 'remove-instance',
					targets: [$('#changeActorEquipment-equipment')]
				},
				{
					case: 'remove-slot',
					targets: [$('#changeActorEquipment-slot')]
				}
			]);
	},
	customParse({ actor, operation, slot, equipmentId, equipment }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.changeActorEquipment.' + operation));
		switch (operation) {
			case 'add': {
				const equipSlot = Command.parseVariableEnum(
					'equipment-slot',
					slot
				);
				const equipName = Command.parseFileName(equipmentId);
				words.push(equipSlot + Token(' = ') + equipName);
				break;
			}
			case 'remove':
				words.push(Command.parseFileName(equipmentId));
				break;
			case 'add-instance': {
				const equipSlot = Command.parseVariableEnum(
					'equipment-slot',
					slot
				);
				const equipName = Command.parseEquipment(equipment);
				words.push(equipSlot + Token(' = ') + equipName);
				break;
			}
			case 'remove-instance':
				words.push(Command.parseEquipment(equipment));
				break;
			case 'remove-slot':
				words.push(Command.parseVariableEnum('equipment-slot', slot));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorEquipment') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		actor = { type: 'trigger' },
		operation = 'add',
		slot = Enum.getDefStringId('equipment-slot'),
		equipmentId = '',
		equipment = { type: 'trigger' }
	}) {
		$('#changeActorEquipment-slot').loadItems(
			Enum.getStringItems('equipment-slot')
		);
		const write = getElementWriter('changeActorEquipment');
		write('actor', actor);
		write('operation', operation);
		write('slot', slot);
		write('equipmentId', equipmentId);
		write('equipment', equipment);
		$('#changeActorEquipment-actor').getFocus();
	},
	customSave() {
		const read = getElementReader('changeActorEquipment');
		const actor = read('actor');
		const operation = read('operation');
		switch (operation) {
			case 'add': {
				const slot = read('slot');
				if (slot === '') {
					return $('#changeActorEquipment-slot').getFocus();
				}
				const equipmentId = read('equipmentId');
				if (equipmentId === '') {
					return $('#changeActorEquipment-equipmentId').getFocus();
				}
				Command.save({ actor, operation, slot, equipmentId });
				break;
			}
			case 'remove': {
				const equipmentId = read('equipmentId');
				if (equipmentId === '') {
					return $('#changeActorEquipment-equipmentId').getFocus();
				}
				Command.save({ actor, operation, equipmentId });
				break;
			}
			case 'add-instance': {
				const slot = read('slot');
				if (slot === '') {
					return $('#changeActorEquipment-slot').getFocus();
				}
				Command.save({
					actor,
					operation,
					slot,
					equipment: read('equipment')
				});
				break;
			}
			case 'remove-instance': {
				Command.save({
					actor,
					operation,
					equipment: read('equipment')
				});
				break;
			}
			case 'remove-slot':
				const slot = read('slot');
				if (slot === '') {
					return $('#changeActorEquipment-slot').getFocus();
				}
				Command.save({ actor, operation, slot });
				break;
		}
	}
});
