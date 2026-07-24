import { $ } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { Data } from '../../data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.changeActorTeam = new CommandSchema({
	name: 'changeActorTeam',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'teamId', default: () => Data.teams.list[0].id }
	],
	onInitialize() {
		$('#changeActorTeam-confirm').on('click', () => this.save());
		$('#changeActorTeam').on('open', function (event) {
			$('#changeActorTeam-teamId').loadItems(Data.createTeamItems());
		});
		$('#changeActorTeam').on('closed', function (event) {
			$('#changeActorTeam-teamId').clear();
		});
	},
	customParse({ actor, teamId }) {
		const words = Command.words.push(Command.parseActor(actor)).push(Command.parseTeam(teamId));
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorTeam') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#changeActorTeam-actor').getFocus();
	}
});
