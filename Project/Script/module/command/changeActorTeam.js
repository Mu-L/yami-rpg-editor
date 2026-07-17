'use strict'

Command.cases.changeActorTeam = new CommandSchema({
	name: 'changeActorTeam',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'teamId', default: () => Data.teams.list[0].id }
	],
	onInitialize() {
		$('#changeActorTeam-confirm').on('click', () => this.save())
		$('#changeActorTeam').on('open', function (event) {
			$('#changeActorTeam-teamId').loadItems(Data.createTeamItems())
		})
		$('#changeActorTeam').on('closed', function (event) {
			$('#changeActorTeam-teamId').clear()
		})
	},
	customParse({ actor, teamId }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseTeam(teamId))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorTeam') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#changeActorTeam-actor').getFocus()
	}
})
