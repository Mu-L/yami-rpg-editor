import { Command } from '../../command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.deleteScene = new CommandSchema({
	name: 'deleteScene',
	noWindow: true,
	customParse() {
		return [{ color: 'scene' }, { text: Local.get('command.deleteScene') }];
	},
	customSave() {
		Command.save({});
	}
});
