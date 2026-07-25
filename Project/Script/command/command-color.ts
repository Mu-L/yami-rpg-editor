import { Command } from './command-object.ts';
import { Token } from './mark-string-manager.ts';

Command.setNormalColor = function (value: any): string {
	return `$_normal_$${value}$_/_$`;
};

Command.setVariableColor = function (value: any): string {
	return `$_identifier_$${value}$_/_$`;
};

Command.setGlobalVariableColor = function (value: any): string {
	return `$_global-var_$${value}$_/_$`;
};

Command.setDelimiterColor = function (value: any): string {
	return `$_delimiter_$${value}$_/_$`;
};

Command.setOperatorColor = function (value: any): string {
	return `$_operator_$${value}$_/_$`;
};

Command.setBooleanColor = function (value: any): string {
	return `$_boolean_$${value}$_/_$`;
};

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

Command.setStringColor = function (value: any, save: boolean = false): string {
	if (save === false) return `$_string_$${value}$_/_$`;
	return `$_string_$$_none_$$_/_$$_save_$$_none_$$_/_$${value}$_normal_$$_none_$$_/_$$_save_$$_none_$$_/_$`;
};

Command.setScriptColor = function (value: any): string {
	return `$_text_$${value}$_/_$`;
};

Command.setFileColor = function (value: any): string {
	return `$_file_$${value}$_/_$`;
};

Command.setPresetColor = function (value: any): string {
	return `$_preset_$${value}$_/_$`;
};

Command.setWeakColor = function (value: any): string {
	return `$_weak_$${value}$_/_$`;
};

Command.setCommaColors = (function IIFE() {
	const regexp = /,/g;
	return function (value: string): string {
		return value.replace(regexp, '$_delimiter_$,$_/_$');
	};
})();

Command.setTextId = function (id: any): string {
	return `$_textId_$${id}$_/_$`;
};

Command.setTooltip = function (tip: any): string {
	return `$_tooltip_$${tip}$_/_$`;
};

Command.setClass = function (className: string): string {
	return `$_class_$${className}$_/_$`;
};
