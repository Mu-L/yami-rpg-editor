import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.changeThreat = new CommandSchema({
	name: 'changeThreat',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'target', default: { type: 'trigger' } },
		{ key: 'operation', default: 'increase' },
		{ key: 'threat', default: 0 }
	],
	onInitialize() {
		$('#changeThreat-confirm').on('click', () => this.save());
		$('#changeThreat-operation').loadItems([
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		]);
	},
	parseActors(actor: any, target: any) {
		const sActor = Command.parseActor(actor);
		const dActor = Command.parseActor(target);
		return sActor + Token(' -> ') + dActor;
	},
	parseOperation(operation: any) {
		return Local.get('command.changeThreat.' + operation);
	},
	customParse({ actor, target, operation, threat }) {
		const words = Command.words
			.push(this.parseActors(actor, target))
			.push(this.parseOperation(operation))
			.push(Command.parseVariableNumber(threat));
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeThreat') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#changeThreat-actor').getFocus();
	}
});
