import { Command } from '../../command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.pauseGame = new CommandSchema({
	name: 'pauseGame',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: Local.get('command.pauseGame') }];
	},
	customSave() {
		Command.save({});
	}
});
