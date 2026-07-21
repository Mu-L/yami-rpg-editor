import { Data } from '../data/data-object.ts';
import { Toast } from '../components/toast.ts';

// ******************************** 安全访问 ********************************

// 安全获取全局变量
// 注意：Data.variables 在部分阶段为 null（见 data-object.js），
// 直接访问 Data.variables.map[key] 会抛 TypeError，故统一走此函数
export function getVariable(id) {
	if (id == null) return undefined;
	return Data.variables?.map[id];
}

// 统一错误上报：控制台可见 + 派发解耦事件
// 后续 P1 的 Toast 组件（计划中的反馈类 UX）可监听 'yami:error' 事件展示用户可见错误
export function reportError(err, context) {
	const message = `[Yami] ${context ?? '运行时错误'}: ${err?.message ?? err}`;
	console.error(message, err);
	if (typeof window !== 'undefined') {
		window.dispatchEvent(
			new CustomEvent('yami:error', { detail: { message, error: err } })
		);
	}
}

// ******************************** 输入节流 ********************************

// 防抖：延迟 delay 毫秒执行，期间重复调用会重置计时器
// 适用于搜索框等"输入停止后再处理"的场景，避免每次按键都全量重算
// 返回的函数带 cancel() 可主动取消待执行的调用
export function debounce(fn, delay = 150) {
	let timer;
	const debounced = function (...args) {
		if (timer !== undefined) clearTimeout(timer);
		timer = setTimeout(() => {
			timer = undefined;
			fn.apply(this, args);
		}, delay);
	};
	debounced.cancel = function () {
		if (timer !== undefined) {
			clearTimeout(timer);
			timer = undefined;
		}
	};
	return debounced;
}

// rAF 节流：同一帧内的多次调用只在下一帧执行最后一次
// 适用于滚动/拖动/连续输入等每帧至多重渲染一次的场景
export function rafThrottle(fn) {
	let handle;
	let lastArgs;
	const throttled = function (...args) {
		lastArgs = args;
		if (handle === undefined) {
			handle = requestAnimationFrame(() => {
				handle = undefined;
				fn.apply(this, lastArgs);
			});
		}
	};
	throttled.cancel = function () {
		if (handle !== undefined) {
			cancelAnimationFrame(handle);
			handle = undefined;
		}
	};
	return throttled;
}
