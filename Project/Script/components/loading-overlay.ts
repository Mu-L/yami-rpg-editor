// 长任务进度反馈；支持嵌套（多次 show 需对应多次 hide）

export class LoadingOverlay extends HTMLElement {
	_count: number;

	constructor() {
		super();
		this._count = 0;
	}

	connectedCallback() {
		if (this.querySelector('.loading-spinner') == null) {
			this.innerHTML =
				'<div class="loading-spinner"></div>' + '<div class="loading-text"></div>';
		}
	}

	setText(text: string): void {
		const t = this.querySelector('.loading-text');
		if (t) t.textContent = text || '';
	}

	show(text?: string): void {
		this.setText(text ?? '');
		this._count++;
		this.classList.add('visible');
	}

	hide(): void {
		this._count = Math.max(0, this._count - 1);
		if (this._count === 0) {
			this.classList.remove('visible');
		}
	}
}

customElements.define('loading-overlay', LoadingOverlay as CustomElementConstructor);

export const Loading = {
	_el(): LoadingOverlay {
		let el = document.querySelector('loading-overlay');
		if (!el) {
			el = document.createElement('loading-overlay');
			document.body.appendChild(el);
		}
		return el as LoadingOverlay;
	},
	show(text?: string): void {
		this._el().show(text);
	},
	hide(): void {
		this._el().hide();
	},
	setText(text: string): void {
		this._el().setText(text);
	}
};
