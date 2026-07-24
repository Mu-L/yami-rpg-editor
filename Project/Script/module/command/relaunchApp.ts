import { Command } from '../../command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.relaunchApp = new CommandSchema({
	name: 'relaunchApp',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: Local.get('command.relaunchApp') }];
	},
	customSave() {
		Command.save({});
	}
});
