import { Command } from './command-object.ts';
import { Token } from './mark-string-manager.ts';

// ******************************** 指令颜色函数 ********************************

// 设置普通颜色
Command.setNormalColor = function (value) {
	return `$_normal_$${value}$_/_$`;
};

// 设置变量颜色
Command.setVariableColor = function (value) {
	return `$_identifier_$${value}$_/_$`;
};

// 设置全局变量颜色
Command.setGlobalVariableColor = function (value) {
	return `$_global-var_$${value}$_/_$`;
};

// 设置定界符颜色
Command.setDelimiterColor = function (value) {
	return `$_delimiter_$${value}$_/_$`;
};

// 设置操作符颜色
Command.setOperatorColor = function (value) {
	return `$_operator_$${value}$_/_$`;
};

// 设置布尔值颜色
Command.setBooleanColor = function (value) {
	return `$_boolean_$${value}$_/_$`;
};

// 设置数值颜色
Command.setNumberColor = function (value) {
	if (typeof value) {
		value = value.toString();
	}
	if (value[0] !== '-') return `$_number_$${value}$_/_$`;
	return Token('-') + `$_number_$${value.slice(1)}$_/_$`;
};

// 设置字符串颜色
Command.setStringColor = function (value, save = false) {
	if (save === false) return `$_string_$${value}$_/_$`;
	return `$_string_$$_none_$$_/_$$_save_$$_none_$$_/_$${value}$_normal_$$_none_$$_/_$$_save_$$_none_$$_/_$`;
};

// 设置脚本颜色
Command.setScriptColor = function (value) {
	return `$_text_$${value}$_/_$`;
};

// 设置文件的颜色
Command.setFileColor = function (value) {
	return `$_file_$${value}$_/_$`;
};

// 设置预设对象的颜色
Command.setPresetColor = function (value) {
	return `$_preset_$${value}$_/_$`;
};

// 设置微弱的颜色
Command.setWeakColor = function (value) {
	return `$_weak_$${value}$_/_$`;
};

// 设置逗号颜色
Command.setCommaColors = (function IIFE() {
	const regexp = /,/g;
	return function (value) {
		return value.replace(regexp, '$_delimiter_$,$_/_$');
	};
})();

// 设置文本ID
Command.setTextId = function (id) {
	return `$_textId_$${id}$_/_$`;
};

// 设置工具提示
Command.setTooltip = function (tip) {
	return `$_tooltip_$${tip}$_/_$`;
};

// 设置自定义类名
(Command as any).setClass = function (className) {
	return `$_class_$${className}$_/_$`;
};
