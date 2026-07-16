'use strict'

Command.cases.createGlobalActor = new CommandSchema({
	name: 'createGlobalActor',
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
	customLoad({ actorId = '', teamId = Data.teams.list[0].id }) {
		const write = getElementWriter('createGlobalActor')
		write('actorId', actorId)
		write('teamId', teamId)
		$('#createGlobalActor-actorId').getFocus()
	},
	customSave() {
		const read = getElementReader('createGlobalActor')
		const actorId = read('actorId')
		if (actorId === '') {
			return $('#createGlobalActor-actorId').getFocus()
		}
		Command.save({ actorId, teamId: read('teamId') })
	}
})
