import { Command } from './command-object.ts';
import { Local } from '../tools/localization.ts';

// ******************************** 标记字符串管理器 ********************************

let _tokenMap: Record<string, string> | null = null;
function buildTokenMap(): Record<string, string> {
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
			return Command.setBooleanColor(Local.get('common.none'));
		},
		get null() {
			return Command.setBooleanColor(Local.get('common.null'));
		}
	};
}

export const Token = (key: string): string => {
	if (!_tokenMap) _tokenMap = buildTokenMap();
	return _tokenMap[key];
};
