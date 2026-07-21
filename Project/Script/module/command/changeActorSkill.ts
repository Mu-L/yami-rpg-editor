import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.changeActorSkill = new CommandSchema({
	name: 'changeActorSkill',
	onInitialize() {
		$('#changeActorSkill-confirm').on('click', () => this.save());
		$('#changeActorSkill-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Remove Instance', value: 'remove-instance' },
			{ name: 'Sort by Filename', value: 'sort-by-order' }
		]);
		$('#changeActorSkill-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['add', 'remove'],
					targets: [$('#changeActorSkill-skillId')]
				},
				{
					case: 'remove-instance',
					targets: [$('#changeActorSkill-skill')]
				}
			]);
	},
	parseOperation(operation) {
		return Local.get('command.changeActorSkill.' + operation);
	},
	customParse({ actor, operation, skill, skillId }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(this.parseOperation(operation));
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseVariableFile(skillId));
				break;
			case 'remove-instance':
				words.push(Command.parseSkill(skill));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorSkill') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		actor = { type: 'trigger' },
		operation = 'add',
		skillId = '',
		skill = { type: 'trigger' }
	}) {
		const write = getElementWriter('changeActorSkill');
		write('actor', actor);
		write('operation', operation);
		write('skillId', skillId);
		write('skill', skill);
		$('#changeActorSkill-actor').getFocus();
	},
	customSave() {
		const read = getElementReader('changeActorSkill');
		const actor = read('actor');
		const operation = read('operation');
		switch (operation) {
			case 'add':
			case 'remove': {
				const skillId = read('skillId');
				if (skillId === '') {
					return $('#changeActorSkill-skillId').getFocus();
				}
				Command.save({ actor, operation, skillId });
				break;
			}
			case 'remove-instance': {
				Command.save({
					actor,
					operation,
					skill: read('skill')
				});
				break;
			}
			case 'sort-by-order':
				Command.save({ actor, operation });
				break;
		}
	}
});
