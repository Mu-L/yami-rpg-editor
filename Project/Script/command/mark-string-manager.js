'use strict'

// ******************************** 标记字符串管理器 ********************************

const Token = (function IIFE() {
	const map = {
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

	// 获取定界符
	return (key) => map[key]
})()
