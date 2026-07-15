'use strict'

Command.cases.createGlobalActor = {
	initialize: function () {
		$('#createGlobalActor-confirm').on('click', this.save)

		// 创建队伍选项 - 窗口打开事件
		$('#createGlobalActor').on('open', function (event) {
			$('#createGlobalActor-teamId').loadItems(Data.createTeamItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#createGlobalActor').on('closed', function (event) {
			$('#createGlobalActor-teamId').clear()
		})
	},
	parse: function ({ actorId, teamId }) {
		const words = Command.words
			.push(Command.parseFileName(actorId))
			.push(Command.parseTeam(teamId))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.createGlobalActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ actorId = '', teamId = Data.teams.list[0].id }) {
		const write = getElementWriter('createGlobalActor')
		write('actorId', actorId)
		write('teamId', teamId)
		$('#createGlobalActor-actorId').getFocus()
	},
	save: function () {
		const read = getElementReader('createGlobalActor')
		const actorId = read('actorId')
		if (actorId === '') {
			return $('#createGlobalActor-actorId').getFocus()
		}
		const teamId = read('teamId')
		Command.save({ actorId, teamId })
	}
}
