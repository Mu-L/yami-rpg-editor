import { Command } from '@/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.continue = new CommandSchema({
	name: 'continue',
	noWindow: true,
	customParse() {
		return [{ color: 'flow' }, { text: Local.get('command.continue') }];
	},
	customSave() {
		Command.save({});
	}
});
