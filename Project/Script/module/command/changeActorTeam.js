'use strict'

Command.cases.changeActorTeam = {
	initialize: function () {
		$('#changeActorTeam-confirm').on('click', this.save)

		// 创建队伍选项 - 窗口打开事件
		$('#changeActorTeam').on('open', function (event) {
			$('#changeActorTeam-teamId').loadItems(Data.createTeamItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#changeActorTeam').on('closed', function (event) {
			$('#changeActorTeam-teamId').clear()
		})
	},
	parse: function ({ actor, teamId }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseTeam(teamId))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorTeam') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		teamId = Data.teams.list[0].id
	}) {
		const write = getElementWriter('changeActorTeam')
		write('actor', actor)
		write('teamId', teamId)
		$('#changeActorTeam-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeActorTeam')
		const actor = read('actor')
		const teamId = read('teamId')
		Command.save({ actor, teamId })
	}
}
