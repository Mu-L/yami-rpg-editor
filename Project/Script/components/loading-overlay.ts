// ******************************** Loading 遮罩 ********************************
// 长任务进度反馈；支持嵌套（多次 show 需对应多次 hide）

export class LoadingOverlay extends HTMLElement {
	constructor() {
		super();
		this._count = 0;
	}

	connectedCallback() {
		if (this.querySelector('.loading-spinner') == null) {
			this.innerHTML =
				'<div class="loading-spinner"></div>' +
				'<div class="loading-text"></div>';
		}
	}

	// 设置提示文字
	setText(text) {
		const t = this.querySelector('.loading-text');
		if (t) t.textContent = text || '';
	}

	// 显示遮罩
	show(text) {
		this.setText(text);
		this._count++;
		this.classList.add('visible');
	}

	// 隐藏遮罩（嵌套计数归零才真正隐藏）
	hide() {
		this._count = Math.max(0, this._count - 1);
		if (this._count === 0) {
			this.classList.remove('visible');
		}
	}
}

customElements.define('loading-overlay', LoadingOverlay);

// 全局便捷接口
export const Loading = {
	_el() {
		let el = document.querySelector('loading-overlay');
		if (!el) {
			el = document.createElement('loading-overlay');
			document.body.appendChild(el);
		}
		return el;
	},
	show(text) {
		this._el().show(text);
	},
	hide() {
		this._el().hide();
	},
	setText(text) {
		this._el().setText(text);
	}
};
