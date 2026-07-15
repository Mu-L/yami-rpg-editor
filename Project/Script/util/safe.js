'use strict'

// ******************************** 安全访问 ********************************

// 安全获取全局变量
// 注意：Data.variables 在部分阶段为 null（见 data-object.js），
// 直接访问 Data.variables.map[key] 会抛 TypeError，故统一走此函数
function getVariable(id) {
	if (id == null) return undefined
	return Data.variables?.map[id]
}

// 统一错误上报：控制台可见 + 派发解耦事件
// 后续 P1 的 Toast 组件（计划中的反馈类 UX）可监听 'yami:error' 事件展示用户可见错误
function reportError(err, context) {
	const message = `[Yami] ${context ?? '运行时错误'}: ${err?.message ?? err}`
	console.error(message, err)
	if (typeof window !== 'undefined') {
		window.dispatchEvent(
			new CustomEvent('yami:error', { detail: { message, error: err } })
		)
	}
}
