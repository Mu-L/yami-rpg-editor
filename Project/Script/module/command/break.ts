import { Command } from '@/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.break = new CommandSchema({
	name: 'break',
	noWindow: true,
	customParse() {
		return [{ color: 'flow' }, { text: Local.get('command.break') }];
	},
	customSave() {
		Command.save({});
	}
});
