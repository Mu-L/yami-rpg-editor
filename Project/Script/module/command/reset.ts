import { Command } from '@/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.reset = new CommandSchema({
	name: 'reset',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: Local.get('command.reset') }];
	},
	customSave() {
		Command.save({});
	}
});
