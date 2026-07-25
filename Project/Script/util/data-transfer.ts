DataTransfer.prototype.hideDragImage = (function IIFE() {
	const image = document.createElement('no-drag-image');
	return function () {
		this.setDragImage(image, 0, 0);
	};
})();
