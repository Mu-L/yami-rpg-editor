'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Team } from '../../data/team-window.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.discardTargets = new CommandSchema({
	name: 'discardTargets',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'selector', default: 'any' },
		{ key: 'distance', default: 0 }
	],
	onInitialize() {
		$('#discardTargets-confirm').on('click', () => this.save())
		$('#discardTargets-selector').loadItems([
			{ name: 'Enemy', value: 'enemy' },
			{ name: 'Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Team Member Except Self', value: 'team-except-self' },
			{ name: 'Any Except Self', value: 'any-except-self' },
			{ name: 'Any', value: 'any' }
		])
	},
	customParse({ actor, selector, distance }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActorSelector(selector))
		if (distance !== 0) {
			words.push(Token('>=') + Command.parseVariableNumber(distance, 't'))
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.discardTargets') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#discardTargets-actor').getFocus()
	}
})
