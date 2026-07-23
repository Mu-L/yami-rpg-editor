// ******************************** 编辑器操作历史共用类型 ********************************

/**
 * 编辑器操作历史共用接口。
 *
 * 项目中 CommandHistory / NumberHistory / TextHistory / ParamListHistory /
 * ParamHistory 6 个 History 类重复实现同一组栈式 undo/redo 契约：
 *   stack / index / reset / save / restore / canUndo / canRedo
 * 此处提取为 IEditableHistory 基础接口，供各 History 类 implements 复用，
 * 消除字段重复声明与散落的 `history: any` / `owner.history: any` 耦合断言。
 *
 * 说明：未引入泛型化基类（避免改动 6 个已稳定运行的类继承链），
 * 仅以 interface 收敛类型契约，渐进式类型化下安全保守。
 */
export type HistoryOperation = 'undo' | 'redo';

/** 操作历史基础契约（栈式 undo/redo） */
export interface IEditableHistory {
	/** 历史栈 */
	stack: any[];
	/** 当前指针（-1 表示空） */
	index: number;
	/** 重置历史 */
	reset(): void;
	/** 保存数据 */
	save(data: any): void;
	/** 恢复数据（undo/redo） */
	restore(operation: any): void;
	/** 撤销条件判断 */
	canUndo(): boolean;
	/** 重做条件判断 */
	canRedo(): boolean;
}

/** 带容量上限的历史契约 */
export interface ICapacityHistory extends IEditableHistory {
	/** 堆栈上限 */
	capacity: number;
}

/**
 * 数组型历史契约（History extends Array，无独立 stack 字段，用 this[index] 直接访问）。
 *
 * 与 ICapacityHistory 区别：不要求 stack 字段（Array 子类自身即栈），
 * 供 tools/history.ts 的 History implements 复用。
 */
export interface IArrayHistory {
	/** 当前指针（-1 表示空） */
	index: number;
	/** 堆栈上限 */
	capacity: number;
	/** 重置历史 */
	reset(): void;
	/** 保存数据 */
	save(data: any): void;
	/** 恢复数据（undo/redo） */
	restore(operation: any): void;
	/** 撤销条件判断 */
	canUndo(): boolean;
	/** 重做条件判断 */
	canRedo(): boolean;
}

/** 带 owner 反向引用的历史契约（condition-list/event-list/property-list/script-list 共用） */
export interface IOwnedHistory extends IEditableHistory {
	/** 所属对象（反向引用，多数为 Editor/Window 子类） */
	owner: any | null;
}

/**
 * 历史数据基础契约。
 *
 * 各 History 类的 stack 元素都至少含 type 字段（'insert'/'replace'/'delete'/'toggle'/'custom'），
 * 用于 restore 分支判断。其余字段（array/index/items/commands/value 等）按场景扩展。
 */
export interface HistoryData {
	type: string;
	[key: string]: any;
}

/** toggle 类历史数据的 method 枚举（enable/disable） */
export type HistoryToggleMethod = 'enable' | 'disable';

/** toggle 类历史数据契约 */
export interface HistoryToggleData extends HistoryData {
	type: 'toggle';
	method: HistoryToggleMethod;
	items: any[];
}

/** insert/replace/delete 类历史数据的 operation 枚举 */
export type HistoryListOperation = 'insert' | 'replace' | 'delete' | 'toggle';
