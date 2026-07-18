'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Data } from '../../data/data-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.createGlobalActor = new CommandSchema({
	name: 'createGlobalActor',
	fields: [
		{ key: 'actorId', default: '', required: true },
		{ key: 'teamId', default: () => Data.teams.list[0].id }
	],
	onInitialize() {
		$('#createGlobalActor-confirm').on('click', () => this.save())
		$('#createGlobalActor').on('open', function (event) {
			$('#createGlobalActor-teamId').loadItems(Data.createTeamItems())
		})
		$('#createGlobalActor').on('closed', function (event) {
			$('#createGlobalActor-teamId').clear()
		})
	},
	customParse({ actorId, teamId }) {
		const words = Command.words
			.push(Command.parseFileName(actorId))
			.push(Command.parseTeam(teamId))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.createGlobalActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#createGlobalActor-actorId').getFocus()
	}
})
