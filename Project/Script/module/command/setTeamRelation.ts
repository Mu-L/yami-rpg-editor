import { $ } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { Data } from '../../data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.setTeamRelation = new CommandSchema({
	name: 'setTeamRelation',
	fields: [
		{ key: 'teamId1', default: () => Data.teams.list[0].id },
		{ key: 'teamId2', default: () => Data.teams.list[0].id },
		{ key: 'relation', default: 0 }
	],
	onInitialize() {
		$('#setTeamRelation-confirm').on('click', () => this.save());
		$('#setTeamRelation-relation').loadItems([
			{ name: 'Enemy', value: 0 },
			{ name: 'Friend', value: 1 }
		]);
		$('#setTeamRelation').on('open', function (event) {
			const items = Data.createTeamItems();
			$('#setTeamRelation-teamId1').loadItems(items);
			$('#setTeamRelation-teamId2').loadItems(items);
		});
		$('#setTeamRelation').on('closed', function (event) {
			$('#setTeamRelation-teamId1').clear();
			$('#setTeamRelation-teamId2').clear();
		});
	},
	parseRelation(relation) {
		return Local.get('command.setTeamRelation.relation.' + relation);
	},
	customParse({ teamId1, teamId2, relation }) {
		const words = Command.words
			.push(Command.parseTeam(teamId1))
			.push(Command.parseTeam(teamId2))
			.push(this.parseRelation(relation));
		return [
			{ color: 'system' },
			{ text: Local.get('command.setTeamRelation') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#setTeamRelation-teamId1').getFocus();
	}
});
