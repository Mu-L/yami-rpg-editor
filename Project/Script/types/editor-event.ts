// ******************************** 编辑器事件共用类型 ********************************

/**
 * 编辑器高频事件联合类型。
 *
 * 替代渲染进程中大量 `(event: any) => void` 形参残留（131 处），
 * 在保留 HTMLElement 子类协变契约的同时收敛为精确类型。
 *
 * 说明：Event.prototype 在 util/event-accessors.ts 已扩展 dragKey/cmdOrCtrlKey/macRedoKey，
 * 此处通过 interface 声明合并补全访问器，避免在各调用方重复 `as any` 断言。
 */
export type EditorEvent =
	| KeyboardEvent
	| MouseEvent
	| PointerEvent
	| DragEvent
	| WheelEvent
	| InputEvent
	| Event;

/** Event.prototype 扩展访问器（与 util/event-accessors.ts 运行时 defineProperties 对齐） */
export interface EventExtension {
	/** Space 或 Alt 任一组合键按下（拖拽约束） */
	readonly dragKey: boolean;
	/** macOS 为 metaKey，其他平台为 ctrlKey */
	readonly cmdOrCtrlKey: boolean;
	/** macOS 为 metaKey+shiftKey+KeyZ，其他平台固定 false */
	readonly macRedoKey: boolean;
}

/** 合并扩展后的 Event（声明合并，供需要扩展访问器的形参使用） */
export type ExtendedEvent = Event & EventExtension;

/** 合并扩展后的 KeyboardEvent（高频快捷键事件形参） */
export type ExtendedKeyboardEvent = KeyboardEvent & EventExtension;

/** 合并扩展后的 MouseEvent（高频点击/拖拽事件形参） */
export type ExtendedMouseEvent = MouseEvent & EventExtension;

/** 合并扩展后的 PointerEvent（高频指针事件形参） */
export type ExtendedPointerEvent = PointerEvent & EventExtension;

/** 合并扩展后的 DragEvent（高频拖放事件形参） */
export type ExtendedDragEvent = DragEvent & EventExtension;
