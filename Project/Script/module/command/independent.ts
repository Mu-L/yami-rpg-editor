import { Command } from '@/command/command-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.independent = new CommandSchema({
	name: 'independent',
	noWindow: true,
	customParse({ commands }) {
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.independent') },
			{ children: commands },
			{ text: Local.get('command.independent.end') }
		];
	},
	customSave() {
		Command.save({ commands: [] });
	}
});
