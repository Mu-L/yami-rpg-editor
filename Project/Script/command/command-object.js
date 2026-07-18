'use strict'
import { CommandSchema } from '../module/command/schema.js'
import { Inspector } from '../inspector/inspector.js'

// ******************************** 指令对象 ********************************

export const Command = {
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
	cases: {},
	custom: null
}

// 委托到 CommandSchema 静态分发
Command.initialize = CommandSchema.initAll
Command.insert = CommandSchema.insert
Command.open = CommandSchema.open
Command.edit = CommandSchema.edit
Command.save = CommandSchema.save
Command.parse = CommandSchema.parse

// 显示文本
// Command.cases.showText extracted -> module/command/showText.js
