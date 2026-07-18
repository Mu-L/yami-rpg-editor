'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Animation } from '../../animation/animation-window.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.addAnimationComponent = new CommandSchema({
	name: 'addAnimationComponent',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true },
		{ key: 'motion', default: '', required: true },
		{ key: 'rotatable', default: false },
		{ key: 'syncAngle', default: false },
		{ key: 'priority', default: 0 },
		{ key: 'offsetY', default: 0 }
	],
	onInitialize() {
		$('#addAnimationComponent-confirm').on('click', () => this.save())
		$('#addAnimationComponent-rotatable').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#addAnimationComponent-syncAngle').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#addAnimationComponent-animationId').on('write', (event) => {
			const elMotion = $('#addAnimationComponent-motion')
			elMotion.loadItems(Animation.getMotionListItems(event.value))
			elMotion.write2(elMotion.read())
		})
	},
	parseRotatable(rotatable) {
		return rotatable
			? Local.get('command.addAnimationComponent.rotatable')
			: ''
	},
	parseSyncAngle(syncAngle) {
		return syncAngle
			? Local.get('command.addAnimationComponent.syncAngle')
			: ''
	},
	parsePriority(priority) {
		if (priority === 0) return ''
		const abs = Command.setNumberColor(Math.abs(priority))
		return priority > 0 ? Token('+') + abs : Token('-') + abs
	},
	parseOffsetY(offsetY) {
		if (offsetY === 0) return ''
		const abs = Command.setNumberColor(Math.abs(offsetY)) + 'px'
		return offsetY > 0 ? abs : Token('-') + abs
	},
	customParse({
		actor,
		animationId,
		motion,
		rotatable,
		syncAngle,
		priority,
		offsetY
	}) {
		syncAngle = syncAngle ?? false
		offsetY = offsetY ?? 0
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId))
			.push(Command.parseEnumString(motion))
			.push(this.parseRotatable(rotatable))
			.push(this.parseSyncAngle(syncAngle))
			.push(this.parsePriority(priority))
			.push(this.parseOffsetY(offsetY))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.addAnimationComponent') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#addAnimationComponent-actor').getFocus()
	}
})
