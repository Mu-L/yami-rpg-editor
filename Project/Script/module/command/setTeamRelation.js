'use strict'

Command.cases.setTeamRelation = new CommandSchema({
	name: 'setTeamRelation',
	onInitialize() {
		$('#setTeamRelation-confirm').on('click', () => this.save())
		$('#setTeamRelation-relation').loadItems([
			{ name: 'Enemy', value: 0 },
			{ name: 'Friend', value: 1 }
		])
		$('#setTeamRelation').on('open', function (event) {
			const items = Data.createTeamItems()
			$('#setTeamRelation-teamId1').loadItems(items)
			$('#setTeamRelation-teamId2').loadItems(items)
		})
		$('#setTeamRelation').on('closed', function (event) {
			$('#setTeamRelation-teamId1').clear()
			$('#setTeamRelation-teamId2').clear()
		})
	},
	parseRelation(relation) {
		return Local.get('command.setTeamRelation.relation.' + relation)
	},
	customParse({ teamId1, teamId2, relation }) {
		const words = Command.words
			.push(Command.parseTeam(teamId1))
			.push(Command.parseTeam(teamId2))
			.push(this.parseRelation(relation))
		return [
			{ color: 'system' },
			{ text: Local.get('command.setTeamRelation') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		teamId1 = Data.teams.list[0].id,
		teamId2 = Data.teams.list[0].id,
		relation = 0
	}) {
		const write = getElementWriter('setTeamRelation')
		write('teamId1', teamId1)
		write('teamId2', teamId2)
		write('relation', relation)
		$('#setTeamRelation-teamId1').getFocus()
	},
	customSave() {
		const read = getElementReader('setTeamRelation')
		Command.save({
			teamId1: read('teamId1'),
			teamId2: read('teamId2'),
			relation: read('relation')
		})
	}
})
