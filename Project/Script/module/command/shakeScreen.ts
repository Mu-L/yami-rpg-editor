import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.shakeScreen = new CommandSchema({
	name: 'shakeScreen',
	onInitialize() {
		$('#shakeScreen-confirm').on('click', () => this.save());
		$('#shakeScreen-mode').loadItems([
			{ name: 'Random', value: 'random' },
			{ name: 'Horizontal', value: 'horizontal' },
			{ name: 'Vertical', value: 'vertical' }
		]);
		$('#shakeScreen-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
		$('#shakeScreen').on('open', function (event) {
			$('#shakeScreen-easingId').loadItems(Data.createEasingItems());
		});
		$('#shakeScreen').on('closed', function (event) {
			$('#shakeScreen-easingId').clear();
		});
	},
	customParse({ mode, power, speed, easingId, duration, wait }) {
		const words = Command.words
			.push(Local.get('command.shakeScreen.' + mode))
			.push(Command.setNumberColor(power))
			.push(Command.setNumberColor(speed))
			.push(Command.parseEasing(easingId, duration, wait));
		return [
			{ color: 'scene' },
			{ text: Local.get('command.shakeScreen') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		mode = 'random',
		power = 5,
		speed = 10,
		easingId = Data.easings[0].id,
		duration = 200,
		wait = false
	}) {
		const write = getElementWriter('shakeScreen');
		write('mode', mode);
		write('power', power);
		write('speed', speed);
		write('easingId', easingId);
		write('duration', duration);
		write('wait', wait);
		$('#shakeScreen-mode').getFocus();
	},
	customSave() {
		const read = getElementReader('shakeScreen');
		Command.save({
			mode: read('mode'),
			power: read('power'),
			speed: read('speed'),
			easingId: read('easingId'),
			duration: read('duration'),
			wait: read('wait')
		});
	}
});
