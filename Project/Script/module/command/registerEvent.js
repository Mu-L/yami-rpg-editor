'use strict'

Command.cases.registerEvent = new CommandSchema({
	name: 'registerEvent',
	commands: [],
	priorityEnabled: false,
	onInitialize() {
		$('#registerEvent-confirm').on('click', () => this.save())
		$('#registerEvent-target').loadItems([
			{ name: 'Global', value: 'global' },
			{ name: 'Actor', value: 'actor' },
			{ name: 'Element', value: 'element' }
		])
		$('#registerEvent-target')
			.enableHiddenMode()
			.relate([
				{ case: 'actor', targets: [$('#registerEvent-actor')] },
				{ case: 'element', targets: [$('#registerEvent-element')] }
			])
		$('#registerEvent-target').on('write', (event) => {
			const type = event.value
			const elEventType = $('#registerEvent-type')
			const registerType = 'register_' + type
			const eventTypes = Enum.getMergedItems(
				EventEditor.types[registerType],
				type + '-event'
			)
			this.switchTypeAndTagInput()
			elEventType.loadItems(eventTypes)
			elEventType.createTooltip()
			elEventType.write(eventTypes[0].value)
		})
		$('#registerEvent-operation').loadItems([
			{ name: 'Register', value: 'register' },
			{ name: 'Unregister', value: 'unregister' },
			{ name: 'Reset', value: 'reset' }
		])
		$('#registerEvent-operation').on('write', () => {
			this.switchTypeAndTagInput()
			this.switchPriority()
			this.switchNamespace()
		})
		$('#registerEvent-type').on('write', () => this.switchPriority())
	},
	switchTypeAndTagInput(event) {
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
	switchPriority() {
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
	switchNamespace() {
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
	customParse({
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
	customLoad({
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
		this.commands = commands
		this.switchNamespace()
		$('#registerEvent-target').getFocus()
	},
	customSave() {
		const read = getElementReader('registerEvent')
		const target = read('target')
		const operation = read('operation')
		const type = read('type')
		const commands = this.commands
		const namespace = read('namespace')
		switch (target) {
			case 'global':
				switch (operation) {
					case 'register': {
						let tag = read('tag')
						if (typeof tag === 'string') {
							tag = tag.trim()
						}
						const priority = this.priorityEnabled
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
})
