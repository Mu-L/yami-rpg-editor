'use strict'
import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.followActor = new CommandSchema({
	name: 'followActor',
	onInitialize() {
		$('#followActor-confirm').on('click', () => this.save())
		$('#followActor-mode').loadItems([
			{ name: 'Circle', value: 'circle' },
			{ name: 'Rectangle', value: 'rectangle' }
		])
		$('#followActor-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'circle', targets: [$('#followActor-offset')] },
				{ case: 'rectangle', targets: [$('#followActor-vertDist')] }
			])
		$('#followActor-navigate').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#followActor-navigate')
			.enableHiddenMode()
			.relate([{ case: true, targets: [$('#followActor-bypass')] }])
		$('#followActor-bypass').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#followActor-once').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#followActor-once')
			.enableHiddenMode()
			.relate([{ case: true, targets: [$('#followActor-wait')] }])
		$('#followActor-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
	},
	parseActors(actor, target) {
		const sActor = Command.parseActor(actor)
		const dActor = Command.parseActor(target)
		return sActor + Token(' -> ') + dActor
	},
	customParse({
		actor,
		target,
		mode,
		minDist,
		maxDist,
		offset,
		vertDist,
		bufferDist,
		navigate,
		bypass,
		once,
		wait
	}) {
		if (bufferDist === undefined) {
			bufferDist = 0
		}
		const words = Command.words
			.push(this.parseActors(actor, target))
			.push(Local.get('command.followActor.mode.' + mode))
			.push(
				Command.parseVariableNumber(minDist) +
					Token(' ~ ') +
					Command.parseVariableNumber(maxDist)
			)
		switch (mode) {
			case 'circle':
				words.push(Command.setNumberColor(offset.toString()))
				break
			case 'rectangle':
				words.push(Command.setNumberColor(vertDist.toString()))
				break
		}
		words.push(Command.setNumberColor(bufferDist.toString()))
		if (navigate) {
			words.push(Local.get('command.followActor.navigate'))
			if (bypass) {
				words.push(Local.get('command.followActor.bypass'))
			}
		}
		if (once) {
			words.push(Local.get('command.followActor.once'))
			words.push(Command.parseWait(wait))
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.followActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		actor = { type: 'trigger' },
		target = { type: 'trigger' },
		mode = 'circle',
		minDist = 1,
		maxDist = 2,
		offset = 0,
		vertDist = 0,
		bufferDist = 0,
		navigate = true,
		bypass = false,
		once = false,
		wait = false
	}) {
		const write = getElementWriter('followActor')
		write('actor', actor)
		write('target', target)
		write('mode', mode)
		write('minDist', minDist)
		write('maxDist', maxDist)
		write('offset', offset)
		write('vertDist', vertDist)
		write('bufferDist', bufferDist)
		write('navigate', navigate)
		write('bypass', bypass)
		write('once', once)
		write('wait', wait)
		$('#followActor-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('followActor')
		const actor = read('actor')
		const target = read('target')
		const mode = read('mode')
		const minDist = read('minDist')
		const maxDist = read('maxDist')
		const bufferDist = read('bufferDist')
		const navigate = read('navigate')
		const bypass = navigate ? { bypass: read('bypass') } : {}
		const once = read('once')
		const wait = once ? read('wait') : false
		switch (mode) {
			case 'circle': {
				Command.save({
					actor,
					target,
					mode,
					minDist,
					maxDist,
					offset: read('offset'),
					bufferDist,
					navigate,
					...bypass,
					once,
					wait
				})
				break
			}
			case 'rectangle': {
				Command.save({
					actor,
					target,
					mode,
					minDist,
					maxDist,
					vertDist: read('vertDist'),
					bufferDist,
					navigate,
					...bypass,
					once,
					wait
				})
				break
			}
		}
	}
})
