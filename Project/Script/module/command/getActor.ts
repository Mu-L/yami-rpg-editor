import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Attribute } from '../../attribute/attribute-window.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { VariableGetter } from '../../command/variable-accessor-window.ts';
import { Data } from '../../data/data-object.ts';
import { Team } from '../../data/team-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.getActor = new CommandSchema({
	name: 'getActor',
	onInitialize() {
		$('#getActor-confirm').on('click', () => this.save());
		$('#getActor-area').loadItems([
			{ name: 'Square', value: 'square' },
			{ name: 'Circle', value: 'circle' }
		]);
		$('#getActor-area')
			.enableHiddenMode()
			.relate([
				{ case: 'square', targets: [$('#getActor-size')] },
				{ case: 'circle', targets: [$('#getActor-radius')] }
			]);
		$('#getActor-selector').loadItems([
			{ name: 'Team Enemy', value: 'enemy' },
			{ name: 'Team Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Any', value: 'any' }
		]);
		$('#getActor-selector')
			.enableHiddenMode()
			.relate([
				{
					case: ['enemy', 'friend', 'team'],
					targets: [$('#getActor-teamId')]
				}
			]);
		$('#getActor-condition').loadItems([
			{ name: 'Nearest', value: 'nearest' },
			{ name: 'Farthest', value: 'farthest' },
			{ name: 'Min Attribute Value', value: 'min-attribute-value' },
			{ name: 'Max Attribute Value', value: 'max-attribute-value' },
			{ name: 'Min Attribute Ratio', value: 'min-attribute-ratio' },
			{ name: 'Max Attribute Ratio', value: 'max-attribute-ratio' },
			{ name: 'Random', value: 'random' }
		]);
		$('#getActor-condition')
			.enableHiddenMode()
			.relate([
				{
					case: ['min-attribute-value', 'max-attribute-value'],
					targets: [$('#getActor-attribute')]
				},
				{
					case: ['min-attribute-ratio', 'max-attribute-ratio'],
					targets: [$('#getActor-attribute'), $('#getActor-divisor')]
				}
			]);
		$('#getActor-activation').loadItems([
			{ name: 'Active', value: 'active' },
			{ name: 'Inactive', value: 'inactive' },
			{ name: 'Either', value: 'either' }
		]);
		$('#getActor-exclusion').loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Exclude an Actor', value: 'actor' },
			{ name: 'Exclude a Team', value: 'team' }
		]);
		$('#getActor-exclusion')
			.enableHiddenMode()
			.relate([
				{ case: 'actor', targets: [$('#getActor-exclusionActor')] },
				{ case: 'team', targets: [$('#getActor-exclusionTeamId')] }
			]);
		$('#getActor').on('open', function (event) {
			const items = Data.createTeamItems();
			$('#getActor-teamId').loadItems(items);
			$('#getActor-exclusionTeamId').loadItems(items);
		});
		$('#getActor').on('closed', function (event) {
			$('#getActor-teamId').clear();
			$('#getActor-exclusionTeamId').clear();
		});
	},
	remapSelectorPatch(selector: any) {
		switch (selector) {
			case 'team-enemy':
				return 'enemy';
			case 'team-friend':
				return 'friend';
			case 'team-member':
				return 'team';
			default:
				return selector;
		}
	},
	remapActivationPatch(activation: any, active: any) {
		switch (active) {
			case true:
				return 'active';
			case false:
				return 'either';
			default:
				return activation;
		}
	},
	parseCondition(condition: any, attribute: any, divisor: any) {
		const label = Local.get('command.getActor.condition.' + condition);
		switch (condition) {
			case 'nearest':
			case 'farthest':
			case 'random':
				return label;
			case 'min-attribute-value':
			case 'max-attribute-value':
				return (
					label + Token('(') + Command.parseAttributeKey('actor', attribute) + Token(')')
				);
			case 'min-attribute-ratio':
			case 'max-attribute-ratio':
				return (
					label +
					Token('(') +
					Command.parseAttributeKey('actor', attribute) +
					Token(' / ') +
					Command.parseAttributeKey('actor', divisor) +
					Token(')')
				);
		}
	},
	customParse({
		variable,
		position,
		area,
		size,
		radius,
		selector,
		teamId,
		condition,
		attribute,
		divisor,
		activation,
		exclusion,
		exclusionActor,
		exclusionTeamId,
		active
	}) {
		selector = this.remapSelectorPatch(selector);
		activation = this.remapActivationPatch(activation, active);
		condition = condition ?? 'nearest';
		exclusion = exclusion ?? 'none';
		const actor = Command.parseVariable(variable, 'object', true);
		const words = Command.words
			.push(Command.parsePosition(position))
			.push(Local.get('command.getActor.' + area))
			.push(Command.parseVariableNumber(size ?? radius, 't'));
		const selectorLabel = Command.parseActorSelector(selector);
		switch (selector) {
			case 'enemy':
			case 'friend':
			case 'team':
				words.push(
					selectorLabel + Token('(') + Command.parseVariableTeam(teamId) + Token(')')
				);
				break;
			case 'any':
				words.push(selectorLabel);
				break;
		}
		words.push(this.parseCondition(condition, attribute, divisor));
		words.push(Local.get('command.getActor.' + activation));
		switch (exclusion) {
			case 'actor': {
				const label = Local.get('command.getActor.exclude');
				words.push(label + Token('(') + Command.parseActor(exclusionActor) + Token(')'));
				break;
			}
			case 'team': {
				const label = Local.get('command.getActor.exclude');
				words.push(
					label + Token('(') + Command.parseVariableTeam(exclusionTeamId) + Token(')')
				);
				break;
			}
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.getActor') + Token(': ') },
			{ text: actor + Token(' = ') + words.join() }
		];
	},
	customLoad({
		variable = { type: 'local', key: '' },
		position = { type: 'absolute', x: 0, y: 0 },
		area = 'square',
		size = 1,
		radius = 0.5,
		selector = 'enemy',
		teamId = Data.teams.list[0].id,
		condition = 'nearest',
		attribute = Attribute.getDefAttributeId('actor', 'number'),
		divisor = Attribute.getDefAttributeId('actor', 'number'),
		activation = 'active',
		exclusion = 'none',
		exclusionActor = { type: 'trigger' },
		exclusionTeamId = Data.teams.list[0].id,
		active
	}) {
		selector = this.remapSelectorPatch(selector);
		activation = this.remapActivationPatch(activation, active);
		const attrItems = Attribute.getAttributeItems('actor', 'number');
		$('#getActor-attribute').loadItems(attrItems);
		$('#getActor-divisor').loadItems(attrItems);
		const write = getElementWriter('getActor');
		write('variable', variable);
		write('position', position);
		write('area', area);
		write('size', size);
		write('radius', radius);
		write('selector', selector);
		write('teamId', teamId);
		write('condition', condition);
		write('attribute', attribute);
		write('divisor', divisor);
		write('activation', activation);
		write('exclusion', exclusion);
		write('exclusionActor', exclusionActor);
		write('exclusionTeamId', exclusionTeamId);
		$('#getActor-variable').getFocus();
	},
	customSave() {
		const read = getElementReader('getActor');
		const variable = read('variable');
		if (VariableGetter.isNone(variable)) {
			return $('#getActor-variable').getFocus();
		}
		const position = read('position');
		const area = read('area');
		const size = read('size');
		const radius = read('radius');
		const selector = read('selector');
		const teamId = read('teamId');
		const condition = read('condition');
		const attribute = read('attribute');
		const divisor = read('divisor');
		const activation = read('activation');
		const exclusion = read('exclusion');
		const exclusionActor = read('exclusionActor');
		const exclusionTeamId = read('exclusionTeamId');
		let params1;
		let params2;
		let params3;
		let params4;
		switch (area) {
			case 'square':
				params1 = { variable, position, area, size };
				break;
			case 'circle':
				params1 = { variable, position, area, radius };
				break;
		}
		switch (selector) {
			case 'enemy':
			case 'friend':
			case 'team':
				params2 = { selector, teamId };
				break;
			case 'any':
				params2 = { selector };
				break;
		}
		switch (condition) {
			case 'nearest':
			case 'farthest':
			case 'random':
				params3 = { condition };
				break;
			case 'min-attribute-value':
			case 'max-attribute-value':
				if (attribute === '') {
					return $('#getActor-attribute').getFocus();
				}
				params3 = { condition, attribute };
				break;
			case 'min-attribute-ratio':
			case 'max-attribute-ratio':
				if (attribute === '') {
					return $('#getActor-attribute').getFocus();
				}
				if (divisor === '' || attribute === divisor) {
					return $('#getActor-divisor').getFocus();
				}
				params3 = { condition, attribute, divisor };
				break;
		}
		switch (exclusion) {
			case 'none':
				params4 = { activation, exclusion };
				break;
			case 'actor':
				params4 = { activation, exclusion, exclusionActor };
				break;
			case 'team':
				params4 = { activation, exclusion, exclusionTeamId };
				break;
		}
		Command.save({ ...params1, ...params2, ...params3, ...params4 });
	}
});
