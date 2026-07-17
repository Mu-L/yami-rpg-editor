'use strict'

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
