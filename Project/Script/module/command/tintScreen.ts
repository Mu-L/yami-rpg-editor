import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { Data } from '../../data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.tintScreen = new CommandSchema({
	name: 'tintScreen',
	onInitialize() {
		$('#tintScreen-confirm').on('click', () => this.save());
		$('#tintScreen-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
		$('#tintScreen').on('open', function (event) {
			$('#tintScreen-easingId').loadItems(Data.createEasingItems());
		});
		$('#tintScreen').on('closed', function (event) {
			$('#tintScreen-easingId').clear();
			$('#tintScreen-filter').clear();
		});
		$('#tintScreen-tint-0, #tintScreen-tint-1, #tintScreen-tint-2, #tintScreen-tint-3').on(
			'input',
			function (event) {
				$('#tintScreen-filter').write([
					$('#tintScreen-tint-0').read(),
					$('#tintScreen-tint-1').read(),
					$('#tintScreen-tint-2').read(),
					$('#tintScreen-tint-3').read()
				]);
			}
		);
	},
	parseTint([red, green, blue, gray]) {
		const _red = Command.setNumberColor(red);
		const _green = Command.setNumberColor(green);
		const _blue = Command.setNumberColor(blue);
		const _gray = Command.setNumberColor(gray);
		return (
			Token('(') +
			_red +
			Token(', ') +
			_green +
			Token(', ') +
			_blue +
			Token(', ') +
			_gray +
			Token(')')
		);
	},
	customParse({ tint, easingId, duration, wait }) {
		const words = Command.words
			.push(this.parseTint(tint))
			.push(Command.parseEasing(easingId, duration, wait));
		return [
			{ color: 'scene' },
			{ text: Local.get('command.tintScreen') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({ tint = [0, 0, 0, 0], easingId = Data.easings[0].id, duration = 0, wait = false }) {
		const write = getElementWriter('tintScreen');
		write('tint-0', tint[0]);
		write('tint-1', tint[1]);
		write('tint-2', tint[2]);
		write('tint-3', tint[3]);
		write('filter', tint);
		write('easingId', easingId);
		write('duration', duration);
		write('wait', wait);
		$('#tintScreen-tint-0').getFocus('all');
	},
	customSave() {
		const read = getElementReader('tintScreen');
		const tint = [read('tint-0'), read('tint-1'), read('tint-2'), read('tint-3')];
		Command.save({
			tint,
			easingId: read('easingId'),
			duration: read('duration'),
			wait: read('wait')
		});
	}
});
