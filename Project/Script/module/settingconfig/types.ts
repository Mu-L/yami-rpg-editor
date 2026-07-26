// ============================ Schema 类型定义 ============================
// 通过对象配置描述设置页：每个选项声明类型/默认值/校验/回调等属性，
// 渲染引擎据此动态生成 UI、绑定事件、写入值，新增选项只需扩展 schema。

/** 设置项控件类型 */
export type SettingType = 'text' | 'number' | 'checkbox' | 'select';

/** 传给 optionsFn 的上下文：提供 i18n getter 与当前 config，便于生成下拉项 */
export interface OptionContext {
	get: (key: string) => string;
	config: any;
}

/** 下拉选项 */
export interface SelectItem {
	name: string;
	value: any;
}

/** 单个设置项的配置定义 */
export interface SettingOption {
	/** config 中的键名，如 "port" */
	key: string;
	/** 控件类型 */
	type: SettingType;
	/** 默认值 */
	default: any;
	/** 自定义 DOM id（默认 setting-{sectionPath...}-{key}） */
	id?: string;
	/** 不渲染 UI，仅参与默认值生成（如 apkPath/isSign 这类被其他模块依赖的隐藏配置） */
	hidden?: boolean;
	/** number: 最小值 */
	min?: number;
	/** number: 最大值 */
	max?: number;
	/** number: 步长 */
	step?: number;
	/** select: 选项生成函数（可异步，支持动态/远程选项） */
	optionsFn?: (ctx: OptionContext) => SelectItem[] | Promise<SelectItem[]>;
	/** 校验函数：返回 null 表示通过，返回字符串表示错误信息 */
	validate?: (value: any, config: any) => string | null;
	/** 变更回调：值变化时触发（config 已更新） */
	onChange?: (value: any, config: any) => void;
	/** 动态路径提示：鼠标悬停时显示 ApkBuilder.processPathOnly 处理后的路径 */
	tooltipPath?: boolean;
	/** 命名标签的 properties 键（仅 recent/update 等不在 components 中的项需要） */
	labelKey?: string;
	/** 命名标签的 DOM id */
	labelId?: string;
	/** 命名标签的兜底文案 */
	labelFallback?: string;
}

/** 设置分组（支持 subgroups 嵌套，满足复杂设置页需求） */
export interface SettingSection {
	/** config 中的分组键，如 "server" */
	id: string;
	/** 分组标题的 properties 键（仅 recent/update 需要，其余走 components） */
	titleKey?: string;
	/** 分组标题兜底文案 */
	titleFallback?: string;
	/** 该分组下的设置项 */
	options: SettingOption[];
	/** 嵌套子分组 */
	subgroups?: SettingSection[];
}
