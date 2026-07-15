'use strict'

Command.cases.registerEvent = {
	commands: [],
	priorityEnabled: false,
	initialize: function () {
		$('#registerEvent-confirm').on('click', this.save)

		// 创建目标选项
		$('#registerEvent-target').loadItems([
			{ name: 'Global', value: 'global' },
			{ name: 'Actor', value: 'actor' },
			{ name: 'Element', value: 'element' }
		])

		// 设置目标关联元素
		$('#registerEvent-target')
			.enableHiddenMode()
			.relate([
				{ case: 'actor', targets: [$('#registerEvent-actor')] },
				{ case: 'element', targets: [$('#registerEvent-element')] }
			])

		// 目标 - 写入事件
		$('#registerEvent-target').on('write', (event) => {
			const type = event.value
			const elEventType = $('#registerEvent-type')
			const registerType = 'register_' + type
			const eventTypes = Enum.getMergedItems(
				EventEditor.types[registerType],
				type + '-event'
			)
			this.switchTypeAndTagInput()
			// 加载事件类型选项
			elEventType.loadItems(eventTypes)
			elEventType.createTooltip()
			elEventType.write(eventTypes[0].value)
		})

		// 创建操作选项
		$('#registerEvent-operation').loadItems([
			{ name: 'Register', value: 'register' },
			{ name: 'Unregister', value: 'unregister' },
			{ name: 'Reset', value: 'reset' }
		])

		// 事件操作 - 写入事件
		$('#registerEvent-operation').on('write', () => {
			this.switchTypeAndTagInput()
			this.switchPriority()
			this.switchNamespace()
		})

		// 事件类型 - 写入事件
		$('#registerEvent-type').on('write', () => this.switchPriority())
	},
	switchTypeAndTagInput: function (event) {
		const show = (input) => {
			input.previousElementSibling.show()
			input.show()
		}
		const hide = (input) => {
			input.previousElementSibling.hide()
			input.hide()
		}
		const typeInput = $('#registerEvent-type')
		const tagInput = $('#registerEvent-tag')
		const target = $('#registerEvent-target').read()
		const operation = $('#registerEvent-operation').read()
		switch (target) {
			case 'global':
				switch (operation) {
					case 'register':
						show(typeInput)
						show(tagInput)
						break
					case 'unregister':
						hide(typeInput)
						show(tagInput)
						break
					case 'reset':
						hide(typeInput)
						hide(tagInput)
						break
				}
				break
			case 'actor':
			case 'element':
				switch (operation) {
					case 'register':
					case 'unregister':
						show(typeInput)
						hide(tagInput)
						break
					case 'reset':
						hide(typeInput)
						hide(tagInput)
						break
				}
				break
		}
	},
	switchPriority: function () {
		const priorityTypes = {
			input: true,
			keydown: true,
			keyup: true,
			mousedown: true,
			mouseup: true,
			mousemove: true,
			doubleclick: true,
			wheel: true,
			touchstart: true,
			touchmove: true,
			touchend: true,
			gamepadbuttonpress: true,
			gamepadbuttonrelease: true,
			gamepadleftstickchange: true,
			gamepadrightstickchange: true
		}
		const target = $('#registerEvent-target').read()
		const operation = $('#registerEvent-operation').read()
		const type = $('#registerEvent-type').read()
		const priority = $('#registerEvent-priority')
		if (
			target === 'global' &&
			operation === 'register' &&
			type in priorityTypes
		) {
			priority.previousElementSibling.show()
			priority.show()
			this.priorityEnabled = true
		} else {
			priority.previousElementSibling.hide()
			priority.hide()
			this.priorityEnabled = false
		}
	},
	switchNamespace: function () {
		const namespace = $('#registerEvent-namespace')
		const operation = $('#registerEvent-operation').read()
		if (operation === 'register') {
			namespace.previousElementSibling.show()
			namespace.show()
		} else {
			namespace.previousElementSibling.hide()
			namespace.hide()
		}
	},
	parse: function ({
		target,
		actor,
		element,
		operation,
		type,
		priority,
		tag,
		commands,
		namespace
	}) {
		const words = Command.words
		switch (target) {
			case 'global':
				switch (operation) {
					case 'register': {
						const priorityFlag = priority
							? Command.setOperatorColor('*')
							: ''
						const tagName = tag
							? Token('(') +
								Command.parseVariableString(tag) +
								Token(')')
							: ''
						words.push(
							Command.parseEventType(target + '-event', type) +
								priorityFlag +
								tagName
						)
						break
					}
					case 'unregister': {
						const tagName =
							Token('(') +
							Command.parseVariableString(tag) +
							Token(')')
						words.push(
							Local.get(
								'command.registerEvent.reset.global-event'
							) + tagName
						)
						break
					}
					case 'reset':
						words.push(
							Local.get(
								'command.registerEvent.reset.global-events'
							)
						)
						break
				}
				break
			case 'actor':
				switch (operation) {
					case 'register':
					case 'unregister':
						words.push(Command.parseActor(actor))
						words.push(
							Command.parseEventType(target + '-event', type)
						)
						break
					case 'reset':
						words.push(
							Command.parseActor(actor) +
								Token(' -> ') +
								Local.get('command.registerEvent.reset.events')
						)
						break
				}
				break
			case 'element':
				switch (operation) {
					case 'register':
					case 'unregister':
						words.push(Command.parseElement(element))
						words.push(
							Command.parseEventType(target + '-event', type)
						)
						break
					case 'reset':
						words.push(
							Command.parseElement(element) +
								Token(' -> ') +
								Local.get('command.registerEvent.reset.events')
						)
						break
				}
				break
		}
		if (operation === 'register' && namespace) {
			words.push(Local.get('command.registerEvent.namespace'))
		}

		const contents = [
			{ color: 'flow' },
			{
				text:
					Local.get('command.registerEvent.alias.' + operation) +
					Token(': ')
			},
			{ text: words.join() }
		]
		if (commands) {
			contents.unshift({ fold: true })
			contents.push(
				{ children: commands },
				{ color: 'flow' },
				{ text: Local.get('command.registerEvent.end') }
			)
		}
		return contents
	},
	load: function ({
		target = 'global',
		actor = { type: 'trigger' },
		element = { type: 'trigger' },
		operation = 'register',
		type = 'autorun',
		priority = false,
		namespace = false,
		tag = '',
		commands = []
	}) {
		const write = getElementWriter('registerEvent')
		write('target', target)
		write('actor', actor)
		write('element', element)
		write('operation', operation)
		write('type', type)
		write('priority', priority)
		write('namespace', namespace)
		write('tag', tag)
		Command.cases.registerEvent.commands = commands
		this.switchNamespace()
		$('#registerEvent-target').getFocus()
	},
	save: function () {
		const read = getElementReader('registerEvent')
		const target = read('target')
		const operation = read('operation')
		const type = read('type')
		const commands = Command.cases.registerEvent.commands
		const namespace = read('namespace')
		switch (target) {
			case 'global':
				switch (operation) {
					case 'register': {
						let tag = read('tag')
						if (typeof tag === 'string') {
							tag = tag.trim()
						}
						const priority = Command.cases.registerEvent
							.priorityEnabled
							? read('priority')
							: false
						Command.save({
							target,
							operation,
							type,
							priority,
							namespace,
							tag,
							commands
						})
						break
					}
					case 'unregister': {
						let tag = read('tag')
						if (
							typeof tag === 'string' &&
							(tag = tag.trim()) === ''
						) {
							return $('#registerEvent-tag').getFocus()
						}
						Command.save({ target, operation, tag })
						break
					}
					case 'reset':
						Command.save({ target, operation })
						break
				}
				break
			case 'actor': {
				const actor = read('actor')
				switch (operation) {
					case 'register':
						Command.save({
							target,
							actor,
							operation,
							type,
							namespace,
							commands
						})
						break
					case 'unregister':
						Command.save({ target, actor, operation, type })
						break
					case 'reset':
						Command.save({ target, actor, operation })
						break
				}
				break
			}
			case 'element': {
				const element = read('element')
				switch (operation) {
					case 'register':
						Command.save({
							target,
							element,
							operation,
							type,
							namespace,
							commands
						})
						break
					case 'unregister':
						Command.save({ target, element, operation, type })
						break
					case 'reset':
						Command.save({ target, element, operation })
						break
				}
				break
			}
		}
	}
}
