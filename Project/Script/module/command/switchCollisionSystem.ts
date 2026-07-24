import { $ } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.switchCollisionSystem = new CommandSchema({
	name: 'switchCollisionSystem',
	fields: [{ key: 'operation', default: 'enable-actor-collision' }],
	onInitialize() {
		$('#switchCollisionSystem-confirm').on('click', () => this.save());
		$('#switchCollisionSystem-operation').loadItems([
			{ name: 'Enable Actor Collision', value: 'enable-actor-collision' },
			{
				name: 'Disable Actor Collision',
				value: 'disable-actor-collision'
			},
			{ name: 'Enable Scene Collision', value: 'enable-scene-collision' },
			{
				name: 'Disable Scene Collision',
				value: 'disable-scene-collision'
			}
		]);
	},
	customParse({ operation }) {
		return [
			{ color: 'system' },
			{ text: Local.get('command.switchCollisionSystem') + Token(': ') },
			{ text: Local.get('command.switchCollisionSystem.' + operation) }
		];
	},
	onLoad() {
		$('#switchCollisionSystem-operation').getFocus();
	}
});
