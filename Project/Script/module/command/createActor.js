'use strict'

Command.cases.createActor = {
	initialize: function () {
		$('#createActor-confirm').on('click', this.save)

		// 创建队伍选项 - 窗口打开事件
		$('#createActor').on('open', function (event) {
			$('#createActor-teamId').loadItems(Data.createTeamItems())
		})

		// 清理内存 - 窗口已关闭事件
		$('#createActor').on('closed', function (event) {
			$('#createActor-teamId').clear()
		})
	},
	parse: function ({ actorId, teamId, position, angle }) {
		const words = Command.words
			.push(Command.parseFileName(actorId))
			.push(Command.parseTeam(teamId))
			.push(Command.parsePosition(position))
			.push(Command.parseVariableNumber(angle, '°'))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.createActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actorId = '',
		teamId = Data.teams.list[0].id,
		position = { type: 'absolute', x: 0, y: 0 },
		angle = 0
	}) {
		const write = getElementWriter('createActor')
		write('actorId', actorId)
		write('teamId', teamId)
		write('position', position)
		write('angle', angle)
		$('#createActor-actorId').getFocus('all')
	},
	save: function () {
		const read = getElementReader('createActor')
		const actorId = read('actorId')
		const teamId = read('teamId')
		const position = read('position')
		const angle = read('angle')
		if (actorId === '') {
			return $('#createActor-actorId').getFocus()
		}
		Command.save({ actorId, teamId, position, angle })
	}
}
