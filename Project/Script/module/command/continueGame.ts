import { Command } from '../../command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.continueGame = new CommandSchema({
	name: 'continueGame',
	noWindow: true,
	customParse() {
		return [
			{ color: 'system' },
			{ text: Local.get('command.continueGame') }
		];
	},
	customSave() {
		Command.save({});
	}
});
