// 编辑器高频事件联合类型。 替代渲染进程中大量 `(event: any) => void` 形参残留（131 处）， 在保留 HTMLElement 子类协变契约的同时收敛为精确类型。 说明：Event.prototype 在 util/event-accessors.ts 已扩展 dragKey/cmdOrCtrlKey/macRedoKey， 此处通过 interface 声明合并补全访问器，避免在各调用方重复 `as any` 断言。
export type EditorEvent =
	| KeyboardEvent
	| MouseEvent
	| PointerEvent
	| DragEvent
	| WheelEvent
	| InputEvent
	| Event;

export interface EventExtension {
	readonly dragKey: boolean;
	readonly cmdOrCtrlKey: boolean;
	readonly macRedoKey: boolean;
}

// 合并扩展后的 Event（声明合并，供需要扩展访问器的形参使用）
export type ExtendedEvent = Event & EventExtension;

export type ExtendedKeyboardEvent = KeyboardEvent & EventExtension;

export type ExtendedMouseEvent = MouseEvent & EventExtension;

export type ExtendedPointerEvent = PointerEvent & EventExtension;

export type ExtendedDragEvent = DragEvent & EventExtension;
