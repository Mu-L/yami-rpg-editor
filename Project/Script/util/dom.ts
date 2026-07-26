// 测量文本大小（带缓存，避免重复强制重排）
export const measureText = (function IIFE() {
	const size = { width: 0, lines: 0 };
	const container = document.createElement('text');
	let appended = false;
	let usedFont = '';
	let lineHeight = 0;
	container.style.whiteSpace = 'pre';
	// 缓存：key = font + ' ' + text -> { width, lines } 仅缓存较短文本（标签/单位/字符宽度等），避免长动态文本撑大缓存
	const cache = new Map<string, { width: number; lines: number }>();
	const MAX_CACHE = 4096;
	const MAX_CACHE_TEXT = 256;
	return function (text: string, font = ''): { width: number; lines: number } {
		const cacheable = text.length <= MAX_CACHE_TEXT;
		const key = font + ' ' + text;
		const cached = cacheable ? cache.get(key) : undefined;
		if (cached) {
			size.width = cached.width;
			size.lines = cached.lines;
			return size;
		}
		if (appended === false) {
			appended = true;
			document.body.appendChild(container);
			container.textContent = 'a';
			lineHeight = container.offsetHeight;
			void Promise.resolve().then(() => {
				appended = false;
				container.textContent = '';
				container.remove();
			});
		}
		if (usedFont !== font) {
			usedFont = font;
			container.style.fontFamily = font ?? '';
		}
		container.textContent = text;
		size.width = container.offsetWidth;
		size.lines = container.offsetHeight / lineHeight;
		if (cacheable) {
			if (cache.size >= MAX_CACHE) cache.clear();
			cache.set(key, { width: size.width, lines: size.lines });
		}
		return size;
	};
})();

export const request = (function IIFE() {
	const callbacks: (() => void)[] = [];
	return function (callback: () => void): void {
		if (callbacks.append(callback)) {
			requestAnimationFrame(() => {
				if (callbacks.remove(callback)) {
					callback();
				}
			});
		}
	};
})();

// CSS 选择器 注：返回 any 而非 Element | NodeListOf<Element>，因为调用方常访问 HTMLElement 扩展成员（.read/.write/.on/.onDelete 等，见 global.d.ts）
export const $ = (function IIFE() {
	const regexp = /^#(\w|-)+$/;
	return function (selector: string): any {
		if (regexp.test(selector)) {
			return document.querySelector(selector);
		} else {
			return document.querySelectorAll(selector);
		}
	};
})();

export const getElementReader = function (prefix: string) {
	return function (suffix: string): any {
		return $(`#${prefix}-${suffix}`).read();
	};
};

export const getElementWriter = function (prefix: string, bindingObject?: Record<string, any>) {
	return function (suffix: string | number, value?: any): void {
		if (value === undefined) {
			const nodes = typeof suffix === 'string' ? suffix.split('-') : [suffix];
			value = bindingObject;
			for (const node of nodes) {
				value = value[node];
			}
		}
		($(`#${prefix}-${suffix}`) as HTMLElement).write(value);
	};
};
