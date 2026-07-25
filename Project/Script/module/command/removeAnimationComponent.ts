import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.removeAnimationComponent = new CommandSchema({
	name: 'removeAnimationComponent',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true },
		{ key: 'motion', default: '', required: true }
	],
	onInitialize() {
		$('#removeAnimationComponent-confirm').on('click', () => this.save());
		$('#removeAnimationComponent-animationId').on('write', (event) => {
			const elMotion = $('#removeAnimationComponent-motion');
			elMotion.loadItems(Animation.getMotionListItems(event.value));
			elMotion.write2(elMotion.read());
		});
	},
	customParse({ actor, animationId, motion }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId))
			.push(Command.parseEnumString(motion));
		return [
			{ color: 'actor' },
			{
				text: Local.get('command.removeAnimationComponent') + Token(': ')
			},
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#removeAnimationComponent-actor').getFocus();
	}
});
