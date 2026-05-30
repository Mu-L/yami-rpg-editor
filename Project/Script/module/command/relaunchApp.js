Command.cases.relaunchApp = {
	parse: function () {
		return [{ color: 'system' }, { text: Local.get('command.relaunchApp') }]
	},
	save: function () {
		Command.save({})
	}
}
