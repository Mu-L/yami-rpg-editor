//import { CommandSchema } from '../module/command/schema.ts';
import { Inspector } from '../inspector/inspector.ts';

// ******************************** 指令对象 ********************************

// Command 是中央属性袋：大量字段以 null 起步，由 command-parse / command-color /
// command-custom / command-tip 等模块在加载后动态挂载。
// 为避免在后续文件中赋值时类型报错，所有方法字段统一声明为可空函数类型。

type CommandMethod = ((...args: any[]) => any) | null;

export const Command: {
	target: any;
	id: any;
	words: any;
	invalid: boolean;
	saveVars: boolean;
	returnType: string;
	eventName: string;
	eventIndex: number;
	variables: any[];
	varMap: Record<string, any>;
	dependsOn: string[];
	currentCommand: any;
	setClass: ((className: string) => string) | null;
	initialize: CommandMethod;
	insert: CommandMethod;
	edit: CommandMethod;
	open: CommandMethod;
	save: CommandMethod;
	parse: CommandMethod;
	parseNone: CommandMethod;
	parseBlend: CommandMethod;
	fetchVariables: CommandMethod;
	parseVariable: CommandMethod;
	parseGlobalVariable: CommandMethod;
	parseAttributeGroup: CommandMethod;
	parseAttributeKey: CommandMethod;
	parseAttributeTag: CommandMethod;
	parseVariableTag: CommandMethod;
	parseVariableNumber: CommandMethod;
	parseVariableString: CommandMethod;
	parseVariableTemplate: CommandMethod;
	parseVariableAttr: CommandMethod;
	parseVariableEnum: CommandMethod;
	parseVariableFile: CommandMethod;
	parseVariableTeam: CommandMethod;
	parseMultiLineString: CommandMethod;
	parseSpriteName: CommandMethod;
	parseEventType: CommandMethod;
	parseEnumGroup: CommandMethod;
	parseEnumString: CommandMethod;
	parseEnumStringTag: CommandMethod;
	parseGroupEnumString: CommandMethod;
	parseListItem: CommandMethod;
	parseParameter: CommandMethod;
	parseActor: CommandMethod;
	parseSkill: CommandMethod;
	parseState: CommandMethod;
	parseEquipment: CommandMethod;
	parseItem: CommandMethod;
	parsePosition: CommandMethod;
	parseAngle: CommandMethod;
	parseTrigger: CommandMethod;
	parseLight: CommandMethod;
	parseRegion: CommandMethod;
	parseTilemap: CommandMethod;
	parseObject: CommandMethod;
	parseElement: CommandMethod;
	parsePresetObject: CommandMethod;
	parsePresetElement: CommandMethod;
	parseTeam: CommandMethod;
	parseHexColor: CommandMethod;
	parseActorSelector: CommandMethod;
	parseFileName: CommandMethod;
	parseAudioType: CommandMethod;
	parseWait: CommandMethod;
	parseEasing: CommandMethod;
	parseUnlinkedId: CommandMethod;
	parseTextTags: CommandMethod;
	removeTextTags: CommandMethod;
	setNormalColor: CommandMethod;
	setVariableColor: CommandMethod;
	setGlobalVariableColor: CommandMethod;
	setDelimiterColor: CommandMethod;
	setOperatorColor: CommandMethod;
	setBooleanColor: CommandMethod;
	setNumberColor: CommandMethod;
	setStringColor: CommandMethod;
	setScriptColor: CommandMethod;
	setFileColor: CommandMethod;
	setPresetColor: CommandMethod;
	setWeakColor: CommandMethod;
	setCommaColors: CommandMethod;
	setTextId: CommandMethod;
	setTooltip: CommandMethod;
	setInvalid: CommandMethod;
	forEachCommand: CommandMethod;
	WordList: any;
	cases: Record<string, any>;
	custom: any;
} = {
	// properties
	target: null,
	id: null,
	words: null,
	invalid: false,
	saveVars: false,
	returnType: '',
	eventName: '',
	eventIndex: 0,
	variables: [],
	varMap: {},
	dependsOn: ['Inspector'],
	// runtime 挂载: command-parse.ts 中赋值当前正在解析的指令上下文
	currentCommand: null,
	// runtime 挂载: command-color.ts 中挂载类名染色函数
	setClass: null,
	// methods
	initialize: null,
	insert: null,
	edit: null,
	open: null,
	save: null,
	parse: null,
	parseNone: null,
	parseBlend: null,
	fetchVariables: null,
	parseVariable: null,
	parseGlobalVariable: null,
	parseAttributeGroup: null,
	parseAttributeKey: null,
	parseAttributeTag: null,
	parseVariableTag: null,
	parseVariableNumber: null,
	parseVariableString: null,
	parseVariableTemplate: null,
	parseVariableAttr: null,
	parseVariableEnum: null,
	parseVariableFile: null,
	parseVariableTeam: null,
	parseMultiLineString: null,
	parseSpriteName: null,
	parseEventType: null,
	parseEnumGroup: null,
	parseEnumString: null,
	parseEnumStringTag: null,
	parseGroupEnumString: null,
	parseListItem: null,
	parseParameter: null,
	parseActor: null,
	parseSkill: null,
	parseState: null,
	parseEquipment: null,
	parseItem: null,
	parsePosition: null,
	parseAngle: null,
	parseTrigger: null,
	parseLight: null,
	parseRegion: null,
	parseTilemap: null,
	parseObject: null,
	parseElement: null,
	parsePresetObject: null,
	parsePresetElement: null,
	parseTeam: null,
	parseHexColor: null,
	parseActorSelector: null,
	parseFileName: null,
	parseAudioType: null,
	parseWait: null,
	parseEasing: null,
	parseUnlinkedId: null,
	parseTextTags: null,
	removeTextTags: null,
	setNormalColor: null,
	setVariableColor: null,
	setGlobalVariableColor: null,
	setDelimiterColor: null,
	setOperatorColor: null,
	setBooleanColor: null,
	setNumberColor: null,
	setStringColor: null,
	setScriptColor: null,
	setFileColor: null,
	setPresetColor: null,
	setWeakColor: null,
	setCommaColors: null,
	setTextId: null,
	setTooltip: null,
	setInvalid: null,
	forEachCommand: null,
	// classes
	WordList: null,
	// objects
	cases: {} as Record<string, any>,
	custom: null
};

// 委托到 CommandSchema 静态分发
// （CommandSchema 导入在此文件顶部被注释掉以避免循环依赖;
//  实际 initialize / insert / open / edit / save / parse 的绑定
//  发生在 module/command/schema.ts 加载之后。）
// Command.initialize = CommandSchema.initAll;
// Command.insert = CommandSchema.insert;
// Command.open = CommandSchema.open;
// Command.edit = CommandSchema.edit;
// Command.save = CommandSchema.save;
// Command.parse = CommandSchema.parse;

// 显示文本
// Command.cases.showText extracted -> module/command/showText.js
