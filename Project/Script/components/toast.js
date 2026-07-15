'use strict'

// ******************************** Toast ********************************
// 轻量用户可见提示，接入 reportError 派发的 'yami:error' 事件

class ToastManager extends HTMLElement {
	// 显示一条提示
	show(message, type = 'info', duration = 4000) {
		const el = document.createElement('div')
		el.className = `toast toast-${type}`
		const text = document.createElement('span')
		text.className = 'toast-text'
		text.textContent = message
		const close = document.createElement('span')
		close.className = 'toast-close'
		close.textContent = '×'
		close.on('click', () => this.dismiss(el))
		el.appendChild(text)
		el.appendChild(close)
		this.appendChild(el)
		// 进场动画
		requestAnimationFrame(() => el.classList.add('toast-show'))
		if (duration > 0) {
			el._timer = setTimeout(() => this.dismiss(el), duration)
		}
		return el
	}

	// 关闭一条提示
	dismiss(el) {
		if (!el || el.parentNode !== this) return
		clearTimeout(el._timer)
		el.classList.remove('toast-show')
		el.classList.add('toast-hide')
		setTimeout(() => el.remove(), 200)
	}
}

customElements.define('toast-manager', ToastManager)

// 全局便捷接口
const Toast = {
	_manager() {
		let m = document.querySelector('toast-manager')
		if (!m) {
			m = document.createElement('toast-manager')
			document.body.appendChild(m)
		}
		return m
	},
	show(message, type, duration) {
		return this._manager().show(message, type, duration)
	},
	error(message) {
		return this.show(message, 'error')
	},
	info(message) {
		return this.show(message, 'info')
	},
	success(message) {
		return this.show(message, 'success')
	}
}

// 接入上一步的 reportError：将全局错误事件转为用户可见的 Toast
window.addEventListener('yami:error', (event) => {
	const detail = event.detail || {}
	Toast.error(detail.message || String(event.detail))
})
