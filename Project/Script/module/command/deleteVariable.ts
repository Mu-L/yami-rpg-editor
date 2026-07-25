import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.deleteVariable = new CommandSchema({
	name: 'deleteVariable',
	fields: [{ key: 'variable', default: { type: 'local', key: '' } }],
	customParse({ variable }) {
		return [
			{ color: 'variable' },
			{ text: Local.get('command.deleteVariable.alias') + ' ' },
			{ color: 'restore' },
			{ text: Command.parseVariable(variable, 'any') }
		];
	},
	customLoad({ variable = { type: 'local', key: '' } }) {
		$('#deleteVariable-variable').write(variable);
		$('#deleteVariable-variable').getFocus();
	},
	customSave() {
		const elVariable = $('#deleteVariable-variable');
		const variable = elVariable.read();
		if (VariableGetter.isNone(variable)) {
			return elVariable.getFocus();
		}
		Command.save({ variable });
	}
});
