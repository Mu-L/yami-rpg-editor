// ******************************** Empty State ********************************
// 列表/面板为空时的占位提示（通过 message / icon 属性配置）

export class EmptyState extends HTMLElement {
	connectedCallback() {
		if (this.querySelector('.empty-icon') == null) {
			this.innerHTML =
				'<div class="empty-icon">' +
				this._icon() +
				'</div>' +
				'<div class="empty-text"></div>';
		}
		this._render();
	}

	static get observedAttributes() {
		return ['message', 'icon'];
	}

	attributeChangedCallback() {
		if (this.querySelector('.empty-text') != null) {
			this._render();
		}
	}

	// 默认内联 SVG 图标（避免依赖外部资源与 emoji）
	_icon() {
		return (
			'<svg viewBox="0 0 24 24" width="48" height="48" ' +
			'fill="none" stroke="currentColor" stroke-width="1.5">' +
			'<rect x="3" y="4" width="18" height="16" rx="2"/>' +
			'<path d="M3 9h18"/></svg>'
		);
	}

	_render() {
		const iconAttr = this.getAttribute('icon');
		const msg =
			this.getAttribute('message') || this.getAttribute('label') || '';
		const iconEl = this.querySelector('.empty-icon');
		const textEl = this.querySelector('.empty-text');
		if (iconEl) {
			iconEl.innerHTML = iconAttr ? this._escape(iconAttr) : this._icon();
		}
		if (textEl) textEl.textContent = msg;
	}

	_escape(s: string): string {
		const d = document.createElement('div');
		d.textContent = s;
		return d.innerHTML;
	}

	// 设置提示文案
	setMessage(msg: string): void {
		this.setAttribute('message', msg);
	}
}

customElements.define('empty-state', EmptyState);

import path from 'node:path';
