import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { IfBranch } from '../../command/conditional-branch-window.ts';
import { IfCondition } from '../../command/conditional-condition-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.if = new CommandSchema({
	name: 'if',
	onInitialize() {
		$('#if-confirm').on('click', () => this.save());
		$('#if-branches').bind(IfBranch);
		$('#if-branch-conditions').bind(IfCondition);
		$('#if').on('closed', () => {
			this.elseCommands = null;
			$('#if-branches').clear();
		});
	},
	customParse({ branches, elseCommands }) {
		const contents: any[] = [{ fold: true }];
		const textIf = Local.get('command.if');
		const textElse = Local.get('command.if.else');
		for (let index = 0; index < branches.length; index++) {
			const branch = branches[index];
			contents.push(
				{ color: 'flow' },
				...(index === 0 ? [] : [{ text: textElse + ' ' }]),
				{ text: textIf + ' ' },
				{ color: 'normal' },
				{ text: IfBranch.parse(branch) },
				{ children: branch.commands }
			);
		}
		if (elseCommands) {
			contents.push(
				{ color: 'flow' },
				{ text: Local.get('command.if.else') },
				{ children: elseCommands }
			);
		}
		contents.push({ color: 'flow' }, { text: Local.get('command.if.end') });
		return contents;
	},
	customLoad({ branches = [], elseCommands = null }) {
		const write = getElementWriter('if');
		write('branches', branches.slice());
		write('else', !!elseCommands);
		this.elseCommands = elseCommands;
		$('#if-branches').getFocus();
	},
	customSave() {
		const read = getElementReader('if');
		const branches = read('branches');
		if (branches.length === 0) {
			return $('#if-branches').getFocus();
		}
		switch (read('else')) {
			case true: {
				const elseCommands = this.elseCommands ?? [];
				Command.save({ branches, elseCommands });
				break;
			}
			case false:
				Command.save({ branches });
				break;
		}
	}
});
