import { Command } from './command-object.ts';
import { Token } from './mark-string-manager.ts';

// ******************************** 指令颜色函数 ********************************

// 设置普通颜色
Command.setNormalColor = function (value: any): string {
	return `$_normal_$${value}$_/_$`;
};

// 设置变量颜色
Command.setVariableColor = function (value: any): string {
	return `$_identifier_$${value}$_/_$`;
};

// 设置全局变量颜色
Command.setGlobalVariableColor = function (value: any): string {
	return `$_global-var_$${value}$_/_$`;
};

// 设置定界符颜色
Command.setDelimiterColor = function (value: any): string {
	return `$_delimiter_$${value}$_/_$`;
};

// 设置操作符颜色
Command.setOperatorColor = function (value: any): string {
	return `$_operator_$${value}$_/_$`;
};

// 设置布尔值颜色
Command.setBooleanColor = function (value: any): string {
	return `$_boolean_$${value}$_/_$`;
};

// 设置数值颜色
Command.setNumberColor = function (value: number | string): string {
	let v: string;
	if (typeof value === 'number') {
		v = value.toString();
	} else {
		v = value;
	}
	if (v[0] !== '-') return `$_number_$${v}$_/_$`;
	return Token('-') + `$_number_$${v.slice(1)}$_/_$`;
};

// 设置字符串颜色
Command.setStringColor = function (value: any, save: boolean = false): string {
	if (save === false) return `$_string_$${value}$_/_$`;
	return `$_string_$$_none_$$_/_$$_save_$$_none_$$_/_$${value}$_normal_$$_none_$$_/_$$_save_$$_none_$$_/_$`;
};

// 设置脚本颜色
Command.setScriptColor = function (value: any): string {
	return `$_text_$${value}$_/_$`;
};

// 设置文件的颜色
Command.setFileColor = function (value: any): string {
	return `$_file_$${value}$_/_$`;
};

// 设置预设对象的颜色
Command.setPresetColor = function (value: any): string {
	return `$_preset_$${value}$_/_$`;
};

// 设置微弱的颜色
Command.setWeakColor = function (value: any): string {
	return `$_weak_$${value}$_/_$`;
};

// 设置逗号颜色
Command.setCommaColors = (function IIFE() {
	const regexp = /,/g;
	return function (value: string): string {
		return value.replace(regexp, '$_delimiter_$,$_/_$');
	};
})();

// 设置文本ID
Command.setTextId = function (id: any): string {
	return `$_textId_$${id}$_/_$`;
};

// 设置工具提示
Command.setTooltip = function (tip: any): string {
	return `$_tooltip_$${tip}$_/_$`;
};

// 设置自定义类名
Command.setClass = function (className: string): string {
	return `$_class_$${className}$_/_$`;
};
