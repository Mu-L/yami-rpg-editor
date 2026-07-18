'use strict'
import { Command } from './command-object.js'
import { Local } from '../tools/localization.js'

// ******************************** 标记字符串管理器 ********************************

let _tokenMap
function buildTokenMap() {
	return {
		'=': Command.setOperatorColor('='),
		' = ': Command.setOperatorColor(' = '),
		' / ': Command.setOperatorColor(' / '),
		' <-> ': Command.setOperatorColor(' <-> '),
		'>=': Command.setOperatorColor('>='),
		'-': Command.setOperatorColor('-'),
		'+': Command.setOperatorColor('+'),
		'≤': Command.setOperatorColor('≤'),
		'(': Command.setDelimiterColor('('),
		')': Command.setDelimiterColor(')'),
		'[': Command.setDelimiterColor('['),
		']': Command.setDelimiterColor(']'),
		'{': Command.setDelimiterColor('{'),
		'}': Command.setDelimiterColor('}'),
		'<': Command.setDelimiterColor('<'),
		'>': Command.setDelimiterColor('>'),
		'.': Command.setDelimiterColor('.'),
		',': Command.setDelimiterColor(','),
		', ': Command.setDelimiterColor(', '),
		': ': Command.setDelimiterColor(': '),
		' ~ ': Command.setDelimiterColor(' ~ '),
		' x ': Command.setDelimiterColor(' x '),
		' -> ': Command.setDelimiterColor(' -> '),
		'...': Command.setDelimiterColor('...'),
		get none() {
			return Command.setBooleanColor(Local.get('common.none'))
		},
		get null() {
			return Command.setBooleanColor(Local.get('common.null'))
		}
	}
}

export const Token = (key) => {
	if (!_tokenMap) _tokenMap = buildTokenMap()
	return _tokenMap[key]
}
