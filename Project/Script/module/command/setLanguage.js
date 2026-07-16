'use strict'

Command.cases.setLanguage = new CommandSchema({
	name: 'setLanguage',
	customParse({ language }) {
		return [
			{ color: 'system' },
			{ text: Local.get('command.setLanguage') + Token(': ') },
			{ text: Local.get('languages.' + language) }
		]
	},
	customLoad({ language = 'auto' }) {
		$('#setLanguage-language').loadItems(this.createLanguageItems())
		$('#setLanguage-language').write(language)
		$('#setLanguage-language').getFocus()
	},
	customSave() {
		const read = getElementReader('setLanguage')
		Command.save({ language: read('language') })
	},
	createLanguageItems() {
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
})
