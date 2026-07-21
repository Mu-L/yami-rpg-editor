import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { Enum } from '../../enum/enum-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';
import { Shortcuts } from '../../tools/shortcut-registry.ts';

Command.cases.setShortcut = new CommandSchema({
	name: 'setShortcut',
	onInitialize() {
		$('#setShortcut-confirm').on('click', () => this.save());
		$('#setShortcut-operation').loadItems([
			{ name: 'Set Item Shortcut', value: 'set-item-shortcut' },
			{ name: 'Set Skill Shortcut', value: 'set-skill-shortcut' },
			{ name: 'Delete Shortcut', value: 'delete-shortcut' },
			{ name: 'Swap Shortcuts', value: 'swap-shortcuts' }
		]);
		$('#setShortcut-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'set-item-shortcut',
					targets: [$('#setShortcut-itemId')]
				},
				{
					case: 'set-skill-shortcut',
					targets: [$('#setShortcut-skillId')]
				},
				{ case: 'swap-shortcuts', targets: [$('#setShortcut-key2')] }
			]);
	},
	customParse({ actor, operation, itemId, skillId, key, key2 }) {
		const shortcutKey = Command.parseVariableEnum('shortcut-key', key);
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.setShortcut.' + operation));
		switch (operation) {
			case 'set-item-shortcut': {
				words.push(
					shortcutKey +
						Token(' = ') +
						Command.parseVariableFile(itemId)
				);
				break;
			}
			case 'set-skill-shortcut':
				words.push(
					shortcutKey +
						Token(' = ') +
						Command.parseVariableFile(skillId)
				);
				break;
			case 'delete-shortcut':
				words.push(shortcutKey);
				break;
			case 'swap-shortcuts':
				words.push(
					shortcutKey +
						Token(' <-> ') +
						Command.parseVariableEnum('shortcut-key', key2)
				);
				break;
		}
		return [
			{ color: 'inventory' },
			{ text: Local.get('command.setShortcut') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		actor = { type: 'trigger' },
		operation = 'set-item-shortcut',
		itemId = '',
		skillId = '',
		key = Enum.getDefStringId('shortcut-key'),
		key2 = Enum.getDefStringId('shortcut-key')
	}) {
		const items = Enum.getStringItems('shortcut-key');
		$('#setShortcut-key').loadItems(items);
		$('#setShortcut-key2').loadItems(items);
		const write = getElementWriter('setShortcut');
		write('actor', actor);
		write('operation', operation);
		write('key', key);
		write('key2', key2);
		write('itemId', itemId);
		write('skillId', skillId);
		$('#setShortcut-operation').getFocus();
	},
	customSave() {
		const read = getElementReader('setShortcut');
		const actor = read('actor');
		const operation = read('operation');
		const key = read('key');
		if (key === '') {
			return $('#setShortcut-key').getFocus();
		}
		switch (operation) {
			case 'set-item-shortcut': {
				const itemId = read('itemId');
				if (itemId === '') {
					return $('#setShortcut-itemId').getFocus();
				}
				Command.save({ actor, operation, key, itemId });
				break;
			}
			case 'set-skill-shortcut': {
				const skillId = read('skillId');
				if (skillId === '') {
					return $('#setShortcut-skillId').getFocus();
				}
				Command.save({ actor, operation, key, skillId });
				break;
			}
			case 'delete-shortcut':
				Command.save({ actor, operation, key });
				break;
			case 'swap-shortcuts': {
				const key2 = read('key2');
				Command.save({ actor, operation, key, key2 });
				break;
			}
		}
	}
});
