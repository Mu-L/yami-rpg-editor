import { Command } from '@/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.unclampCamera = new CommandSchema({
	name: 'unclampCamera',
	noWindow: true,
	customParse() {
		return [{ color: 'scene' }, { text: Local.get('command.unclampCamera') }];
	},
	customSave() {
		Command.save({});
	}
});
