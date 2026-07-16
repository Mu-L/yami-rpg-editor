'use strict'

Command.cases.castSkill = new CommandSchema({
	name: 'castSkill',
	onInitialize() {
		$('#castSkill-confirm').on('click', () => this.save())
		$('#castSkill-mode').loadItems([
			{ name: 'By Shortcut Key', value: 'by-key' },
			{ name: 'By Skill ID', value: 'by-id' },
			{ name: 'By Skill Instance', value: 'by-skill' }
		])
		$('#castSkill-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'by-key', targets: [$('#castSkill-key')] },
				{ case: 'by-id', targets: [$('#castSkill-skillId')] },
				{ case: 'by-skill', targets: [$('#castSkill-skill')] }
			])
		$('#castSkill-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
	},
	customParse({ actor, mode, key, skillId, skill, wait }) {
		const words = Command.words.push(Command.parseActor(actor))
		switch (mode) {
			case 'by-key':
				words.push(Command.parseGroupEnumString('shortcut-key', key))
				break
			case 'by-id':
				words.push(Command.parseFileName(skillId))
				break
			case 'by-skill':
				words.push(Command.parseSkill(skill))
				break
		}
		words.push(Command.parseWait(wait))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.castSkill') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		actor = { type: 'trigger' },
		mode = 'by-key',
		key = Enum.getDefStringId('shortcut-key'),
		skillId = '',
		skill = { type: 'trigger' },
		wait = false
	}) {
		$('#castSkill-key').loadItems(Enum.getStringItems('shortcut-key'))
		const write = getElementWriter('castSkill')
		write('actor', actor)
		write('mode', mode)
		write('key', key)
		write('skillId', skillId)
		write('skill', skill)
		write('wait', wait)
		$('#castSkill-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('castSkill')
		const actor = read('actor')
		const mode = read('mode')
		const wait = read('wait')
		switch (mode) {
			case 'by-key': {
				const key = read('key')
				if (key === '') {
					return $('#castSkill-key').getFocus()
				}
				Command.save({ actor, mode, key, wait })
				break
			}
			case 'by-id': {
				const skillId = read('skillId')
				if (skillId === '') {
					return $('#castSkill-skillId').getFocus()
				}
				Command.save({ actor, mode, skillId, wait })
				break
			}
			case 'by-skill': {
				Command.save({
					actor,
					mode,
					skill: read('skill'),
					wait
				})
				break
			}
		}
	}
})
