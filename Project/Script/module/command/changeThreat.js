import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.changeThreat = new CommandSchema({
	name: 'changeThreat',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'target', default: { type: 'trigger' } },
		{ key: 'operation', default: 'increase' },
		{ key: 'threat', default: 0 }
	],
	onInitialize() {
		$('#changeThreat-confirm').on('click', () => this.save())
		$('#changeThreat-operation').loadItems([
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		])
	},
	parseActors(actor, target) {
		const sActor = Command.parseActor(actor)
		const dActor = Command.parseActor(target)
		return sActor + Token(' -> ') + dActor
	},
	parseOperation(operation) {
		return Local.get('command.changeThreat.' + operation)
	},
	customParse({ actor, target, operation, threat }) {
		const words = Command.words
			.push(this.parseActors(actor, target))
			.push(this.parseOperation(operation))
			.push(Command.parseVariableNumber(threat))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeThreat') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#changeThreat-actor').getFocus()
	}
})
