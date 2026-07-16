'use strict'

Command.cases.createElement = new CommandSchema({
	name: 'createElement',
	onInitialize() {
		$('#createElement-confirm').on('click', () => this.save())
		$('#createElement-operation').loadItems([
			{ name: 'Append All to Root', value: 'append-all-to-root' },
			{ name: 'Append One to Root', value: 'append-one-to-root' },
			{ name: 'Append All to Element', value: 'append-all-to-element' },
			{ name: 'Append One to Element', value: 'append-one-to-element' }
		])
		$('#createElement-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'append-all-to-root',
					targets: [$('#createElement-uiId')]
				},
				{
					case: 'append-one-to-root',
					targets: [$('#createElement-presetId')]
				},
				{
					case: 'append-all-to-element',
					targets: [
						$('#createElement-parent'),
						$('#createElement-uiId')
					]
				},
				{
					case: 'append-one-to-element',
					targets: [
						$('#createElement-parent'),
						$('#createElement-presetId')
					]
				}
			])
	},
	parseUIAndNodeNames(uiId) {
		const uiName = Command.parseFileName(uiId)
		const data = Data.ui[uiId]
		if (data !== undefined) {
			const words = Command.words
			const nodes = data.nodes
			for (const { name } of nodes) {
				if (name !== '') {
					words.push(Command.setPresetColor(name))
				}
				if (words.count === 5) {
					break
				}
			}
			if (words.count < nodes.length) {
				words.push(Token('...'))
			}
			return uiName + ' ' + Token('{') + words.join() + Token('}')
		}
		return uiName
	},
	customParse({ operation, parent, uiId, presetId }) {
		let info
		switch (operation) {
			case 'append-all-to-root':
				info = this.parseUIAndNodeNames(uiId)
				break
			case 'append-one-to-root':
				info = Command.parsePresetElement(presetId)
				break
			case 'append-all-to-element':
				info =
					Command.parseElement(parent) +
					Token(' -> ') +
					this.parseUIAndNodeNames(uiId)
				break
			case 'append-one-to-element':
				info =
					Command.parseElement(parent) +
					Token(' -> ') +
					Command.parsePresetElement(presetId)
				break
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.createElement') + Token(': ') },
			{ text: info }
		]
	},
	customLoad({
		operation = 'append-all-to-root',
		parent = { type: 'trigger' },
		uiId = '',
		presetId = PresetElement.getDefaultPresetId()
	}) {
		const write = getElementWriter('createElement')
		write('operation', operation)
		write('parent', parent)
		write('uiId', uiId)
		write('presetId', presetId)
		$('#createElement-operation').getFocus('all')
	},
	customSave() {
		const read = getElementReader('createElement')
		const operation = read('operation')
		switch (operation) {
			case 'append-all-to-root': {
				const uiId = read('uiId')
				if (uiId === '') {
					return $('#createElement-uiId').getFocus()
				}
				Command.save({ operation, uiId })
				break
			}
			case 'append-one-to-root': {
				const presetId = read('presetId')
				if (presetId === '') {
					return $('#createElement-presetId').getFocus()
				}
				Command.save({ operation, presetId })
				break
			}
			case 'append-all-to-element': {
				const uiId = read('uiId')
				if (uiId === '') {
					return $('#createElement-uiId').getFocus()
				}
				Command.save({
					operation,
					parent: read('parent'),
					uiId
				})
				break
			}
			case 'append-one-to-element': {
				const presetId = read('presetId')
				if (presetId === '') {
					return $('#createElement-presetId').getFocus()
				}
				Command.save({
					operation,
					parent: read('parent'),
					presetId
				})
				break
			}
		}
	}
})
