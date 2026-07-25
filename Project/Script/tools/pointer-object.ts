// 使用 #cursor-region 来改变指针样式 可以避免更新所有子元素继承到指针属性, 从而提高性能 同时解决了一些元素无法继承指针样式的问题

import { $ } from '../util/dom.ts';
export const Cursor = {
	region: $('#cursor-region'),
	open: null,
	close: null
};

Cursor.open = function (className) {
	this.region.addClass(className);
};

Cursor.close = function (className) {
	this.region.removeClass(className);
};
