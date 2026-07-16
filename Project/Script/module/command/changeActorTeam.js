'use strict'

Command.cases.changeActorTeam = new CommandSchema({
	name: 'changeActorTeam',
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
	customLoad({
		actor = { type: 'trigger' },
		teamId = Data.teams.list[0].id
	}) {
		const write = getElementWriter('changeActorTeam')
		write('actor', actor)
		write('teamId', teamId)
		$('#changeActorTeam-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('changeActorTeam')
		Command.save({ actor: read('actor'), teamId: read('teamId') })
	}
})
