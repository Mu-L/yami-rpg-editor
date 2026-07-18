'use strict'
import { $, getElementReader } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Data } from '../../data/data-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setLanguage = new CommandSchema({
	name: 'setLanguage',
	fields: [{ key: 'language', default: 'auto' }],
	customParse({ language }) {
		return [
			{ color: 'system' },
			{ text: Local.get('command.setLanguage') + Token(': ') },
			{ text: Local.get('languages.' + language) }
		]
	},
	onLoad(data) {
		const el = $('#setLanguage-language')
		el.loadItems(this.createLanguageItems())
		el.write(data.language ?? 'auto')
		el.getFocus()
	},
	customSave() {
		Command.save({ language: getElementReader('setLanguage')('language') })
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
