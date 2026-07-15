'use strict'

Command.cases.setTeamRelation = {
	initialize: function () {
		$('#setTeamRelation-confirm').on('click', this.save)

		// 创建关系选项
		$('#setTeamRelation-relation').loadItems([
			{ name: 'Enemy', value: 0 },
			{ name: 'Friend', value: 1 }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setTeamRelation').on('open', function (event) {
			const items = Data.createTeamItems()
			$('#setTeamRelation-teamId1').loadItems(items)
			$('#setTeamRelation-teamId2').loadItems(items)
		})

		// 清理内存 - 窗口已关闭事件
		$('#setTeamRelation').on('closed', function (event) {
			$('#setTeamRelation-teamId1').clear()
			$('#setTeamRelation-teamId2').clear()
		})
	},
	parseRelation: function (relation) {
		return Local.get('command.setTeamRelation.relation.' + relation)
	},
	parse: function ({ teamId1, teamId2, relation }) {
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
	load: function ({
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
	save: function () {
		const read = getElementReader('setTeamRelation')
		const teamId1 = read('teamId1')
		const teamId2 = read('teamId2')
		const relation = read('relation')
		Command.save({ teamId1, teamId2, relation })
	}
}
