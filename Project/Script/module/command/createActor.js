import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Data } from '../../data/data-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.createActor = new CommandSchema({
	name: 'createActor',
	onInitialize() {
		$('#createActor-confirm').on('click', () => this.save())
		$('#createActor').on('open', function (event) {
			$('#createActor-teamId').loadItems(Data.createTeamItems())
		})
		$('#createActor').on('closed', function (event) {
			$('#createActor-teamId').clear()
		})
	},
	customParse({ actorId, teamId, position, angle }) {
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
	customLoad({
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
	customSave() {
		const read = getElementReader('createActor')
		const actorId = read('actorId')
		if (actorId === '') {
			return $('#createActor-actorId').getFocus()
		}
		Command.save({
			actorId,
			teamId: read('teamId'),
			position: read('position'),
			angle: read('angle')
		})
	}
})
