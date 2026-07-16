'use strict'

Command.cases.label = new CommandSchema({
	name: 'label',
	fields: [
		{ key: 'name', domId: 'name', default: '', required: true, trim: true }
	],
	customParse({ name }) {
		return [
			{ color: 'flow' },
			{ text: Local.get('command.label') + Token(': ') },
			{ color: 'label' },
			{ text: name }
		]
	},
	onLoad() {
		$('#label-name').getFocus('all')
	}
})
