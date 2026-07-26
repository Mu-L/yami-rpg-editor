import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.transition = new CommandSchema({
	name: 'transition',
	commands: null,
	onInitialize() {
		$('#transition-confirm').on('click', () => this.save());
		$('#transition').on('open', function () {
			$('#transition-easingId').loadItems(Data.createEasingItems());
		});
		$('#transition').on('closed', function () {
			$('#transition-easingId').clear();
			this.commands = null;
		});
	},
	customParse({ variable, start, end, easingId, duration, commands }) {
		const varName = Command.parseVariable(variable, 'number', true);
		const from = Command.parseVariableNumber(start);
		const to = Command.parseVariableNumber(end);
		const easing = Command.parseEasing(easingId, duration);
		const expression = varName + Token(' = ') + from + Token(' -> ') + to;
		const words = Command.words.push(expression).push(easing);
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.transition') + ' ' },
			{ color: 'restore' },
			{ text: words.join() },
			{ children: commands },
			{ color: 'flow' },
			{ text: Local.get('command.transition.end') }
		];
	},
	customLoad({
		variable = { type: 'local', key: '' },
		start = 0,
		end = 1,
		easingId = Data.easings[0].id,
		duration = 1000,
		commands = []
	}) {
		const write = getElementWriter('transition');
		write('variable', variable);
		write('start', start);
		write('end', end);
		write('easingId', easingId);
		write('duration', duration);
		this.commands = commands;
		$('#transition-variable').getFocus();
	},
	customSave() {
		const read = getElementReader('transition');
		const variable = read('variable');
		if (VariableGetter.isNone(variable)) {
			return $('#transition-variable').getFocus();
		}
		const duration = read('duration');
		if (duration === 0) {
			return $('#transition-duration').getFocus('all');
		}
		Command.save({
			variable,
			start: read('start'),
			end: read('end'),
			easingId: read('easingId'),
			duration,
			commands: this.commands
		});
	}
});
