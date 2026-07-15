'use strict'

Command.cases.castSkill = {
	initialize: function () {
		$('#castSkill-confirm').on('click', this.save)

		// 创建模式选项
		$('#castSkill-mode').loadItems([
			{ name: 'By Shortcut Key', value: 'by-key' },
			{ name: 'By Skill ID', value: 'by-id' },
			{ name: 'By Skill Instance', value: 'by-skill' }
		])

		// 设置模式关联元素
		$('#castSkill-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'by-key', targets: [$('#castSkill-key')] },
				{ case: 'by-id', targets: [$('#castSkill-skillId')] },
				{ case: 'by-skill', targets: [$('#castSkill-skill')] }
			])

		// 创建等待结束选项
		$('#castSkill-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
	},
	parse: function ({ actor, mode, key, skillId, skill, wait }) {
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
	load: function ({
		actor = { type: 'trigger' },
		mode = 'by-key',
		key = Enum.getDefStringId('shortcut-key'),
		skillId = '',
		skill = { type: 'trigger' },
		wait = false
	}) {
		// 加载快捷键选项
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
	save: function () {
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
				const skill = read('skill')
				Command.save({ actor, mode, skill, wait })
				break
			}
		}
	}
}
