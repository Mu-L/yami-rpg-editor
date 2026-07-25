// 指针事件方法 - 判断是否为鼠标类型 PointerEvent.prototype.isMouseType = function () { return this.pointerType === 'mouse' }

PointerEvent.prototype.relate = function (this: PointerEvent, event: PointerEvent): boolean {
	return this.pointerId === event.pointerId;
};
