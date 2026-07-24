// ******************************** 编辑器列表接口共用类型 ********************************

/**
 * 编辑器列表接口共用类型。
 *
 * condition-list / event-list / property-list / script-list 4 个 *ListInterface
 * 类重复实现同一组字段契约：
 *   target / type / editor / owner / history / initialize(list)
 * 此处提取为 IListInterface 基础接口，供各 ListInterface 类 implements 复用，
 * 消除散落的 `editor: any | null` / `owner: any | null` / `history: any | null` 耦合断言。
 */
import { IEditableHistory } from './history.ts';

/** 列表接口基础契约（4 个 *ListInterface 类共用） */
export interface IListInterface {
	/** 当前目标元素 */
	target: HTMLElement | null;
	/** 接口类型标识（'condition'/'event'/'property'/'script'） */
	type: string;
	/** 所属编辑器（反向引用，多数为 Editor/Window 子类） */
	editor: any | null;
	/** 所属对象（反向引用，多数为 Window/Inspector 子类） */
	owner: any | null;
	/** 操作历史（运行时由 initialize 创建，故初始 null） */
	history: IEditableHistory | null;
	/** 初始化 */
	initialize(list: HTMLElement): void;
}

/** 带 filter 字段的列表接口契约（script-list/property-list 共用） */
export interface IFilteredListInterface extends IListInterface {
	/** 过滤器标识 */
	filter: string;
}

/** 带 script 字段的列表接口契约（script-list 专用） */
export interface IScriptListInterface extends IFilteredListInterface {
	/** 当前脚本对象 */
	script: any | null;
}
