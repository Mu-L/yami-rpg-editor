MouseEvent.prototype.getRelativeCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (element: HTMLElement): { x: number; y: number } {
		const rect = element.getBoundingClientRect();
		point.x = this.clientX - rect.left - element.clientLeft + element.scrollLeft;
		point.y = this.clientY - rect.top - element.clientTop + element.scrollTop;
		return point;
	};
})();
