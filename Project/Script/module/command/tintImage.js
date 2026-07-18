'use strict'
import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Data } from '../../data/data-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.tintImage = new CommandSchema({
	name: 'tintImage',
	onInitialize() {
		$('#tintImage-confirm').on('click', () => this.save())
		$('#tintImage-mode').loadItems([
			{ name: 'Full', value: 'full' },
			{ name: 'RGB', value: 'rgb' },
			{ name: 'Gray', value: 'gray' }
		])
		$('#tintImage-mode')
			.enableHiddenMode()
			.relate([
				{
					case: 'full',
					targets: [
						$('#tintImage-tint-0'),
						$('#tintImage-tint-1'),
						$('#tintImage-tint-2'),
						$('#tintImage-tint-3')
					]
				},
				{
					case: 'rgb',
					targets: [
						$('#tintImage-tint-0'),
						$('#tintImage-tint-1'),
						$('#tintImage-tint-2')
					]
				},
				{ case: 'gray', targets: [$('#tintImage-tint-3')] }
			])
		$('#tintImage-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#tintImage').on('open', () => {
			$('#tintImage-easingId').loadItems(Data.createEasingItems())
		})
		$('#tintImage').on('closed', () => {
			$('#tintImage-easingId').clear()
			$('#tintImage-filter').clear()
		})
		$(
			'#tintImage-mode, #tintImage-tint-0, #tintImage-tint-1, #tintImage-tint-2, #tintImage-tint-3'
		).on('input', () => {
			const tint = [0, 0, 0, 0]
			const read = getElementReader('tintImage')
			switch (read('mode')) {
				case 'full':
					tint[0] = read('tint-0')
					tint[1] = read('tint-1')
					tint[2] = read('tint-2')
					tint[3] = read('tint-3')
					break
				case 'rgb':
					tint[0] = read('tint-0')
					tint[1] = read('tint-1')
					tint[2] = read('tint-2')
					break
				case 'gray':
					tint[3] = read('tint-3')
					break
			}
			$('#tintImage-filter').write(tint)
		})
	},
	parseTint(mode, [red, green, blue, gray]) {
		const label = Local.get('command.tintImage.' + mode)
		const _red = Command.setNumberColor(red)
		const _green = Command.setNumberColor(green)
		const _blue = Command.setNumberColor(blue)
		const _gray = Command.setNumberColor(gray)
		switch (mode) {
			case 'full':
				return (
					label +
					Token('(') +
					_red +
					Token(', ') +
					_green +
					Token(', ') +
					_blue +
					Token(', ') +
					_gray +
					Token(')')
				)
			case 'rgb':
				return (
					label +
					Token('(') +
					_red +
					Token(', ') +
					_green +
					Token(', ') +
					_blue +
					Token(')')
				)
			case 'gray':
				return label + Token('(') + _gray + Token(')')
		}
	},
	customParse({ element, mode, tint, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseElement(element))
			.push(this.parseTint(mode, tint))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'element' },
			{ text: Local.get('command.tintImage') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		element = { type: 'trigger' },
		mode = 'full',
		tint = [0, 0, 0, 0],
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('tintImage')
		write('element', element)
		write('mode', mode)
		write('tint-0', tint[0])
		write('tint-1', tint[1])
		write('tint-2', tint[2])
		write('tint-3', tint[3])
		write('filter', tint)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#tintImage-element').getFocus()
	},
	customSave() {
		const read = getElementReader('tintImage')
		const element = read('element')
		const mode = read('mode')
		let red = read('tint-0')
		let green = read('tint-1')
		let blue = read('tint-2')
		let gray = read('tint-3')
		switch (mode) {
			case 'full':
				break
			case 'rgb':
				gray = 0
				break
			case 'gray':
				red = 0
				green = 0
				blue = 0
				break
		}
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		const tint = [red, green, blue, gray]
		Command.save({ element, mode, tint, easingId, duration, wait })
	}
})
