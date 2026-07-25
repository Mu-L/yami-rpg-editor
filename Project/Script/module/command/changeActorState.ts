import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.changeActorState = new CommandSchema({
	name: 'changeActorState',
	onInitialize() {
		$('#changeActorState-confirm').on('click', () => this.save());
		$('#changeActorState-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Remove Instance', value: 'remove-instance' }
		]);
		$('#changeActorState-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['add', 'remove'],
					targets: [$('#changeActorState-stateId')]
				},
				{
					case: 'remove-instance',
					targets: [$('#changeActorState-state')]
				}
			]);
	},
	parseOperation(operation: any) {
		return Local.get('command.changeActorState.' + operation);
	},
	customParse({ actor, operation, stateId, state }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(this.parseOperation(operation));
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseFileName(stateId));
				break;
			case 'remove-instance':
				words.push(Command.parseState(state));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorState') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		actor = { type: 'trigger' },
		operation = 'add',
		stateId = '',
		state = { type: 'trigger' }
	}) {
		const write = getElementWriter('changeActorState');
		write('actor', actor);
		write('operation', operation);
		write('stateId', stateId);
		write('state', state);
		$('#changeActorState-actor').getFocus();
	},
	customSave() {
		const read = getElementReader('changeActorState');
		const actor = read('actor');
		const operation = read('operation');
		switch (operation) {
			case 'add':
			case 'remove': {
				const stateId = read('stateId');
				if (stateId === '') {
					return $('#changeActorState-stateId').getFocus();
				}
				Command.save({ actor, operation, stateId });
				break;
			}
			case 'remove-instance': {
				Command.save({
					actor,
					operation,
					state: read('state')
				});
				break;
			}
		}
	}
});
