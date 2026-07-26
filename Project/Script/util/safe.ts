import { Data } from '@/data/data-object.ts';

// 安全获取全局变量 注意：Data.variables 在部分阶段为 null（见 data-object.js），直接访问 Data.variables.map[key] 会抛 TypeError，故统一走此函数
export function getVariable(id: string | number | null | undefined): any {
	if (id == null) return undefined;
	return Data.variables?.map[id];
}

export function reportError(err: unknown, context?: string): void {
	let errStr: string;
	if (err instanceof Error) errStr = err.message;
	else if (typeof err === 'string') errStr = err;
	else errStr = JSON.stringify(err);
	const message = `[Yami] ${context ?? '运行时错误'}: ${errStr}`;
	console.error(message, err);
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent('yami:error', { detail: { message, error: err } }));
	}
}

// 防抖：延迟 delay 毫秒执行，期间重复调用会重置计时器 适用于搜索框等"输入停止后再处理"的场景，避免每次按键都全量重算 返回的函数带 cancel() 可主动取消待执行的调用
export function debounce<T extends (...args: any[]) => void>(
	fn: T,
	delay = 150
): T & { cancel(): void } {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const debounced = function (this: any, ...args: any[]) {
		if (timer !== undefined) clearTimeout(timer);
		timer = setTimeout(() => {
			timer = undefined;
			fn.apply(this, args);
		}, delay);
	} as T & { cancel(): void };
	debounced.cancel = function () {
		if (timer !== undefined) {
			clearTimeout(timer);
			timer = undefined;
		}
	};
	return debounced;
}

export function rafThrottle<T extends (...args: any[]) => void>(fn: T): T & { cancel(): void } {
	let handle: number | undefined;
	let lastArgs: any[];
	const throttled = function (this: any, ...args: any[]) {
		lastArgs = args;
		if (handle === undefined) {
			handle = requestAnimationFrame(() => {
				handle = undefined;
				fn.apply(this, lastArgs);
			});
		}
	} as T & { cancel(): void };
	throttled.cancel = function () {
		if (handle !== undefined) {
			cancelAnimationFrame(handle);
			handle = undefined;
		}
	};
	return throttled;
}
