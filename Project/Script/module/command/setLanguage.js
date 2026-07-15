'use strict'

Command.cases.setLanguage = {
	initialize: function () {
		$('#setLanguage-confirm').on('click', this.save)
	},
	parse: function ({ language }) {
		return [
			{ color: 'system' },
			{ text: Local.get('command.setLanguage') + Token(': ') },
			{ text: Local.get('languages.' + language) }
		]
	},
	load: function ({ language = 'auto' }) {
		// 创建语言选项
		$('#setLanguage-language').loadItems(this.createLanguageItems())
		$('#setLanguage-language').write(language)
		$('#setLanguage-language').getFocus()
	},
	save: function () {
		const read = getElementReader('setLanguage')
		const language = read('language')
		Command.save({ language })
	},
	createLanguageItems: function () {
		const items = []
		const languages = Local.get('languages')
		if (languages) {
			const langList = Data.config.localization.languages.map(
				(lang) => lang.name
			)
			for (const [value, name] of Object.entries(languages)) {
				if (value === 'auto' || langList.includes(value)) {
					items.push({ name, value })
				}
			}
		}
		return items
	}
}
